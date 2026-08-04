import express from "express";
import SupportInquiry from "../models/SupportInquiry.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Optional JWT authentication middleware to identify registered users
const optionalProtect = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch (error) {
      console.warn("Optional auth failed:", error.message);
    }
  }
  next();
};

// @desc    Submit a support inquiry
// @route   POST /api/support
// @access  Public (Optional Auth)
router.post("/", optionalProtect, async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  try {
    // 1. Save to Database
    const inquiry = await SupportInquiry.create({
      name,
      email,
      subject: subject || "General Support Inquiry",
      message,
      userId: req.userId || null,
    });

    // 2. Send via Resend API (Direct REST Call)
    const supportEmail = process.env.SUPPORT_EMAIL || "tradetrackerpro.in@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      console.log(`Sending email notification to ${supportEmail} using Resend...`);
      const emailPayload = {
        from: "Support Ticket <onboarding@resend.dev>",
        to: supportEmail,
        reply_to: email,
        subject: `[SUPPORT] ${subject || "New Inquiry"}: ${name}`,
        text: `New support ticket from your platform:\n\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              `Subject: ${subject || "General Support"}\n\n` +
              `Message:\n${message}\n\n` +
              `Submitted at: ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">New Support Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject || "General Support Inquiry"}</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; white-space: pre-wrap;">
              <strong>Message:</strong><br/>
              ${message.replace(/\n/g, "<br/>")}
            </div>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #666;">This inquiry was saved to the database. Reply to this email to contact the user directly.</p>
          </div>
        `,
      };

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(emailPayload),
      });

      if (!resendRes.ok) {
        const errBody = await resendRes.json().catch(() => ({}));
        console.error("Resend API error:", errBody);
      } else {
        const resendData = await resendRes.json();
        console.log("Resend API success:", resendData);
      }
    } else {
      console.warn("RESEND_API_KEY is not defined in backend .env");
    }

    res.status(201).json({
      success: true,
      message: "Your support inquiry has been submitted successfully.",
      inquiry,
    });
  } catch (error) {
    console.error("Error submitting support inquiry:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

export default router;
