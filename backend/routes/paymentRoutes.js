import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
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

// @desc    Create Razorpay payment order
// @route   POST /api/payments/create-order
// @access  Private
router.post("/create-order", protect, async (req, res) => {
  const { planType, customerPhone, customerName } = req.body;

  if (!planType || !customerPhone || !customerName) {
    return res.status(400).json({ error: "Please provide planType, name, and phone" });
  }

  // Calculate pricing based on USD to INR conversion at $1 = 95.5
  // Monthly: $10 -> ₹955 INR -> 95500 paise
  // Annual: $108 (40% discount) -> ₹10,314 INR -> 1031400 paise
  let amountInPaise = 95500;
  if (planType === "annual") {
    amountInPaise = 1031400;
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const rzp = getRazorpayInstance();
    const receiptId = `receipt_${req.userId}_${Date.now()}`;

    console.log(`[Razorpay] Creating Order: ${receiptId}, amount in paise: ${amountInPaise}`);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
    };

    const order = await rzp.orders.create(options);

    // Create a pending transaction record
    await Transaction.create({
      user: req.userId,
      orderId: order.id,
      amount: amountInPaise / 100, // store in standard INR
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
        await sendEmail({
          to: targetUser.email,
          subject: "👑 Welcome to TradeTracker Pro Premium!",
          text: `Hi ${targetUser.name || "there"},\n\nThank you for upgrading to TradeTracker Pro Premium! Your payment was verified successfully.\n\nYour account has been upgraded, and your subscription is active until ${premiumExpiresAt.toLocaleDateString()}.\n\nAccess Dashboard: ${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard\n\nBest regards,\nThe TradeTracker Pro Team`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b; line-height: 1.6;">
              <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                <!-- Header Banner -->
                <div style="background-color: #09090b; padding: 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                  <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">TRADETRACKER PRO</span>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 30px;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background-color: #fef3c7; border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                      <span style="font-size: 32px;">👑</span>
                    </div>
                    <h2 style="color: #ca8a04; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Premium Unlocked!</h2>
                  </div>
                  
                  <p style="font-size: 15px; margin-top: 0;">Hi <strong>${targetUser.name || "Trader"}</strong>,</p>
                  <p style="font-size: 14.5px; color: #475569;">Thank you for subscribing to <strong>TradeTracker Pro Premium</strong>! Your payment has been successfully processed, and your account has been upgraded.</p>
                  
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9; text-align: center;">
                    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Subscription Expiry Date</span>
                    <strong style="font-size: 18px; color: #0f172a;">${premiumExpiresAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>

                  <p style="font-size: 14.5px; color: #475569;">You now have permanent access to all platform features, charts, economic calendars, and partner broker syncs.</p>

                  <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard" style="background-color: #09090b; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Enter Premium Dashboard</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11.5px; color: #94a3b8;">
                  This is an automated receipt confirmation for your subscription order. For billing queries, reach out to <a href="mailto:support@tradetrackerpro.in" style="color: #ca8a04; text-decoration: underline;">support@tradetrackerpro.in</a>.
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
      "status isPromoUser promoExpiresAt isPremiumUser premiumExpiresAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const hasActivePremium = user.isPremiumUser && user.premiumExpiresAt && user.premiumExpiresAt > now;
    const hasActivePromo = user.isPromoUser && user.promoExpiresAt && user.promoExpiresAt > now;

    // Determine membership status tag
    let membershipTag = "FREE";
    if (hasActivePremium) {
      membershipTag = "PREMIUM";
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
