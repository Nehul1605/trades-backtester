import express from "express";
import PromoCode from "../models/PromoCode.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Helper to seed a default promo code if none exist
const seedPromoCodes = async () => {
  try {
    const hasRdx10 = await PromoCode.findOne({ code: "rdx10" });
    if (!hasRdx10) {
      await PromoCode.create({
        code: "rdx10",
        durationDays: 10,
        isActive: true,
        expiresAt: new Date(Date.UTC(2026, 7, 31, 23, 59, 59)), // Valid until August 31, 2026
      });
      console.log("Seeded default promo code rdx10");
    }
  } catch (err) {
    console.error("Error seeding promo codes:", err);
  }
};

// Seed default code
seedPromoCodes();

// @desc    Apply a promo code
// @route   POST /api/promo/apply
// @access  Private
router.post("/apply", protect, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Please enter a promo code" });
  }

  try {
    const cleanCode = code.trim().toLowerCase();
    const promo = await PromoCode.findOne({ code: cleanCode });

    if (!promo) {
      return res.status(404).json({ error: "Invalid promo code" });
    }

    if (!promo.isActive) {
      return res.status(400).json({ error: "This promo code is no longer active" });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return res.status(400).json({ error: "This promo code has expired" });
    }

    if (promo.maxUses !== null && promo.usesCount >= promo.maxUses) {
      return res.status(400).json({ error: "This promo code usage limit has been reached" });
    }

    // Apply promo trial to User
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate trial expiry with hard cutoff of August 31, 2026
    const durationMs = promo.durationDays * 24 * 60 * 60 * 1000;
    let trialExpiry = new Date(Date.now() + durationMs);

    const cutoffDate = new Date(Date.UTC(2026, 7, 31, 23, 59, 59));
    if (trialExpiry > cutoffDate) {
      trialExpiry = cutoffDate;
    }

    // Update user properties
    user.isPromoUser = true;
    user.promoCode = promo.code;
    user.promoActivatedAt = new Date();
    user.promoExpiresAt = trialExpiry;
    user.trialWarningEmailSent = false;
    user.trialEndedEmailSent = false;
    user.status = "approved"; // Bypass gate
    await user.save();

    // Increment promo uses
    promo.usesCount += 1;
    await promo.save();

    res.json({
      message: `Promo code applied successfully! Trial active until ${trialExpiry.toLocaleDateString()}.`,
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
        isPromoUser: user.isPromoUser,
        promoExpiresAt: user.promoExpiresAt,
      }
    });

  } catch (error) {
    console.error("Apply promo code error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
