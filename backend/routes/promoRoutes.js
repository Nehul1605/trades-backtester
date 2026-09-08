import express from "express";
import PromoCode from "../models/PromoCode.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Helper to seed a default promo code if none exist or update legacy fixed cutoffs
const seedPromoCodes = async () => {
  try {
    let rdxPromo = await PromoCode.findOne({
      code: { $regex: /^rdx10$/i },
    });

    if (!rdxPromo) {
      rdxPromo = await PromoCode.create({
        code: "RDX10",
        durationDays: 10,
        isActive: true,
        expiresAt: null, // Dynamic rolling 10-day trial per user
      });
      console.log("Seeded default promo code RDX10 with dynamic 10-day trial");
    } else {
      // If legacy promo had a fixed expiry (e.g. Aug 31) or inactive, update to evergreen rolling 10-day
      if (rdxPromo.expiresAt !== null || !rdxPromo.isActive || rdxPromo.durationDays !== 10) {
        rdxPromo.expiresAt = null;
        rdxPromo.isActive = true;
        rdxPromo.durationDays = 10;
        await rdxPromo.save();
        console.log("Updated RDX10 promo code: removed legacy cutoff, active 10-day rolling trial");
      }
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
    const cleanCode = code.trim();
    const promo = await PromoCode.findOne({
      code: { $regex: new RegExp(`^${cleanCode}$`, "i") },
    });

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

    // Prevent repeated trial resets on the same user account
    if (user.isPromoUser && user.promoActivatedAt) {
      const now = new Date();
      if (user.promoExpiresAt && user.promoExpiresAt <= now) {
        return res.status(400).json({
          error: "You have already used your 10-day promotional trial for this account. Please upgrade to Premium or submit your broker verification to continue.",
        });
      }
      return res.status(400).json({
        error: `Your promotional trial is already active until ${user.promoExpiresAt.toLocaleDateString()}.`,
      });
    }

    // Calculate dynamic trial expiry: 10 days from current activation time
    const durationDays = promo.durationDays || 10;
    const durationMs = durationDays * 24 * 60 * 60 * 1000;
    const trialExpiry = new Date(Date.now() + durationMs);

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
      message: `Promo code applied successfully! 10-day trial active until ${trialExpiry.toLocaleDateString()}.`,
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
        isPromoUser: user.isPromoUser,
        promoExpiresAt: user.promoExpiresAt,
      },
    });

  } catch (error) {
    console.error("Apply promo code error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
