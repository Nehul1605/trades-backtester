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
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "TradeTracker Pro",
  description: "Comparing TradeTracker Pro vs Excel spreadsheet journals. Discover why TradeTracker Pro is the best free alternative with automated day-wise equity curves, P&L heatmaps, and lot calculators instead of tedious manual spreadsheets.",
  keywords: [
    "Excel trading journal alternative",
    "free excel trade log",
    "trading journal excel template",
    "automated trading log vs excel",
    "best free trading log alternative"
  ]
};

export default async function ExcelComparisonPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const comparisonRows = [
    {
      feature: "Manual vs Automated",
      pro: "Fully Automated (Instantly parses Win Rate, R:R, & P&L)",
      proHighlight: true,
      excel: "100% Manual (Requires typing every entry, exit, & formula)",
      excelHighlight: false,
    },
    {
      feature: "Setup Effort",
      pro: "Zero Setup (Create account and log in 1 minute)",
      proHighlight: true,
      excel: "High (Hours writing custom formulas, charts & conditional rules)",
      excelHighlight: false,
    },
    {
      feature: "P&L Heatmaps",
      pro: "Yes (Live visual calendars update automatically)",
      proHighlight: true,
      excel: "No (Requires complex VBA or conditional formatting scripts)",
      excelHighlight: false,
    },
    {
      feature: "Image & Screenshot Sync",
      pro: "Yes (Attach chart screenshot directly to each trade entry)",
      proHighlight: true,
      excel: "No (Images bloat Excel file size and break rows)",
      excelHighlight: false,
    },
    {
      feature: "Formula Breakage",
      pro: "Zero (Managed cloud system with database logs)",
      proHighlight: true,
      excel: "High (Accidentally deleting one cell breaks all metrics)",
      excelHighlight: false,
    },
    {
      feature: "Broker Accounts Isolation",
      pro: "Yes (Isolated workspaces for Live, Demo & Backtesting)",
      proHighlight: true,
      excel: "No (Requires copying whole spreadsheet tabs manually)",
      excelHighlight: false,
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
            <FileText className="w-3 h-3" /> Spreadsheet Alternative
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            The Free, Automated <span className="text-primary">Excel</span> Trading Journal Alternate
          </h1>
          <p className="text-[15px] sm:text-lg text-muted-foreground leading-relaxed">
            Stop wasting time correcting broken formulas in Excel, Google Sheets, or Numbers. Log your trades, upload screenshots, and let our database automatically generate clean equity curves and visual calendar heatmaps.
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
                    <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">Excel / Google Sheets</th>
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
                      <td className={`p-4 sm:p-5 text-xs sm:text-sm ${row.excelHighlight ? "text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                        <span className="flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {row.excel}
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
            Ditch the Spreadsheet Headaches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Visual Calendar Heatmaps</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Google Sheets makes it incredibly hard to view monthly profit summaries visually. Get automated green/red day coloring out-of-the-box.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Automatic Equity Curves</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Watch your day-wise growth charts calculate and scale automatically based on profit and loss inputs without building custom graphing matrices.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Position Risk Calculators</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No more guessing lot sizes or risk reward ratios. Input entry, stop-loss, and contract details to calculate parameters dynamically.
              </p>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 border border-border/30 rounded-2xl bg-card/30 relative overflow-hidden text-center mb-16 px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready for an Automated Workspace?
            </h2>
            <p className="text-[14px] text-muted-foreground mb-6 leading-relaxed">
              Start logging your gold and forex trades in an institutional-grade, free environment today.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                asChild
                className="h-11 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm shadow-primary/15"
              >
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link href="/auth/sign-up">
                    Create Free Account <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </Link>
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
