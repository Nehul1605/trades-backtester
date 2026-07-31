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

export const metadata: Metadata = {
  title: "Notion Trading Journal Alternative | Free Trade Tracker Template Alternate",
  description: "Comparing TradeTracker Pro vs Notion trading journals. Discover why TradeTracker Pro is the best free alternative with automated day-wise equity curves, P&L heatmaps, and lot calculators instead of tedious manual spreadsheets.",
  keywords: [
    "notion trading journal alternative",
    "notion trade tracker alternative",
    "notion.site alternate",
    "notion trading journal template alternative",
    "free trade journal",
    "automated trading journal vs notion",
    "best free trading log",
    "forex trading journal",
    "crypto trading log alternative"
  ]
};

export default function NotionComparisonPage() {
  const comparisonRows = [
    {
      feature: "Setup Effort",
      pro: "Zero Setup (Ready in 1 minute)",
      proHighlight: true,
      notion: "High (Hours of database config & manual formulas)",
      notionHighlight: false,
    },
    {
      feature: "Monthly Pricing",
      pro: "100% Free ($0/mo)",
      proHighlight: true,
      notion: "Free tier, but premium templates cost $20-$100+",
      notionHighlight: false,
    },
    {
      feature: "Automated P&L Metrics",
      pro: "Yes (Win rate, R:R, profit factor, win streaks)",
      proHighlight: true,
      notion: "No (Requires manual formulas & complex rollups)",
      notionHighlight: false,
    },
    {
      feature: "Equity & Balance Curves",
      pro: "Yes (Live interactive charts)",
      proHighlight: true,
      notion: "No (Notion doesn't natively support dynamic charts)",
      notionHighlight: false,
    },
    {
      feature: "Calendar Heatmap",
      pro: "Yes (Automated Monthly P&L Grid)",
      proHighlight: true,
      notion: "No (Manual calendar view without visual profit coloring)",
      notionHighlight: false,
    },
    {
      feature: "Built-In Trade Calculators",
      pro: "Yes (Position sizing & risk reward)",
      proHighlight: true,
      notion: "No (Requires external sites or manual typing)",
      notionHighlight: false,
    },
    {
      feature: "Page Load Speed & Lag",
      pro: "Ultra-Fast (Client-compressed image uploads)",
      proHighlight: true,
      notion: "Very slow & laggy (With large trade databases)",
      notionHighlight: false,
    },
    {
      feature: "Isolated Broker Workspaces",
      pro: "Yes (Separate live, demo, or broker accounts)",
      proHighlight: true,
      notion: "No (Requires duplicate database pages)",
      notionHighlight: false,
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
            <FileText className="w-3 h-3" /> Notion Alternative
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            The Free, Automated <span className="text-primary">Notion</span> Trading Journal Alternate
          </h1>
          <p className="text-[15px] sm:text-lg text-muted-foreground leading-relaxed">
            Stop wasting hours building complex Notion databases or spending money on templates. Track your forex, gold, and crypto trades with an automated dashboard built specifically for active traders.
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
                      TradeTracker Pro (Automated)
                    </th>
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Notion Templates (Manual)
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
                          {row.notionHighlight ? (
                            <Check className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                          )}
                          <span>{row.notion}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Notion Users Switch */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why Traders Move From Notion to TradeTracker Pro
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Instant Automated Charts</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Notion can't easily plot your progress. TradeTracker Pro builds live equity curves, distribution charts, and profit breakdowns automatically.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Dynamic P&L Heatmaps</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                See at a glance which days you make money. Our interactive calendar highlights green and red days automatically as soon as you log a trade.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Zero-Lag Database</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Notion databases get extremely slow once you log a few hundred trades. TradeTracker Pro is a custom developer-grade ledger built for speed.
              </p>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 border border-border/30 rounded-2xl bg-card/30 relative overflow-hidden text-center mb-16 px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ditch the Spreadsheets & Notion Pages
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

      {/* Footer link back */}
      <footer className="border-t border-border/20 py-8 text-center text-xs text-muted-foreground/60">
        <p>&copy; {new Date().getFullYear()} TradeTracker Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
