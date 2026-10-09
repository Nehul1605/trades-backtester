import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { sendEmail } from "../config/email.js";

const CHECK_INTERVAL = 4 * 60 * 60 * 1000; // Run every 4 hours

/**
 * Checks active paid plan expirations and sends 1-day warning & expiration day renewal emails.
 */
export const checkPaidPlanExpiries = async () => {
  console.log("⏰ [Plan Check] Running paid subscription expiry check job...");
  try {
    const now = new Date();
    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 1. Check for 1-Day Warning Emails (Plan expires within 24 hours, warning not sent yet)
    const warningUsers = await User.find({
      premiumExpiresAt: { $gt: now, $lte: oneDayFromNow },
      planWarningEmailSent: { $ne: true },
      isPremiumUser: true,
    });

    for (const user of warningUsers) {
      try {
        const lastTx = await Transaction.findOne({ user: user._id, status: "PAID" }).sort({ createdAt: -1 });
        const planName = lastTx?.planType === "annual" ? "Annual Premium Plan" : "Monthly Premium Plan";
        const expiryDateStr = user.premiumExpiresAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        await sendEmail({
          to: user.email,
          subject: "⏳ Action Required: 1 Day Left on your TradeTracker Pro Subscription!",
          text: `Hi ${user.name},\n\nYour ${planName} on TradeTracker Pro will expire tomorrow on ${expiryDateStr}.\n\nDon't let your trading momentum stop! Renew your plan today to retain continuous access to:\n- Unlimited Trade Journaling & Analytics\n- Live Market Streams & Operator Signals\n- Position Size Calculators & Risk Tools\n\nRenew your plan now: https://tradetrackerpro.in/premium\n\nBest regards,\nThe TradeTracker Pro Team`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070708; padding: 40px 15px; color: #f2f2f7; line-height: 1.6;">
              <div style="max-width: 550px; margin: 0 auto; background-color: #0d0d0f; border-radius: 20px; overflow: hidden; border: 1px solid #1f1f24; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);">
                <div style="background-color: #0d0d0f; padding: 30px; text-align: center; border-bottom: 1px solid #1f1f24;">
                  <h1 style="margin: 0; color: #c5a880; font-size: 22px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">TRADETRACKER PRO</h1>
                  <span style="font-size: 10px; color: #9a9a9f; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: block; margin-top: 5px;">Subscription Renewal Notice</span>
                </div>
                <div style="padding: 30px; text-align: center;">
                  <div style="background-color: rgba(234, 179, 8, 0.1); color: #eab308; width: 60px; height: 60px; border-radius: 50%; font-size: 28px; line-height: 60px; margin: 0 auto 15px auto; border: 1px solid rgba(234, 179, 8, 0.3);">⏳</div>
                  <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 10px 0;">1 Day Remaining on Your Plan!</h2>
                  <p style="font-size: 14px; color: #9a9a9f; margin: 0 0 20px 0;">Hi <strong>${user.name}</strong>, your <strong>${planName}</strong> is set to expire tomorrow on <strong>${expiryDateStr}</strong>.</p>
                  <div style="background-color: #161619; padding: 20px; border-radius: 12px; border: 1px solid #27272a; text-align: left; margin-bottom: 25px;">
                    <p style="font-size: 13px; color: #c5a880; font-weight: bold; margin: 0 0 10px 0;">Renew today to maintain uninterrupted access to:</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #d4d4d8;">
                      <li style="margin-bottom: 6px;">Continuous Trade Journaling & Analytics</li>
                      <li style="margin-bottom: 6px;">Live Market Stream & Operator Signals</li>
                      <li style="margin-bottom: 6px;">Trading Calculators & Risk Analytics</li>
                    </ul>
                  </div>
                  <a href="https://tradetrackerpro.in/premium" style="background-color: #c5a880; color: #070708; padding: 14px 32px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 20px -5px rgba(197, 168, 128, 0.3);">Renew Subscription Now</a>
                </div>
                <div style="background-color: #161619; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #1f1f24;">
                  Need assistance? Contact us at <a href="mailto:support@tradetrackerpro.in" style="color: #c5a880; text-decoration: none;">support@tradetrackerpro.in</a>
                </div>
              </div>
            </div>
          `,
        });

        user.planWarningEmailSent = true;
        await user.save();
        console.log(`✅ [Plan Check] Sent 1-day warning email to ${user.email}`);
      } catch (mailErr) {
        console.error(`❌ [Plan Check] Failed to send 1-day warning email to ${user.email}:`, mailErr);
      }
    }

    // 2. Check for Expiration Day Emails (Plan has expired, end email not sent yet)
    const expiredUsers = await User.find({
      premiumExpiresAt: { $lte: now },
      planEndedEmailSent: { $ne: true },
    });

    for (const user of expiredUsers) {
      try {
        const lastTx = await Transaction.findOne({ user: user._id, status: "PAID" }).sort({ createdAt: -1 });
        const planName = lastTx?.planType === "annual" ? "Annual Premium Plan" : "Monthly Premium Plan";
        const expiryDateStr = user.premiumExpiresAt
          ? user.premiumExpiresAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "today";

        await sendEmail({
          to: user.email,
          subject: "⚠️ Your TradeTracker Pro Subscription Expires Today - Renew to Continue Journaling",
          text: `Hi ${user.name},\n\nYour ${planName} on TradeTracker Pro expires today (${expiryDateStr}).\n\nTo keep logging your trades and accessing live market signals without interruption, please renew your subscription now.\n\nRenew your plan: https://tradetrackerpro.in/premium\n\nBest regards,\nThe TradeTracker Pro Team`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070708; padding: 40px 15px; color: #f2f2f7; line-height: 1.6;">
              <div style="max-width: 550px; margin: 0 auto; background-color: #0d0d0f; border-radius: 20px; overflow: hidden; border: 1px solid #1f1f24; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);">
                <div style="background-color: #0d0d0f; padding: 30px; text-align: center; border-bottom: 1px solid #1f1f24;">
                  <h1 style="margin: 0; color: #c5a880; font-size: 22px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">TRADETRACKER PRO</h1>
                  <span style="font-size: 10px; color: #ef4444; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: block; margin-top: 5px;">Plan Expiration Alert</span>
                </div>
                <div style="padding: 30px; text-align: center;">
                  <div style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; width: 60px; height: 60px; border-radius: 50%; font-size: 28px; line-height: 60px; margin: 0 auto 15px auto; border: 1px solid rgba(239, 68, 68, 0.3);">⚠️</div>
                  <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 10px 0;">Your Plan Expires Today!</h2>
                  <p style="font-size: 14px; color: #9a9a9f; margin: 0 0 20px 0;">Hi <strong>${user.name}</strong>, your <strong>${planName}</strong> expires today on <strong>${expiryDateStr}</strong>.</p>
                  <p style="font-size: 13.5px; color: #d4d4d8; margin-bottom: 25px;">
                    Renew your plan now to continue your trading journaling journey and retain seamless access to your trading logs, live market room, and analytics.
                  </p>
                  <a href="https://tradetrackerpro.in/premium" style="background-color: #c5a880; color: #070708; padding: 14px 32px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 20px -5px rgba(197, 168, 128, 0.3);">Renew Plan & Continue Journaling</a>
                </div>
                <div style="background-color: #161619; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #1f1f24;">
                  Questions or billing support? Email <a href="mailto:support@tradetrackerpro.in" style="color: #c5a880; text-decoration: none;">support@tradetrackerpro.in</a>
                </div>
              </div>
            </div>
          `,
        });

        user.planEndedEmailSent = true;
        user.isPremiumUser = false;
        await user.save();
        console.log(`✅ [Plan Check] Sent expiration email to ${user.email}`);
      } catch (mailErr) {
        console.error(`❌ [Plan Check] Failed to send expiration email to ${user.email}:`, mailErr);
      }
    }
  } catch (err) {
    console.error("❌ [Plan Check] Error running paid subscription expiry check job:", err);
  }
};

/**
 * Starts the automated check scheduler loop for paid plan expirations.
 */
export const startPlanCheckScheduler = () => {
  // Run 15 seconds after startup
  setTimeout(checkPaidPlanExpiries, 15000);
  // Repeat every 4 hours
  setInterval(checkPaidPlanExpiries, CHECK_INTERVAL);
};
