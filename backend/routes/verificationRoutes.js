import express from "express";
import VerificationRequest from "../models/VerificationRequest.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// @desc    Submit or update verification request
// @route   POST /api/verification/submit
// @access  Private
router.post("/submit", protect, async (req, res) => {
  const { broker, tradingAccountNumber, telegramUsername } = req.body;

  if (!broker || !tradingAccountNumber || !telegramUsername) {
    return res.status(400).json({ error: "Please provide all details" });
  }

  try {
    // Find existing request or create a new one
    let request = await VerificationRequest.findOne({ user: req.userId });

    if (request) {
      request.broker = broker;
      request.tradingAccountNumber = tradingAccountNumber;
      request.telegramUsername = telegramUsername;
      request.status = "pending";
      await request.save();
    } else {
      request = await VerificationRequest.create({
        user: req.userId,
        broker,
        tradingAccountNumber,
        telegramUsername,
        status: "pending",
      });
    }

    // Always reset user status back to pending when they submit
    await User.findByIdAndUpdate(req.userId, { status: "pending" });

    res.json({
      message: "Verification request submitted successfully",
      request,
    });
  } catch (error) {
    console.error("Verification submit error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Get user's verification status
// @route   GET /api/verification/status
// @access  Private
router.get("/status", protect, async (req, res) => {
  try {
    const request = await VerificationRequest.findOne({ user: req.userId });
    const user = await User.findById(req.userId).select("status role");

    res.json({
      status: user ? user.status : "pending",
      role: user ? user.role : "user",
      request,
    });
  } catch (error) {
    console.error("Verification status error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
