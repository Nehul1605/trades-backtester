import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "TradeTracker Pro",
  description: "Read the Privacy Policy for TradeTracker Pro to understand how we protect, handle, and secure your trading journal data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden pt-20">
      {/* ── Background Pattern ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-4xl flex-1 pb-20">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Homepage
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-4">
            <Shield className="w-3 h-3" /> Legal Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: August 3, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-muted-foreground leading-relaxed text-sm sm:text-[15px]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> 1. Introduction & Scope
            </h2>
            <p>
              At <strong>TradeTracker Pro</strong>, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our trade journaling software, position sizing calculators, and active market synchronization features.
            </p>
            <p>
              By accessing or using our services, you consent to the practices described in this Privacy Policy. If you do not agree, please do not access or use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> 2. Information We Collect
            </h2>
            <p>
              We collect information that you voluntarily provide when creating an account, logging trades, or contacting support:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Your name, email address, password hashes, and associated profiles (e.g., Google OAuth).
              </li>
              <li>
                <strong>Trading Data:</strong> Broker account names, deposit histories, logged trade details (entry, exit, lot sizes, assets, strategy tags, screenshots, notes, P&L metrics).
              </li>
              <li>
                <strong>Support & Feedback:</strong> Messages, files, and contact details submitted through our Help Center or Support inquiries.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 3. How We Use Your Information
            </h2>
            <p>
              We process your data for the following legitimate business purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our trading journal dashboard and analytics tools.</li>
              <li>To personalize your experience, aggregate trading statistics, and plot equity curves.</li>
              <li>To answer customer inquiries, troubleshoot issues, and send support notifications via Resend email service.</li>
              <li>To secure our servers, prevent fraudulent activities, and manage user roles (e.g. admin, member).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> 4. Data Security & Storage
            </h2>
            <p>
              We use industry-standard security protocols to protect your data. Your account credentials are encrypted (using bcryptjs), and all interactions are routed through secure HTTPS channels. Your trade history is stored in an isolated, secure database.
            </p>
            <p>
              Please note that while we employ extensive measures, no online transmission method or electronic storage system is 100% secure. You are responsible for keeping your login credentials confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 5. Third-Party Services
            </h2>
            <p>
              We utilize select third-party integrations to deliver core platform functionalities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Resend:</strong> Used to manage, send, and forward support ticket emails between you and our administrators.
              </li>
              <li>
                <strong>LiveKit:</strong> Used to coordinate real-time market synchronization and stream sessions.
              </li>
              <li>
                <strong>MongoDB Atlas:</strong> Managed database cluster where application configurations and journal details reside.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> 6. Your Rights
            </h2>
            <p>
              Depending on your location, you may have rights to access, correct, export, or delete the personal data we hold about you. You can update your profile info directly inside your account Settings dashboard. If you wish to delete your account or request data extraction, please submit a support ticket via our Help page or contact us at <a href="mailto:tradetrackerpro.in@gmail.com" className="text-primary hover:underline">tradetrackerpro.in@gmail.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 7. Changes to this Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the &quot;Last updated&quot; date at the top of this page. We encourage you to review this page periodically to stay informed about how we protect your information.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
