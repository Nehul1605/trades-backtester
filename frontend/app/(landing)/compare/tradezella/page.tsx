import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Zap,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  Target
} from "lucide-react";

export const metadata: Metadata = {
  title: "TradeTracker Pro vs TradeZella | The Best Free Trade Journal Alternative",
  description: "Comparing TradeTracker Pro vs TradeZella. Discover why TradeTracker Pro is the best free trading journal alternative with unlimited workspaces, calendar heatmaps, and advanced metrics.",
  keywords: [
    "TradeZella alternative",
    "free TradeZella alternative",
    "TradeTracker Pro vs TradeZella",
    "best free trade journal",
    "free trading journal software",
    "forex trading log alternative",
    "TraderSync alternative",
  ]
};

export default function TradezellaComparisonPage() {
  const comparisonRows = [
    {
      feature: "Monthly Pricing",
      pro: "Free ($0/mo)",
      proHighlight: true,
      zella: "$29 to $49/mo",
      zellaHighlight: false,
    },
    {
      feature: "Broker Workspaces",
      pro: "Unlimited (MT5, Exness, etc.)",
      proHighlight: true,
      zella: "Limited by Plan Tier",
      zellaHighlight: false,
    },
    {
      feature: "Day-Wise Equity Curves",
      pro: "Yes (Automated)",
      proHighlight: true,
      zella: "Yes",
      zellaHighlight: true,
    },
    {
      feature: "Calendar Heatmap",
      pro: "Yes (Interactive Monthly P&L)",
      proHighlight: true,
      zella: "Yes",
      zellaHighlight: true,
    },
    {
      feature: "Auto-Compressed Screenshot Uploads",
      pro: "Yes (Client-Side Optimized)",
      proHighlight: true,
      zella: "Yes",
      zellaHighlight: true,
    },
    {
      feature: "Built-In P&L & Lot Calculators",
      pro: "Yes",
      proHighlight: true,
      zella: "Yes",
      zellaHighlight: true,
    },
    {
      feature: "Fast, Lightweight UI",
      pro: "Yes (Zero lag, instant loads)",
      proHighlight: true,
      zella: "Can feel slow / heavy",
      zellaHighlight: false,
    },
    {
      feature: "No Credit Card Needed",
      pro: "Yes (Always)",
      proHighlight: true,
      zella: "No (Requires payment card)",
      zellaHighlight: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden pt-20">
      {/* ── Background Pattern ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-5xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Homepage
        </Link>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3 animate-pulse" /> Alternative Comparison
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            The Ultimate Free <span className="text-primary">TradeZella</span> Alternative
          </h1>
          <p className="text-[15px] sm:text-lg text-muted-foreground leading-relaxed">
            Why spend $360 to $600 a year on trading logs? Get all your essential journaling, calendar metrics, 
            and strategy backtesting workspaces completely free.
          </p>
        </div>

        {/* Comparison Table Section */}
        <section className="mb-20">
          <div className="border border-border/30 rounded-xl bg-card/45 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Feature / Capability
                    </th>
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary border-x border-border/15 bg-primary/4">
                      TradeTracker Pro (Free)
                    </th>
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                      TradeZella (Paid)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/5 transition-colors">
                      <td className="p-4 sm:p-5 text-xs sm:text-sm font-medium text-foreground">
                        {row.feature}
                      </td>
                      <td className="p-4 sm:p-5 text-xs sm:text-sm font-bold text-emerald-400 border-x border-border/15 bg-primary/1">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{row.pro}</span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {row.zellaHighlight ? (
                            <Check className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                          )}
                          <span>{row.zella}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Key Differences / Value Proposition */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why Traders are Switching to TradeTracker Pro
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">100% Free Lifetime Access</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No trial expirations, no credit card requirements, and no locked features. Get professional-grade journaling and analytics toolsets for $0.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Isolated Broker Workspaces</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Separate your Exness, MT5, demo, and live accounts. Each workspace gets its own isolated ledger, stats, calendar, and equity curve reports.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Privacy & Performance First</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Our site loads instantly. Chart screenshots are compressed on your client browser before upload to save you mobile data and loading time.
              </p>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 border border-border/30 rounded-2xl bg-card/30 relative overflow-hidden text-center mb-16 px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready to Upgrade Your Journaling?
            </h2>
            <p className="text-[14px] text-muted-foreground mb-6 leading-relaxed">
              Import and log your trades in a professional environment designed by and for active traders. Free to start, free to stay.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                asChild
                className="h-11 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm shadow-primary/15"
              >
                <Link href="/auth/sign-up">
                  Create Free Account <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer link back */}
      <footer className="border-t border-border/20 py-8 text-center text-xs text-muted-foreground/60">
        <p>&copy; {new Date().getFullYear()} TradeTracker Pro. All rights reserved. Comparison based on public pricing as of 2026.</p>
      </footer>
    </div>
  );
}
