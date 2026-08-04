import express from "express";
import VerificationRequest from "../models/VerificationRequest.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import { sendEmail } from "../config/email.js";

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

    // Fetch user details for the notification email
    const user = await User.findById(req.userId);
    const userName = user ? user.name : "Unknown User";
    const userEmail = user ? user.email : "No Email";

    // Send email notification to Admin
    const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SUPPORT_EMAIL || "tradetrackerpro.in@gmail.com";
    try {
      await sendEmail({
        to: notifyEmail,
        subject: `[VERIFICATION REQUEST] New submission by ${userName}`,
        text: `A user has submitted broker verification info.\n\nUser: ${userName} (${userEmail})\nBroker: ${broker}\nTrading Account: ${tradingAccountNumber}\nTelegram: ${telegramUsername}\n\nPlease log into the Admin Console to review this request.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b; line-height: 1.6;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
              <!-- Header Banner -->
              <div style="background-color: #09090b; padding: 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                <img src="https://www.tradetrackerpro.in/logo.png" alt="TradeTracker Pro Logo" style="height: 35px; vertical-align: middle; margin-right: 8px; display: inline-block;" />
                <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; vertical-align: middle; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">TRADETRACKER PRO</span>
              </div>
              
              <!-- Body Content -->
              <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="display: inline-block; background-color: #fef3c7; border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                    <span style="font-size: 32px;">📝</span>
                  </div>
                  <h2 style="color: #d97706; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">New Submission</h2>
                </div>
                
                <p style="font-size: 15px; margin-top: 0; color: #475569;">A trader has submitted broker verification details for review:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: bold; width: 140px; color: #475569;">Trader Name:</td>
                    <td style="padding: 12px; color: #1e293b;">${userName}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: bold; color: #475569;">Trader Email:</td>
                    <td style="padding: 12px; color: #1e293b;"><a href="mailto:${userEmail}" style="color: #c5a880; text-decoration: none;">${userEmail}</a></td>
                  </tr>
                  <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: bold; color: #475569;">Broker:</td>
                    <td style="padding: 12px; color: #1e293b; text-transform: uppercase;">${broker}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: bold; color: #475569;">Account ID:</td>
                    <td style="padding: 12px; color: #1e293b; font-family: monospace;">${tradingAccountNumber}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 12px; font-weight: bold; color: #475569;">Telegram:</td>
                    <td style="padding: 12px; color: #1e293b;">${telegramUsername}</td>
                  </tr>
                </table>
                
                <div style="text-align: center; margin: 30px 0 10px 0;">
                  <a href="${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/admin" style="background-color: #09090b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; border: 1px solid #c5a880; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Review Submission</a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 11px; color: #64748b; margin: 0;">This is an automated notification from TradeTracker Pro.</p>
                <p style="font-size: 11px; color: #64748b; margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} TradeTracker Pro. All rights reserved.</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Failed to send verification notification email:", mailError);
    }

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
