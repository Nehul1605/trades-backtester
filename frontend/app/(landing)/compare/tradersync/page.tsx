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
  Target,
  FileText
} from "lucide-react";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "TradeTracker Pro",
  description: "Comparing TradeTracker Pro vs TraderSync. Discover why TradeTracker Pro is the best free alternative with unlimited broker accounts, live heatmaps, and clean charts without expensive monthly fees.",
  keywords: [
    "TraderSync alternative",
    "free TraderSync alternative",
    "TraderSync review",
    "best free trading journal",
    "free forex journal software",
    "automated trading log"
  ]
};

export default function TraderSyncComparisonPage() {
  const comparisonRows = [
    {
      feature: "Monthly Pricing",
      pro: "100% Free ($0/mo)",
      proHighlight: true,
      traderSync: "Very Expensive ($30 - $80/mo)",
      traderSyncHighlight: false,
    },
    {
      feature: "Broker Accounts",
      pro: "Unlimited accounts free",
      proHighlight: true,
      traderSync: "Restricted on basic tiers",
      traderSyncHighlight: false,
    },
    {
      feature: "User Interface (UI)",
      pro: "Clean, distraction-free, modern dark-mode",
      proHighlight: true,
      traderSync: "Cluttered, complex dashboards & charts",
      traderSyncHighlight: false,
    },
    {
      feature: "Day-Wise Equity Curves",
      pro: "Yes (Automatic growth charts)",
      proHighlight: true,
      traderSync: "Yes (But limited on cheaper tiers)",
      traderSyncHighlight: false,
    },
    {
      feature: "Live Market Sync Rooms",
      pro: "Yes (Stream & synchronize forex & gold)",
      proHighlight: true,
      traderSync: "No (Journal only)",
      traderSyncHighlight: false,
    },
    {
      feature: "Interactive Calculators",
      pro: "Yes (Profit/Loss & consistency sizers)",
      proHighlight: true,
      traderSync: "Basic tools only",
      traderSyncHighlight: false,
    },
    {
      feature: "Lag & Load Speed",
      pro: "Ultra-Fast (Client-side optimizations)",
      proHighlight: true,
      traderSync: "Slow (Heavy reporting modules)",
      traderSyncHighlight: false,
    }
  ];

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

      <div className="container relative z-10 mx-auto px-6 max-w-5xl flex-1 pb-20">
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
            <Layers className="w-3 h-3" /> Competitor Comparison
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            The Free, Modern <span className="text-primary">TraderSync</span> Alternative
          </h1>
          <p className="text-[15px] sm:text-lg text-muted-foreground leading-relaxed">
            Why pay $360 to $960 per year for a trading journal? TradeTracker Pro provides lightning-fast analytics, isolated broker workspaces, and position sizing calculators entirely for free.
          </p>
        </div>

        {/* Comparison Table Section */}
        <section className="mb-20">
          <div className="border border-border/30 rounded-xl bg-card/45 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">Feature</th>
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary bg-primary/3">TradeTracker Pro</th>
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">TraderSync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 sm:p-5 text-xs sm:text-sm font-semibold text-foreground">{row.feature}</td>
                      <td className={`p-4 sm:p-5 text-xs sm:text-sm font-medium bg-primary/3 ${row.proHighlight ? "text-emerald-400" : "text-foreground"}`}>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          {row.pro}
                        </span>
                      </td>
                      <td className={`p-4 sm:p-5 text-xs sm:text-sm ${row.traderSyncHighlight ? "text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                        <span className="flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {row.traderSync}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Features Showcase Cards */}
        <section className="mb-20 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
            Why Traders Choose TradeTracker Pro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">100% Free Forever</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No subscription models, no credit cards required, and no hidden features locked behind paywalls. Get full platform access at no cost.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Instant Clean Dashboards</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Rather than fighting complex charting tools or cluttered spreadsheets, get straight to the statistics that matter: Win Rate, R:R, and Day-Wise curves.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Multiple Isolations</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Create independent sub-accounts for different funding setups or brokers (MT5, Exness, TradingView) to track different strategies separately.
              </p>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 border border-border/30 rounded-2xl bg-card/30 relative overflow-hidden text-center mb-16 px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Stop Paying for Journaling Software
            </h2>
            <p className="text-[14px] text-muted-foreground mb-6 leading-relaxed">
              Get clean, professional-grade analytics for $0. Build your trading workspace today and see the difference.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                asChild
                className="h-11 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm shadow-primary/15"
              >
                <Link href="/auth/sign-up">
                  Get Started Free <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
