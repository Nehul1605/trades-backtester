import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import VerificationRequest from "../models/VerificationRequest.js";
import protect from "../middleware/auth.js";
import { sendEmail } from "../config/email.js";

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Helper to initialize Razorpay SDK
const getRazorpayInstance = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not defined in the backend environment");
  }
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

let cachedRate = null;
let cacheTime = null;

const getLiveExchangeRate = async () => {
  const now = Date.now();
  // Cache for 1 hour to avoid hitting API rate limits
  if (cachedRate && cacheTime && (now - cacheTime < 60 * 60 * 1000)) {
    return cachedRate;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("Failed to fetch exchange rate");
    const data = await res.json();
    if (data && data.rates && data.rates.INR) {
      cachedRate = parseFloat(data.rates.INR);
      cacheTime = now;
      console.log(`[Exchange Rate] Fetched live rate: ${cachedRate}`);
      return cachedRate;
    }
  } catch (error) {
    console.error("Exchange rate fetch error, falling back to 95.5:", error);
  }
  return parseFloat(process.env.USD_TO_INR_RATE || "95.5");
};

// @desc    Get live USD to INR exchange rate and calculated prices
// @route   GET /api/payments/exchange-rate
// @access  Private
router.get("/exchange-rate", protect, async (req, res) => {
  try {
    const rate = await getLiveExchangeRate();
    res.json({
      rate,
      monthlyInr: Math.round(8.99 * rate),
      annualInr: Math.round(99 * rate)
    });
  } catch (error) {
    console.error("Get exchange-rate route error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Create Razorpay payment order
// @route   POST /api/payments/create-order
// @access  Private
// @route   POST /api/payments/create-order
router.post("/create-order", protect, async (req, res) => {
  const { planType, customerPhone, customerName, currency = "INR" } = req.body;

  if (!planType || !customerPhone || !customerName) {
    return res.status(400).json({ error: "Please provide planType, name, and phone" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const baseUsdAmount = planType === "annual" ? 99 : 8.99;
    let amountInPaise = 0;

    if (currency === "USD") {
      // Direct USD calculation: base amount * 1.18 * 100 (in cents)
      amountInPaise = Math.round(baseUsdAmount * 1.18 * 100);
    } else {
      // INR calculation: base amount * conversion rate * 1.18 * 100 (in paise)
      const conversionRate = await getLiveExchangeRate();
      const baseAmountPaise = Math.round(baseUsdAmount * conversionRate * 100);
      amountInPaise = Math.round(baseAmountPaise * 1.18);
    }

    const rzp = getRazorpayInstance();
    const receiptId = `receipt_${req.userId}_${Date.now()}`;

    console.log(`[Razorpay] Creating Order (${currency}): ${receiptId}, amount: ${amountInPaise}`);

    const options = {
      amount: amountInPaise,
      currency: currency === "USD" ? "USD" : "INR",
      receipt: receiptId,
    };

    const order = await rzp.orders.create(options);

    // Create a pending transaction record
    await Transaction.create({
      user: req.userId,
      orderId: order.id,
      amount: amountInPaise / 100, // store in standard unit (USD dollars or INR rupees)
      currency: currency === "USD" ? "USD" : "INR",
      planType,
      status: "PENDING",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ error: error.message || "Failed to initiate Razorpay order" });
  }
});

// @desc    Verify payment signature
// @route   POST /api/payments/verify-signature
// @access  Private
router.post("/verify-signature", protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing required signature verification fields" });
  }

  try {
    // Generate signature locally using HMAC-SHA256
    const dataToVerify = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(dataToVerify)
      .digest("hex");

    const isMatched = expectedSignature === razorpay_signature;

    const transaction = await Transaction.findOne({ orderId: razorpay_order_id });
    if (!transaction) {
      return res.status(404).json({ error: "Associated transaction not found" });
    }

    if (!isMatched) {
      console.warn(`[Razorpay] Signature mismatch for order: ${razorpay_order_id}`);
      transaction.status = "FAILED";
      await transaction.save();
      return res.status(400).json({ error: "Payment verification failed. Signature mismatch." });
    }

    console.log(`[Razorpay] Signature verified successfully. Order ID: ${razorpay_order_id}`);

    // Update transaction to PAID
    transaction.status = "PAID";
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    await transaction.save();

    // Calculate subscription validity expiration
    const validityDays = transaction.planType === "annual" ? 365 : 30;
    const premiumExpiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    // Upgrade user parameters
    const targetUser = await User.findByIdAndUpdate(
      transaction.user,
      {
        isPremiumUser: true,
        premiumExpiresAt,
        status: "approved", // Bypass gate
      },
      { new: true }
    );

    // Send confirmation email
    if (targetUser && targetUser.email) {
      try {
        const totalAmount = transaction.amount;
        const subtotalAmount = Math.round((totalAmount / 1.18) * 100) / 100;
        const gstAmount = Math.round((totalAmount - subtotalAmount) * 100) / 100;

        const symbol = transaction.currency === "USD" ? "$" : "₹";
        const locale = transaction.currency === "USD" ? "en-US" : "en-IN";

        const totalString = `${symbol}${totalAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const subtotalString = `${symbol}${subtotalAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const gstString = `${symbol}${gstAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const planName = transaction.planType === "annual" ? "Annual Premium Plan" : "Monthly Premium Plan";

        await sendEmail({
          to: targetUser.email,
          subject: `👑 TradeTracker Pro Subscription Confirmed - ${transaction.planType === "annual" ? "Annual" : "Monthly"}`,
          text: `Hi ${targetUser.name || "there"},\n\nThank you for upgrading to TradeTracker Pro Premium! Your payment was verified successfully.\n\nPlan: ${planName}\nTotal Paid: ${totalString} (Subtotal: ${subtotalString}, Platform Fee 18%: ${gstString})\nActive until: ${premiumExpiresAt.toLocaleDateString()}\n\nAccess Dashboard: ${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard\n\nBest regards,\nThe TradeTracker Pro Team`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070708; padding: 40px 15px; color: #f2f2f7; line-height: 1.6;">
              <div style="max-width: 550px; margin: 0 auto; background-color: #0d0d0f; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); border: 1px solid #1f1f24;">
                
                <!-- Logo Header -->
                <div style="background-color: #0d0d0f; padding: 30px; text-align: center; border-bottom: 1px solid #1f1f24;">
                  <h1 style="margin: 0; color: #c5a880; font-size: 22px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">TRADETRACKER PRO</h1>
                  <span style="font-size: 10px; color: #9a9a9f; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: block; margin-top: 5px;">Payment Receipt</span>
                </div>
                
                <!-- Congratulations Message -->
                <div style="padding: 30px; text-align: center; border-bottom: 1px solid #1f1f24;">
                  <div style="background-color: #c5a880; color: #070708; width: 50px; height: 50px; border-radius: 50%; font-size: 24px; line-height: 50px; text-align: center; margin: 0 auto 15px auto;">👑</div>
                  <h2 style="color: #c5a880; font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0;">Premium Unlocked!</h2>
                  <p style="font-size: 13px; color: #9a9a9f; margin: 0;">Hi <strong>${targetUser.name || "Trader"}</strong>, thank you for subscribing to Premium. Your membership details are listed below.</p>
                </div>

                <!-- Receipt Details Breakdown -->
                <div style="padding: 30px; border-bottom: 1px solid #1f1f24;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #f2f2f7;">
                    <tr>
                      <td style="padding: 8px 0; color: #9a9a9f;">Subscribed Plan:</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #c5a880;">${planName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #9a9a9f;">Base Price:</td>
                      <td style="padding: 8px 0; text-align: right;">${subtotalString}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #9a9a9f;">Platform Fee (18%):</td>
                      <td style="padding: 8px 0; text-align: right;">${gstString}</td>
                    </tr>
                    <tr style="border-top: 1px dashed #1f1f24;">
                      <td style="padding: 12px 0 8px 0; font-weight: bold; color: #ffffff;">Total Charged:</td>
                      <td style="padding: 12px 0 8px 0; text-align: right; font-weight: bold; color: #c5a880; font-size: 16px;">${totalString}</td>
                    </tr>
                  </table>
                </div>

                <!-- Date Box -->
                <div style="padding: 20px 30px; background-color: #161619; text-align: center; border-bottom: 1px solid #1f1f24;">
                  <span style="font-size: 11px; color: #9a9a9f; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Membership Valid Until</span>
                  <strong style="font-size: 16px; color: #ffffff;">${premiumExpiresAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>

                <!-- CTA Button -->
                <div style="padding: 35px 30px; text-align: center;">
                  <a href="${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard" style="background-color: #c5a880; color: #070708; padding: 14px 30px; font-size: 12.5px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 20px -5px rgba(197, 168, 128, 0.3);">Enter Premium Dashboard</a>
                </div>

                <!-- Footer -->
                <div style="background-color: #161619; padding: 20px; text-align: center; font-size: 11px; color: #9a9a9f; border-top: 1px solid #1f1f24;">
                  This is a system-generated invoice receipt. For billing support, email <a href="mailto:support@tradetrackerpro.in" style="color: #c5a880; text-decoration: none; font-weight: bold;">support@tradetrackerpro.in</a>.
                </div>
              </div>
            </div>
          `
        });
      } catch (mailErr) {
        console.error("Failed to send premium welcome email:", mailErr);
      }
    }

    res.json({
      status: "PAID",
      message: "Subscription activated successfully!",
      premiumExpiresAt,
    });

  } catch (error) {
    console.error("Razorpay signature verification error:", error);
    res.status(500).json({ error: "Signature verification error" });
  }
});

// @desc    Cancel Razorpay order / update status to FAILED
// @route   POST /api/payments/cancel-order
// @access  Private
router.post("/cancel-order", protect, async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId parameter" });
  }

  try {
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Only update to FAILED if it was PENDING
    if (transaction.status === "PENDING") {
      transaction.status = "FAILED";
      await transaction.save();
      console.log(`[Razorpay] Transaction marked as FAILED for cancelled order: ${orderId}`);
    }

    res.json({ status: "FAILED", message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Cancel order route error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Razorpay Webhook stub
// @route   POST /api/payments/webhook
// @access  Public
router.post("/webhook", async (req, res) => {
  console.log("Razorpay Webhook received:", req.body);
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("[Razorpay Webhook] Signature mismatch");
        return res.status(400).send("Signature mismatch");
      }
    }

    const { event, payload } = req.body;

    if (event === "order.paid" && payload && payload.order && payload.order.entity) {
      const orderId = payload.order.entity.id;
      const transaction = await Transaction.findOne({ orderId });

      if (transaction && transaction.status !== "PAID") {
        transaction.status = "PAID";
        await transaction.save();

        const validityDays = transaction.planType === "annual" ? 365 : 30;
        const premiumExpiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

        await User.findByIdAndUpdate(transaction.user, {
          isPremiumUser: true,
          premiumExpiresAt,
          status: "approved",
        });
        console.log(`[Webhook] User upgraded to premium for order: ${orderId}`);
      }
    }

    res.status(200).send("ok");
  } catch (error) {
    console.error("Razorpay Webhook error:", error);
    res.status(500).send("Webhook error");
  }
});

// @desc    Get user's subscription details and payment history
// @route   GET /api/payments/subscriptions
// @access  Private
router.get("/subscriptions", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "status role isPromoUser promoExpiresAt isPremiumUser premiumExpiresAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const request = await VerificationRequest.findOne({ user: req.userId });

    const now = new Date();
    const isAdmin = user.role === "admin";
    const hasActivePremium = user.isPremiumUser && user.premiumExpiresAt && user.premiumExpiresAt > now;
    const hasActivePromo = user.isPromoUser && user.promoExpiresAt && user.promoExpiresAt > now;
    const isBrokerVerified = request && request.status === "approved";

    // Determine membership status tag
    let membershipTag = "FREE";
    if (isAdmin) {
      membershipTag = "ADMIN";
    } else if (hasActivePremium) {
      membershipTag = "PREMIUM";
    } else if (isBrokerVerified) {
      membershipTag = "OPERATOR HQ";
    } else if (hasActivePromo) {
      membershipTag = "PROMO TRIAL";
    }

    // Find all transactions for this user, sorted newest first
    const transactions = await Transaction.find({ user: req.userId }).sort({ createdAt: -1 });

    res.json({
      isPremium: hasActivePremium,
      premiumExpiresAt: user.premiumExpiresAt,
      isPromo: hasActivePromo,
      promoExpiresAt: user.promoExpiresAt,
      membershipTag,
      transactions,
    });
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
