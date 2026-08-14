import User from "../models/User.js";
import VerificationRequest from "../models/VerificationRequest.js";
import { sendEmail } from "../config/email.js";

const CHECK_INTERVAL = 12 * 60 * 60 * 1000; // Run every 12 hours

/**
 * Starts the automated check loop for trial warning and ended emails.
 */
export const startTrialCheckScheduler = () => {
  const checkTrials = async () => {
    console.log("⏰ [Trial Check] Running automated trial warnings and expiry check job...");
    try {
      const now = new Date();
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

      // 1. Check for warning emails (Trial expires in <= 2 days, warning not sent yet)
      const warningUsers = await User.find({
        isPromoUser: true,
        trialWarningEmailSent: false,
        promoExpiresAt: { $gt: now, $lte: twoDaysFromNow },
        $or: [
          { isPremiumUser: false },
          { premiumExpiresAt: { $exists: false } },
          { premiumExpiresAt: { $lt: now } }
        ]
      });

      for (const user of warningUsers) {
        try {
          // Skip if they are broker verified
          const isVerified = await VerificationRequest.findOne({ user: user._id, status: "approved" });
          if (isVerified) {
            user.trialWarningEmailSent = true;
            await user.save();
            continue;
          }
          const expiryStr = user.promoExpiresAt.toLocaleDateString();
          await sendEmail({
            to: user.email,
            subject: "⚠️ Action Required: Your TradeTracker Pro Trial Expires in 2 Days!",
            text: `Hello ${user.name},\n\nThis is a warning that your 10-day promotional trial access will expire in 2 days on ${expiryStr}.\n\nTo avoid losing access to your trade logs, charts, and console, you must either:\n1. Upgrade to Premium: https://tradetrackerpro.in/premium\n2. Verify your partner broker details inside Operator HQ.\n\nThank you for choosing TradeTracker Pro.\n\nBest regards,\nThe TradeTracker Pro Team`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
                <h2 style="color: #eab308; margin-top: 0;">⚠️ Action Required: Trial Expiring</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>This is a warning that your 10-day promotional trial access will expire in 2 days on <strong>${expiryStr}</strong>.</p>
                <p>To avoid losing access to your trade logs, charts, and console, you must either:</p>
                <ul style="padding-left: 20px;">
                  <li style="margin-bottom: 10px;"><strong>Upgrade to Premium:</strong> <a href="https://tradetrackerpro.in/premium" style="color: #eab308; font-weight: bold; text-decoration: underline;">Upgrade Here ($10/mo)</a></li>
                  <li style="margin-bottom: 10px;"><strong>Verify Partner Broker:</strong> Submit your details inside Operator HQ</li>
                </ul>
                <p>Thank you for choosing TradeTracker Pro.</p>
                <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
                <p style="font-size: 12px; color: #71717a;">Best regards,<br/>The TradeTracker Pro Team</p>
              </div>
            `
          });

          user.trialWarningEmailSent = true;
          await user.save();
        } catch (mailErr) {
          console.error(`Failed to send warning email to ${user.email}:`, mailErr);
        }
      }

      // 2. Check for trial ended emails (Trial has expired, end not sent yet)
      const expiredUsers = await User.find({
        isPromoUser: true,
        trialEndedEmailSent: false,
        promoExpiresAt: { $lte: now },
        $or: [
          { isPremiumUser: false },
          { premiumExpiresAt: { $exists: false } },
          { premiumExpiresAt: { $lt: now } }
        ]
      });

      for (const user of expiredUsers) {
        try {
          // Skip if they are broker verified
          const isVerified = await VerificationRequest.findOne({ user: user._id, status: "approved" });
          if (isVerified) {
            user.trialEndedEmailSent = true;
            await user.save();
            continue;
          }
          await sendEmail({
            to: user.email,
            subject: "❌ Your TradeTracker Pro Trial Has Ended",
            text: `Hello ${user.name},\n\nYour promotional free trial access has ended. Your dashboard and premium features are now locked.\n\nTo restore your logs and resume access to Live Market Stream, Operator Signals, and calculators, please upgrade to Premium or submit your broker details for free verification.\n\nUnlock Dashboard: https://tradetrackerpro.in/premium\n\nBest regards,\nThe TradeTracker Pro Team`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
                <h2 style="color: #ef4444; margin-top: 0;">❌ Trial Ended</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your promotional free trial access has ended. Your dashboard and premium features are now locked.</p>
                <p>To restore your logs and resume access to Live Market Stream, Operator Signals, and calculators, please upgrade to Premium or submit your broker details for free verification.</p>
                <p style="margin: 25px 0;">
                  <a href="https://tradetrackerpro.in/premium" style="display:inline-block; padding:12px 24px; background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); color: #000; text-decoration: none; font-weight: bold; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Unlock Dashboard Now</a>
                </p>
                <p>Thank you for choosing TradeTracker Pro.</p>
                <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
                <p style="font-size: 12px; color: #71717a;">Best regards,<br/>The TradeTracker Pro Team</p>
              </div>
            `
          });

          user.trialEndedEmailSent = true;
          await user.save();
        } catch (mailErr) {
          console.error(`Failed to send trial ended email to ${user.email}:`, mailErr);
        }
      }

    } catch (err) {
      console.error("Error running trial expiry check job:", err);
    }
  };

  // Run on startup (after brief delay)
  setTimeout(checkTrials, 10000);

  // Setup interval to run every 12 hours
  setInterval(checkTrials, CHECK_INTERVAL);
};
