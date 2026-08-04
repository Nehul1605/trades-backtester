import dotenv from "dotenv";
dotenv.config();

/**
 * Sends an email using the Resend API.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML content
 * @param {string} [options.reply_to] - Reply-to email address
 * @returns {Promise<Object>} Resend response
 */
export async function sendEmail({ to, subject, text, html, reply_to }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "TradeTracker Pro <noreply@tradetrackerpro.com>";

  if (!resendApiKey) {
    console.warn("⚠️ RESEND_API_KEY is not defined in backend .env. Email skipped.");
    return { skipped: true, reason: "API key missing" };
  }

  try {
    const emailPayload = {
      from: fromEmail,
      to,
      subject,
      text,
      html,
    };

    if (reply_to) {
      emailPayload.reply_to = reply_to;
    }

    console.log(`✉️ Sending email to ${to} ("${subject}") via Resend...`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("❌ Resend API error:", data);
      throw new Error(data.message || `HTTP ${res.status} from Resend`);
    }

    console.log("✅ Resend API success:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to send email via Resend:", error.message);
    throw error;
  }
}
