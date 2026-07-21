import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
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
  Calendar,
  DollarSign,
  Star,
  Users,
  ChevronRight,
  PieChart,
  Eye,
  ArrowUpRight,
  MousePointerClick,
  Layers,
  Camera,
  Calculator,
  Table2,
  LineChart,
  Wallet,
  UserCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/* ─────────────────────── Mock Preview Components ─────────────────────── */

function DashboardMockup() {
  return (
    <div className="relative group">
      {/* Glow behind card */}
      <div className="absolute -inset-1 rounded-2xl bg-primary/15 blur-2xl opacity-60" />
      <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/20 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-6 h-5 rounded bg-muted/40 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground/70 font-mono">
              tradetrackerpro.in/dashboard
            </span>
          </div>
        </div>

        {/* Sidebar + Content layout */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden md:flex w-12 border-r border-border/40 bg-muted/10 flex-col items-center py-3 gap-2.5">
            {[LayoutDashboard, TrendingUp, Calendar, Calculator, Eye].map(
              (Icon, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${idx === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground/40 hover:text-muted-foreground/60"}`}
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
                  label: "Balance",
                  value: "$12,480",
                  sub: "+$2,480",
                  color: "emerald",
                },
                {
                  label: "Win Rate",
                  value: "68.5%",
                  sub: "73 / 34 trades",
                  color: "emerald",
                },
                {
                  label: "Best Day",
                  value: "+$891",
                  sub: "Jul 14",
                  color: "emerald",
                },
                {
                  label: "Avg R:R",
                  value: "1.8:1",
                  sub: "Positive edge",
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
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 block mb-1">
                    {s.label}
                  </span>
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
                  Balance Growth (Day-wise)
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  +$2,480
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
                { pair: "XAUUSD", dir: "BUY", pnl: "+$342", w: true },
                { pair: "EURUSD", dir: "SELL", pnl: "-$127", w: false },
                { pair: "GBPJPY", dir: "BUY", pnl: "+$891", w: true },
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

/* ─────────────────────── Page ─────────────────────── */

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: LayoutDashboard,
      title: "Multi-Account Workspaces",
      desc: "Create unlimited MT5 and Exness broker accounts. Each gets its own isolated dashboard with dedicated stats, trades, and equity curves.",
    },
    {
      icon: BookOpen,
      title: "Professional Trade Journal",
      desc: "Log every trade with entry/exit prices, stop-loss, take-profit, lot size, strategy tags, notes, and chart screenshot attachments.",
    },
    {
      icon: LineChart,
      title: "Day-Wise Equity Curves",
      desc: "Visualize your account balance growth aggregated by calendar day. See exactly how your balance evolved over time against an initial deposit reference.",
    },
    {
      icon: Calendar,
      title: "Trading Calendar Heatmap",
      desc: "Interactive monthly grid highlighting profitable and losing days with color-coded cells. Weekly P&L summaries keep you accountable.",
    },
    {
      icon: PieChart,
      title: "Strategy & Distribution Analytics",
      desc: "Breakdown win rates by strategy name, compare BUY vs SELL performance, and identify which setups give you positive expectancy.",
    },
    {
      icon: Calculator,
      title: "P&L Calculator",
      desc: "Built-in profit and loss calculator supporting forex pairs, gold, and indices. Input your entry, exit, and lot size to instantly compute risk-to-reward.",
    },
    {
      icon: Camera,
      title: "Auto-Compressed Screenshots",
      desc: "Attach chart screenshots to any trade entry. Images are automatically resized and compressed to JPEG on the client side before upload — saving bandwidth.",
    },
    {
      icon: Table2,
      title: "Spreadsheet Ledger View",
      desc: "Compact tabular view to scan through your entire trade history. Sort, filter, and manage open and closed positions from a single glanceable table.",
    },
    {
      icon: UserCheck,
      title: "Referral Verification Program",
      desc: "Register your broker account under our partner links. Once admin-verified, unlock full access to premium journaling workspaces and advanced analytics.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-2xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 w-48 overflow-hidden rounded-lg">
              <img
                src="/logo.png"
                className="h-10 w-auto max-w-none absolute left-0 top-0 select-none pointer-events-none"
                alt="TradeTracker Pro Logo"
              />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5 text-sm">
            {["Features", "How It Works", "Reviews"].map((label) => (
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
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Button
              asChild
              size="sm"
              className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-[13px] font-semibold shadow-sm shadow-primary/20"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground mb-5 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Professional Trading Journal & Backtesting Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-4">
              Track every trade.
              <br />
              Find your{" "}
              <span className="relative">
                <span className="text-primary">edge</span>
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

            <p className="text-muted-foreground text-[17px] md:text-lg leading-relaxed max-w-xl mx-auto mb-7">
              A professional trade journaling platform for forex and gold traders. Log trades, attach chart screenshots, analyze strategy performance, and track your balance growth — all from one premium workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
              <Button
                asChild
                size="lg"
                className="h-11 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm shadow-primary/15"
              >
                <Link href="/auth/sign-up">
                  Start Journaling Free{" "}
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-11 px-6 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Link href="#features">
                  Explore Features{" "}
                  <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-[13px] text-muted-foreground/70">
              {[
                "Free to start",
                "No credit card required",
                "Multi-account support",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" /> {t}
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

      {/* ── Stats bar ── */}
      <section className="py-8 border-y border-border/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Instruments", value: "Forex & Gold", icon: TrendingUp },
              { label: "Workspace Tabs", value: "6 per account", icon: LayoutDashboard },
              { label: "Screenshot Compression", value: "Auto JPEG", icon: Camera },
              { label: "Platform", value: "MT5 / Exness", icon: Wallet },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <s.icon className="w-4 h-4 text-muted-foreground/30 mb-0.5" />
                <div className="text-lg md:text-xl font-bold text-foreground leading-none">
                  {s.value}
                </div>
                <div className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
              <Layers className="w-3 h-3" /> Platform Features
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Everything a serious trader needs
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              From quick trade logging with screenshot evidence to deep calendar analytics and multi-account management — built for traders who want real accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div
                key={i}
                className="group flex flex-col gap-3 p-5 rounded-xl border border-border/30 bg-card/50 hover:bg-card hover:border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/12 transition-colors">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold mb-1">{f.title}</h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workspace Showcase ── */}
      <section className="py-20 border-t border-border/30 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
              <Eye className="w-3 h-3" /> Inside the Workspace
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              6 tabs. One workspace. Total control.
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              Each broker account opens into a full workspace with six dedicated tabs — so you never lose context switching between analysis modes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {[
              { icon: BarChart3, label: "Overview", desc: "Balance, equity curve & key stats" },
              { icon: Table2, label: "Trades", desc: "Spreadsheet ledger of all positions" },
              { icon: Calendar, label: "Calendar", desc: "Monthly P&L heatmap grid" },
              { icon: Target, label: "Stats", desc: "Win rate, drawdown & metrics" },
              { icon: PieChart, label: "Analytics", desc: "Strategy & distribution charts" },
              { icon: BookOpen, label: "Add Trade", desc: "Quick journal entry terminal" },
            ].map((tab, i) => (
              <div
                key={i}
                className="text-center p-4 rounded-xl border border-border/30 bg-card/60 hover:bg-card hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2.5">
                  <tab.icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-[13px] font-bold text-foreground mb-0.5">{tab.label}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">{tab.desc}</div>
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
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
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
                  icon: UserCheck,
                  title: "Sign Up & Verify",
                  desc: "Create your account, register your broker ID under our partner link, and get verified by our admin team.",
                },
                {
                  icon: BookOpen,
                  title: "Journal Your Trades",
                  desc: "Log every trade with entry/exit prices, SL/TP levels, strategy tags, notes, and attach chart screenshots.",
                },
                {
                  icon: LineChart,
                  title: "Analyze & Grow",
                  desc: "Review equity curves, calendar heatmaps, strategy breakdowns, and stat cards to discover and refine your trading edge.",
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
                  <h3 className="text-[15px] font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-65 mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="reviews" className="py-20 border-t border-border/30 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
              <Star className="w-3 h-3" /> Reviews
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Trusted by traders who care about data
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                name: "Rahul S.",
                role: "Forex · MT5 Trader",
                quote:
                  "Finally a journal that doesn't feel like a spreadsheet. The calendar heatmap alone changed how I review my trading weeks.",
              },
              {
                name: "Priya K.",
                role: "Gold & Indices",
                quote:
                  "Being able to attach screenshots to each trade and see my day-wise equity curve keeps me disciplined. No other free tool does this.",
              },
              {
                name: "Arjun M.",
                role: "Swing Trader · Exness",
                quote:
                  "Managing 3 different MT5 accounts in separate workspaces is a game changer. Each has its own stats, calendar, and trade log.",
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
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-foreground">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
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
              Start tracking your edge today
            </h2>
            <p className="text-[15px] text-muted-foreground mb-7 leading-relaxed">
              Join traders using TradeTracker Pro to journal their executions, analyze their strategies, and build real consistency. Free to start — no credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2.5">
              <Button
                asChild
                size="lg"
                className="h-11 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm shadow-primary/15"
              >
                <Link href="/auth/sign-up">
                  Create Free Account <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 px-6 text-sm rounded-lg border-border/60"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 bg-card/30">
        <div className="container mx-auto px-6">
          {/* Main footer grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-2 pr-4">
              <div className="mb-3">
                <div className="relative h-10 w-48 overflow-hidden rounded-lg">
                  <img
                    src="/logo.png"
                    className="h-10 w-auto max-w-none absolute left-0 top-0 select-none pointer-events-none"
                    alt="TradeTracker Pro Logo"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-72 mb-4">
                A professional trade journaling and backtesting platform built for forex and gold traders. Track your executions, analyze your edge, and grow with data — not guesswork.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "X", href: "#" },
                  { label: "Instagram", href: "#" },
                  { label: "Telegram", href: "#" },
                ].map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 hover:text-primary transition-colors px-2.5 py-1.5 rounded-md border border-border/30 hover:border-primary/20"
                  >
                    {social.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-foreground/80 mb-3">
                Platform
              </h4>
              <ul className="space-y-2.5">
                {[
                  { l: "Dashboard Console", h: "/dashboard" },
                  { l: "Prop Consistency", h: "/consistency-calculator" },
                  { l: "Live Forex Market", h: "/market" },
                  { l: "P&L Calculator", h: "/pl-calculator" },
                ].map((link) => (
                  <li key={link.l}>
                    <Link
                      href={link.h}
                      className="text-[13px] text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-foreground/80 mb-3">
                Company
              </h4>
              <ul className="space-y-2.5">
                {[
                  { l: "Core Features", h: "#features" },
                  { l: "How It Works", h: "#how-it-works" },
                  { l: "Trader Reviews", h: "#reviews" },
                ].map((link) => (
                  <li key={link.l}>
                    <Link
                      href={link.h}
                      className="text-[13px] text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-foreground/80 mb-3">
                Support
              </h4>
              <ul className="space-y-2.5">
                {[
                  { l: "Help Center", h: "/help" },
                  { l: "Account Settings", h: "/settings" },
                  { l: "Privacy Policy", h: "#" },
                  { l: "Terms of Service", h: "#" },
                ].map((link) => (
                  <li key={link.l}>
                    <Link
                      href={link.h}
                      className="text-[13px] text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-border/20 py-4">
            <p className="text-xs text-muted-foreground/40 leading-relaxed max-w-5xl">
              <span className="font-semibold text-muted-foreground/50">Risk Disclaimer:</span>{" "}
              Trading forex, gold, and other financial instruments involves substantial risk and is not suitable for all investors. Past performance recorded in this journal does not guarantee future results. TradeTracker Pro is a journaling and analytics tool — it does not provide financial advice, trade signals, or investment recommendations.
            </p>
          </div>

          {/* Copyright bar */}
          <div className="border-t border-border/20 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground/50">
            <p>
              &copy; {new Date().getFullYear()} TradeTracker Pro. All rights reserved.
            </p>
            <p>
              Made for traders, by traders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
