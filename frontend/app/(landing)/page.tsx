import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  ArrowRight,
  Zap,
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Activity,
  Calendar,
  Link2,
  DollarSign,
  Star,
  Users,
  ChevronRight,
  PieChart,
  Eye,
  ArrowUpRight,
  MousePointerClick,
  Layers,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/* ─────────────────────── Mock Preview Components ─────────────────────── */

function DashboardMockup() {
  return (
    <div className="relative group">
      {/* Glow behind card */}
      <div className="absolute -inset-px rounded-2xl bg-primary/20 blur-xl opacity-40" />
      <div className="relative rounded-2xl border border-border/70 bg-card shadow-2xl shadow-black/10 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-6 h-5 rounded bg-muted/40 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground/70 font-mono">
              tradetrackerpro.com/analytics
            </span>
          </div>
        </div>

        {/* Sidebar + Content layout */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden md:flex w-12 border-r border-border/40 bg-muted/10 flex-col items-center py-3 gap-2.5">
            {[LayoutDashboard, BarChart3, BookOpen, Calendar, Link2].map(
              (Icon, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${idx === 1 ? "bg-primary/15 text-primary" : "text-muted-foreground/40 hover:text-muted-foreground/60"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              ),
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 space-y-3">
            {/* Stat row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                {
                  label: "Total P&L",
                  value: "+$14,280",
                  sub: "+12.4%",
                  icon: DollarSign,
                  color: "emerald",
                },
                {
                  label: "Win Rate",
                  value: "73.2%",
                  sub: "+3.1%",
                  icon: Target,
                  color: "emerald",
                },
                {
                  label: "Trades",
                  value: "248",
                  sub: "+18 this wk",
                  icon: BarChart3,
                  color: "emerald",
                },
                {
                  label: "Avg R:R",
                  value: "2.4:1",
                  sub: "Excellent",
                  icon: TrendingUp,
                  color: "blue",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-lg p-2.5 border border-border/30 bg-background/60 relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 w-0.5 h-full bg-${s.color}-500/50`}
                  />
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
                      {s.label}
                    </span>
                    <s.icon className="w-3 h-3 text-muted-foreground/30" />
                  </div>
                  <div className="text-base font-bold font-mono text-foreground leading-none">
                    {s.value}
                  </div>
                  <div className="text-[9px] text-emerald-500 font-semibold mt-0.5">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-lg border border-border/30 bg-background/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-foreground/70">
                  Cumulative P&L
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  +$4,820
                </span>
              </div>
              <div className="h-20 flex items-end gap-px">
                {[
                  30, 45, 25, 60, 40, 70, 50, 75, 35, 65, 55, 80, 45, 72, 60,
                  85, 68, 82, 50, 78, 62, 88, 70, 92, 65, 85, 75, 95,
                ].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-t-xs"
                    style={{
                      height: `${h}%`,
                      backgroundColor:
                        h > 48 ? "rgba(16,185,129,0.5)" : "rgba(244,63,94,0.4)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mini trade list */}
            <div className="rounded-lg border border-border/30 bg-background/40 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/20">
                <span className="text-[9px] font-bold text-foreground/70 uppercase tracking-wider">
                  Recent Trades
                </span>
              </div>
              {[
                { pair: "EUR/USD", dir: "BUY", pnl: "+$342", w: true },
                { pair: "GBP/JPY", dir: "SELL", pnl: "-$127", w: false },
                { pair: "XAU/USD", dir: "BUY", pnl: "+$891", w: true },
              ].map((t, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 flex items-center text-[10px] border-b border-border/10 last:border-0"
                >
                  <span className="font-bold text-foreground/80 w-16">
                    {t.pair}
                  </span>
                  <span className="text-muted-foreground/50 w-10">{t.dir}</span>
                  <span className="flex-1" />
                  <span
                    className={`font-bold font-mono ${t.w ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {t.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureMockAnalytics() {
  return (
    <div className="space-y-3">
      {/* Strategy breakdown */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border/30 bg-muted/10">
          <div className="text-[11px] font-bold text-foreground">
            Strategy Performance
          </div>
        </div>
        <div className="p-4 space-y-3.5">
          {[
            { name: "Breakout", wr: 78, tr: 42, clr: "bg-primary" },
            { name: "Pullback", wr: 65, tr: 38, clr: "bg-violet-500" },
            { name: "Scalp", wr: 71, tr: 56, clr: "bg-emerald-500" },
            { name: "Reversal", wr: 58, tr: 24, clr: "bg-amber-500" },
          ].map((s, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-foreground">
                  {s.name}
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-muted-foreground">{s.tr} trades</span>
                  <span className="font-bold text-emerald-500">{s.wr}%</span>
                </div>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${s.clr} rounded-full`}
                  style={{ width: `${s.wr}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade list */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border/30 bg-muted/10 flex justify-between items-center">
          <span className="text-[11px] font-bold text-foreground">
            Recent Trades
          </span>
          <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
            Last 7 days
          </span>
        </div>
        <div className="divide-y divide-border/20">
          {[
            {
              sym: "EUR/USD",
              dir: "BUY",
              pnl: "+$342.50",
              date: "Mar 1",
              rr: "2.8:1",
              w: true,
            },
            {
              sym: "GBP/JPY",
              dir: "SELL",
              pnl: "-$127.00",
              date: "Feb 28",
              rr: "0.6:1",
              w: false,
            },
            {
              sym: "XAU/USD",
              dir: "BUY",
              pnl: "+$891.20",
              date: "Feb 27",
              rr: "3.2:1",
              w: true,
            },
            {
              sym: "USD/JPY",
              dir: "SELL",
              pnl: "+$215.00",
              date: "Feb 26",
              rr: "1.9:1",
              w: true,
            },
          ].map((t, i) => (
            <div
              key={i}
              className="px-4 py-2.5 flex items-center gap-3 text-[11px]"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground">{t.sym}</div>
                <div className="text-muted-foreground/60 text-[10px]">
                  {t.date} · {t.dir}
                </div>
              </div>
              <span className="text-muted-foreground/50 font-mono text-[10px]">
                {t.rr}
              </span>
              <span
                className={`font-bold font-mono ${t.w ? "text-emerald-500" : "text-rose-500"}`}
              >
                {t.pnl}
              </span>
              <span
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${t.w ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
              >
                {t.w ? "WON" : "LOST"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureMockJournal() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border/30 bg-muted/10">
        <div className="text-[11px] font-bold text-foreground">
          New Trade Entry
        </div>
        <div className="text-[10px] text-muted-foreground">
          Log a trade in seconds
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          { label: "Symbol", value: "EUR/USD", icon: "🔤" },
          { label: "Type", value: "BUY (Long)", icon: "📈" },
          { label: "Entry Price", value: "1.08542", icon: "🎯" },
          { label: "Exit Price", value: "1.08891", icon: "🏁" },
          { label: "Lot Size", value: "1.00", icon: "📊" },
          { label: "Stop Loss", value: "1.08350", icon: "🛑" },
          { label: "Take Profit", value: "1.09100", icon: "✅" },
          { label: "Strategy", value: "Breakout", icon: "⚡" },
        ].map((f, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="text-[10px]">{f.icon}</span> {f.label}
            </span>
            <span className="text-[11px] font-mono font-medium text-foreground bg-muted/30 border border-border/30 px-2.5 py-1 rounded-md">
              {f.value}
            </span>
          </div>
        ))}
        <div className="pt-3 flex gap-2">
          <div className="flex-1 h-9 bg-primary rounded-lg flex items-center justify-center text-[11px] font-semibold text-primary-foreground shadow-sm shadow-primary/20">
            Save Trade
          </div>
          <div className="h-9 px-3 border border-border/50 rounded-lg flex items-center justify-center text-[11px] text-muted-foreground">
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureMockBroker() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border/30 bg-muted/10">
        <div className="text-[11px] font-bold text-foreground">
          Broker Connections
        </div>
        <div className="text-[10px] text-muted-foreground">
          Auto-sync your trading accounts
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          {
            name: "Exness",
            status: "Connected",
            synced: "2 min ago",
            trades: 142,
            profit: "+$8,420",
          },
          {
            name: "MetaTrader 5",
            status: "Connected",
            synced: "5 min ago",
            trades: 89,
            profit: "+$5,860",
          },
        ].map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-background/50"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-foreground">
                  {b.name}
                </span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {b.status}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {b.trades} trades · {b.profit} profit · Synced {b.synced}
              </div>
            </div>
          </div>
        ))}
        <div className="pt-1">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border/50 bg-muted/10">
            <div className="w-9 h-9 rounded-lg border border-border/40 flex items-center justify-center shrink-0">
              <span className="text-muted-foreground/40 text-lg">+</span>
            </div>
            <div className="flex-1">
              <span className="text-[11px] text-muted-foreground">
                Connect another broker...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Page ─────────────────────── */

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-2xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight">
              TradeTracker<span className="text-primary">Pro</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5 text-[13px]">
            {["Features", "How It Works", "Pricing"].map((label) => (
              <Link
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              href="/auth/login"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Button
              asChild
              size="sm"
              className="h-8 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold"
            >
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-8 md:pt-32 md:pb-12">
        {/* Grid background pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-linear-to-t from-background to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[11px] font-medium text-muted-foreground mb-5 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Trusted by 2,000+ traders worldwide
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-4">
              The trading journal
              <br />
              that helps you{" "}
              <span className="relative">
                <span className="text-primary">win more</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2 text-primary/30"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C40 2 80 2 100 4C120 6 160 3 199 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-muted-foreground text-base md:text-[17px] leading-relaxed max-w-xl mx-auto mb-7">
              Log trades, auto-sync with MT5 and Exness, get deep analytics on
              your performance, and discover exactly what makes you profitable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
              <Button
                asChild
                size="lg"
                className="h-10 px-5 text-[13px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm shadow-primary/15"
              >
                <Link href="/auth/sign-up">
                  Start Free — No Card Needed{" "}
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-10 px-5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Link href="#features">
                  See what&apos;s inside{" "}
                  <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground/70">
              {[
                "100% free to start",
                "Auto broker sync",
                "Real-time analytics",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500/70" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard Preview with perspective */}
          <div className="max-w-5xl mx-auto" style={{ perspective: "2000px" }}>
            <div style={{ transform: "rotateX(2deg)" }}>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Logos / Stats bar ── */}
      <section className="py-8 border-y border-border/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Active Traders", value: "2,000+", icon: Users },
              { label: "Volume Tracked", value: "$50M+", icon: DollarSign },
              { label: "Strategies Tested", value: "15K+", icon: Target },
              { label: "Platform Uptime", value: "99.9%", icon: Zap },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <s.icon className="w-4 h-4 text-muted-foreground/30 mb-0.5" />
                <div className="text-xl md:text-2xl font-bold font-mono text-foreground leading-none">
                  {s.value}
                </div>
                <div className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Showcases ── */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
              <Layers className="w-3 h-3" /> Features
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Professional tools, zero complexity
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Everything serious traders need — from quick trade logging to deep
              performance analytics and auto broker sync.
            </p>
          </div>

          {/* Feature 1 — Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start mb-24">
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/8 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
                <BarChart3 className="w-3 h-3" /> Analytics
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2.5 leading-snug">
                See what&apos;s actually making you money
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Cumulative P&L charts, strategy breakdowns, trade distribution,
                and real-time stat cards. No guessing — just data.
              </p>
              <div className="space-y-2.5">
                {[
                  "Cumulative P&L tracking",
                  "Per-strategy win rate comparison",
                  "BUY vs SELL distribution",
                  "Live performance metrics",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-[13px] text-muted-foreground">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <FeatureMockAnalytics />
            </div>
          </div>

          {/* Feature 2 — Journal */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start mb-24">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <FeatureMockJournal />
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/8 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
                <BookOpen className="w-3 h-3" /> Journaling
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2.5 leading-snug">
                Log every trade in under 30 seconds
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Clean, fast entry with every field that matters — symbol,
                prices, SL/TP, quantity, strategy, and notes. No bloat.
              </p>
              <div className="space-y-2.5">
                {[
                  "Quick trade entry form",
                  "SL & TP tracking",
                  "Strategy tagging",
                  "Screenshot attachments",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-[13px] text-muted-foreground">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3 — Broker Sync */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/8 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
                <Link2 className="w-3 h-3" /> Integrations
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2.5 leading-snug">
                Auto-sync trades from your broker
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Connect Exness or MetaTrader 5 once. Your trade history and P&L
                sync automatically — no more manual entry.
              </p>
              <div className="space-y-2.5">
                {[
                  "One-click Exness connect",
                  "MT5 account sync",
                  "Automatic P&L calculation",
                  "Real-time order import",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-[13px] text-muted-foreground">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <FeatureMockBroker />
            </div>
          </div>
        </div>
      </section>

      {/* ── More Features ── */}
      <section className="py-16 border-t border-border/30 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-lg font-bold">And there&apos;s more</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {[
              {
                icon: LayoutDashboard,
                title: "Unified Dashboard",
                desc: "One hub for trade entry, stats, and quick actions.",
              },
              {
                icon: Calendar,
                title: "Economic Calendar",
                desc: "Forex Factory data so you never trade into news blind.",
                badge: "SOON",
              },
              {
                icon: Target,
                title: "Strategy Refining",
                desc: "Compare strategies and find positive expectancy.",
              },
              {
                icon: PieChart,
                title: "Trade Distribution",
                desc: "BUY vs SELL breakdown and instrument allocation.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Encrypted data. You own everything.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Modern stack. Loads in under a second.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg border border-border/30 bg-card/50 hover:bg-card hover:border-border/50 transition-all"
              >
                <div className="w-8 h-8 rounded-md bg-primary/8 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-semibold">{f.title}</h4>
                    {f.badge && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="py-20 md:py-24 border-t border-border/30"
      >
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
              <MousePointerClick className="w-3 h-3" /> Getting Started
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Up and running in 3 minutes
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px border-t border-dashed border-border/50" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: BookOpen,
                  title: "Log Your Trades",
                  desc: "Enter trades manually or auto-sync from MT5 / Exness. Under 30 seconds per trade.",
                },
                {
                  icon: Link2,
                  title: "Connect Broker",
                  desc: "One-click broker integration. Your order history and P&L sync in real time.",
                },
                {
                  icon: TrendingUp,
                  title: "Analyze & Win",
                  desc: "Analytics reveal your edge. Refine your strategy and grow your account.",
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-14 h-14 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-sm">
                      <item.icon className="w-5.5 h-5.5 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold font-mono flex items-center justify-center shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-65 mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 border-t border-border/30 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
              <Star className="w-3 h-3" /> Reviews
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Loved by traders everywhere
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                name: "Alex M.",
                role: "Forex · 3 years",
                quote:
                  "Improved my win rate from 48% to 71% in 3 months. The strategy breakdown alone changed how I trade.",
              },
              {
                name: "Priya K.",
                role: "Algo & PA trader",
                quote:
                  "Broker sync saves me 2+ hours weekly. All MT5 trades auto-imported with full P&L + RR breakdowns.",
              },
              {
                name: "Marcus T.",
                role: "Swing trader",
                quote:
                  "Finally a journal that isn't a spreadsheet. Clean, fast, and the equity curve visualization keeps me accountable.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-border/40 bg-card/80 hover:border-border/60 transition-colors"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="w-3 h-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[13px] text-foreground/80 leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-foreground">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        id="pricing"
        className="py-20 md:py-28 border-t border-border/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-primary/5 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Ready to find your edge?
            </h2>
            <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
              Join 2,000+ traders using TradeTracker Pro to track performance
              and grow their accounts. Free forever — no credit card.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2.5">
              <Button
                asChild
                size="lg"
                className="h-10 px-6 text-[13px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm shadow-primary/15"
              >
                <Link href="/auth/sign-up">
                  Get Started Free <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-10 px-6 text-[13px] rounded-lg border-border/60"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-7">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center">
                  <Activity className="w-3 h-3" />
                </div>
                <span className="text-sm font-bold">
                  TradeTracker<span className="text-primary">Pro</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed max-w-50">
                Professional trading journal for traders who want real results.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: [
                  { l: "Features", h: "#features" },
                  { l: "Pricing", h: "#pricing" },
                  { l: "Changelog", h: "#" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { l: "Help Center", h: "/help" },
                  { l: "Community", h: "#" },
                  { l: "Blog", h: "#" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { l: "Privacy", h: "#" },
                  { l: "Terms", h: "#" },
                  { l: "Security", h: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-[11px] mb-2.5 text-foreground/80">
                  {col.title}
                </h4>
                <ul className="space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link.l}>
                      <Link
                        href={link.h}
                        className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
                      >
                        {link.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/20 pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-muted-foreground/50">
            <p>
              &copy; {new Date().getFullYear()} TradeTracker Pro. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              {["Twitter", "Discord", "GitHub"].map((s) => (
                <Link
                  key={s}
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
