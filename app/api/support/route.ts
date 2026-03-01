import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subject, message, email } = await req.json();

    if (!subject || !message) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const supportEmail = process.env.SUPPORT_EMAIL || "support@tradetrackerpro.com";
    const userName = session.user.name || "Unknown User";
    const userEmail = session.user.email || email || "No Email Provided";

    console.log("DEBUG: Attempting to send email via Resend", { 
      to: supportEmail, 
      from: "Support Ticket <onboarding@resend.dev>",
      subject: `[SUPPORT TICKET] ${subject}`
    });

    // Send the email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await resend.emails.send({
          from: "Support Ticket <onboarding@resend.dev>", 
          to: supportEmail,
          replyTo: userEmail,
          subject: `[SUPPORT TICKET] ${subject}`,
          text: `New support request from your platform:
          
  User: ${userName}
  Email: ${userEmail}
  Subject: ${subject}
  
  Message:
  ${message}
          
  Timestamp: ${new Date().toLocaleString()}`,
        });
        
        console.log("DEBUG: Resend API success response:", response);
      } catch (resendError: any) {
        console.error("DEBUG: Resend API failure:", resendError);
        return new NextResponse(JSON.stringify({ error: resendError.message }), { status: 500 });
      }
    } else {
      console.warn("DEBUG: RESEND_API_KEY is missing from environment variables");
      return new NextResponse("Email service misconfigured", { status: 500 });
    }

    console.log("Support Query Received and Forwarded:", { userName, userEmail, subject });

    return NextResponse.json({ 
      success: true, 
      message: "Support ticket received by the site administration." 
    });

  } catch (error) {
    console.error("Support API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
