"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, X } from "lucide-react";
import { FooterSupportForm } from "./FooterSupportForm";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSupportClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <footer className="border-t border-border/30 bg-background/50 backdrop-blur-md relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* ── Main Footer Columns ── */}
        <div className="flex flex-col lg:flex-row justify-between gap-x-8 gap-y-12 py-14">
          
          {/* Column 1: Brand & Slogan */}
          <div className="w-full lg:max-w-[260px] shrink-0 space-y-4">
            <Link href="/" className="inline-block transition-transform hover:scale-[1.01] active:scale-[0.99]">
              <img
                src="/logo.png"
                className="h-12 w-auto select-none pointer-events-none"
                alt="TradeTracker Pro Logo"
              />
            </Link>
            <p className="text-[13px] text-muted-foreground/80 leading-relaxed max-w-[240px]">
              Institutional-grade trade journaling, metrics analysis, and active gold & forex backtesting environments.
            </p>
            
            {/* Socials & Mail Row */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { label: "Twitter", url: "https://x.com/TTPJournal", icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                { label: "Discord", url: "https://discord.gg/9gv3PWYyE", icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 2.855a.07.07 0 0 0-.05.025C.66 7.398-.152 11.83.08 16.21a.076.076 0 0 0 .029.053 20.105 20.105 0 0 0 6.069 3.067.075.075 0 0 0 .082-.027c.4-.545.755-1.124 1.072-1.728a.075.075 0 0 0-.041-.104 13.09 13.09 0 0 1-1.902-.907.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.902.908.077.070 0 0 0-.038.103c.324.6.68 1.18 1.072 1.728a.075.075 0 0 0 .082.028 20.05 20.05 0 0 0 6.075-3.067.078.078 0 0 0 .028-.052c.385-4.949-.63-9.354-2.6-13.314a.072.072 0 0 0-.05-.028zM7.529 14.14c-1.196 0-2.185-1.1-2.185-2.456 0-1.355.97-2.456 2.185-2.456 1.22 0 2.19 1.1 2.185 2.456 0 1.356-.965 2.456-2.185 2.456zm7.955 0c-1.196 0-2.185-1.1-2.185-2.456 0-1.355.97-2.456 2.185-2.456 1.22 0 2.19 1.1 2.185 2.456 0 1.356-.96 2.456-2.185 2.456z" /></svg> },
                { label: "Telegram", url: "https://t.me/+HGlC8YjKwgM1OTBl", icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.94-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .28z" /></svg> },
                { label: "Mail", url: "mailto:support@tradetrackerpro.in", icon: <Mail className="w-4 h-4 text-muted-foreground/70 group-hover:text-primary transition-colors" /> }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target={social.label === "Mail" ? undefined : "_blank"}
                  rel={social.label === "Mail" ? undefined : "noopener noreferrer"}
                  className="w-8 h-8 rounded-lg bg-card/60 border border-border/30 flex items-center justify-center text-muted-foreground/70 hover:text-primary hover:border-primary/40 hover:bg-card hover:-translate-y-0.5 transition-all duration-300 group"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Symmetrical Columns Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 2: Product Features (Informational anchors) */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/90">
                Product Overview
              </h4>
              <ul className="space-y-2.5">
                {[
                  { l: "Platform Features", h: "/#features" },
                  { l: "Workspace Showcase", h: "/#workspace-showcase" },
                  { l: "How It Works", h: "/#how-it-works" },
                  { l: "Common F.A.Q.", h: "/#faq" }
                ].map((link) => (
                  <li key={link.l}>
                    <Link
                      href={link.h}
                      className="text-[13px] text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-block transition-all text-left"
                    >
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Dashboard Apps (Requires login, lock indicators aligned left) */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/90">
                Trading App
              </h4>
              <ul className="space-y-2.5">
                {[
                  { l: "Journal Dashboard", h: "/dashboard" },
                  { l: "Live Market Rooms", h: "/market" },
                  { l: "P&L Calculator", h: "/pl-calculator" },
                  { l: "Consistency Planner", h: "/consistency-calculator" }
                ].map((link) => (
                  <li key={link.l} className="whitespace-nowrap">
                    <Link
                      href={link.h}
                      className="text-[13px] text-muted-foreground/85 hover:text-foreground hover:translate-x-0.5 inline-flex items-center gap-1.5 transition-all group text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-muted-foreground/45 shrink-0 group-hover:text-primary transition-colors" />
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Comparisons */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/90">
                Comparisons
              </h4>
              <ul className="space-y-2.5">
                {[
                  { l: "vs TradeZella", h: "/compare/tradezella" },
                  { l: "vs Notion", h: "/compare/notion" },
                  { l: "vs TraderSync", h: "/compare/tradersync" },
                  { l: "vs Excel Journals", h: "/compare/excel" }
                ].map((link) => (
                  <li key={link.l}>
                    <Link
                      href={link.h}
                      className="text-[13px] text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-block transition-all text-left"
                    >
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Resources & Legal */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/90">
                Resources & Legal
              </h4>
              <ul className="space-y-2.5">
                {[
                  { l: "Help Center", h: "/help" },
                  { l: "Privacy Policy", h: "/privacy" },
                  { l: "Terms of Service", h: "/terms" },
                  { l: "Support Desk", h: "#support-desk", isAction: true }
                ].map((link) => (
                  <li key={link.l}>
                    {link.isAction ? (
                      <a
                        href={link.h}
                        onClick={handleSupportClick}
                        className="text-[13px] text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-block transition-all text-left cursor-pointer"
                      >
                        {link.l}
                      </a>
                    ) : (
                      <Link
                        href={link.h}
                        className="text-[13px] text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-block transition-all text-left"
                      >
                        {link.l}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* ── Risk Disclaimer & Legal Footer ── */}
        <div className="border-t border-border/15 py-6">
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-5xl text-left">
            <span className="font-semibold text-muted-foreground/80">Risk Disclaimer:</span>{" "}
            Trading forex, gold, and financial instruments involves substantial risk and is not suitable for all investors. Past performance does not guarantee future results. TradeTracker Pro is a journaling and analytics tool — it does not provide financial advice, trade signals, or investment recommendations. All system information is subjective to account permissions and conditions.
          </p>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-border/15 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground/65 flex items-center gap-1">
            &copy; {currentYear} TradeTracker Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>

      </div>

      {/* ── Symmetrical Support Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/40 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col gap-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1 pr-8">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Instant Support Desk
              </h3>
              <p className="text-xs text-muted-foreground">
                Have a question or request? Submit your ticket directly to our inbox and we will reply to your email shortly.
              </p>
            </div>

            <FooterSupportForm onSuccess={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </footer>
  );
}
