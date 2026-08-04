import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
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
  HelpCircle,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NavbarMobileMenu } from "@/components/landing/NavbarMobileMenu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "@/components/landing/Footer";
import { InteractiveDashboardMockup } from "@/components/landing/InteractiveDashboardMockup";

// Interactive sandbox mockup

/* ─────────────────────── Page ─────────────────────── */

export const metadata: Metadata = {
  title: "TradeTracker Pro",
  description: "TradeTracker Pro is the best free online trading journal and trade tracker for forex, gold, stocks, and crypto. Log trades, analyze metrics, view calendar heatmaps, and build your edge.",
  keywords: [
    "free trade journal",
    "trade journal",
    "trade journaling free",
    "trade tracker",
    "forex trading journal",
    "gold trading log",
    "best trading journal software",
    "trading journal excel alternative",
    "TradeZella alternative",
    "TraderSync alternative",
    "notion trading journal alternative",
    "notion.site alternate"
  ]
};

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
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              className="h-12 w-auto select-none pointer-events-none"
              alt="TradeTracker Pro Logo"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-0.5 text-sm">
            {["Features", "How It Works", "Reviews"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all cursor-pointer"
              >
                {label}
              </a>
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
            <NavbarMobileMenu />
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
                className="h-11 px-6 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <a href="#features">
                  Explore Features{" "}
                  <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                </a>
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

          {/* Interactive Sandbox Dashboard Preview with perspective */}
          <div id="workspace-showcase" className="max-w-7xl mx-auto" style={{ perspective: "2000px" }}>
            <div style={{ transform: "rotateX(2deg)" }}>
              <InteractiveDashboardMockup />
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
      <section id="features" className="py-20 md:py-28 scroll-mt-10">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
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
      <section id="workspace-details" className="py-20 border-t border-border/30 bg-muted/5">
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
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
        className="py-20 md:py-24 border-t border-border/30 scroll-mt-10"
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

          <div className="relative max-w-6xl mx-auto">
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
      <section id="reviews" className="py-20 border-t border-border/30 bg-muted/5 scroll-mt-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
              <Star className="w-3 h-3" /> Reviews
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Trusted by traders who care about data
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
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

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-20 md:py-24 border-t border-border/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
              <HelpCircle className="w-3.5 h-3.5" /> F.A.Q.
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              Everything you need to know about the ultimate free trade journal and how it compares to platforms like TradeZella.
            </p>
          </div>

          <div className="max-w-3xl mx-auto border border-border/30 rounded-xl bg-card/30 p-2 sm:p-4 backdrop-blur-xs">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-trade-journal" className="border-border/30 px-2 sm:px-4">
                <AccordionTrigger className="text-[14px] sm:text-[15px] font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  What is a trade journal and how does trade journaling help?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed pb-4">
                  A trade journal (also known as a trading log or tracker) is a comprehensive record of all your executed trades. 
                  Trade journaling is the practice of logging details like entry/exit prices, strategies, risk levels, and visual charts. 
                  By consistently keeping a trade journal, you can analyze your trading behaviors, refine your strategies, and 
                  eliminate bad trading habits, which is the fastest way to build long-term profitability.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="is-it-free" className="border-border/30 px-2 sm:px-4">
                <AccordionTrigger className="text-[14px] sm:text-[15px] font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  Is TradeTracker Pro a free trade journal?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed pb-4">
                  Yes! TradeTracker Pro is a 100% free trade journal. We believe professional-grade trading logs, strategy 
                  backtesting software, and calendar analytics should be accessible to every disciplined trader. You can create 
                  multiple workspaces for different broker accounts, track unlimited trades, and upload chart screenshots without paying 
                  monthly subscriptions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="vs-tradezella" className="border-border/30 px-2 sm:px-4">
                <AccordionTrigger className="text-[14px] sm:text-[15px] font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  How does TradeTracker Pro compare to TradeZella or Excel?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed pb-4">
                  Unlike traditional Excel/Spreadsheet trading logs, TradeTracker Pro offers automated calculations, beautiful day-wise 
                  equity curves, and dynamic calendar heatmaps without requiring complex formulas or manual data setups. 
                  Compared to expensive alternatives like TradeZella or TraderSync (which can cost $30–$50/month), TradeTracker Pro 
                  provides a cleaner, ultra-responsive developer-grade workspace, multiple sub-account tracking, and client-side compressed 
                  screenshot hosting completely free of charge.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-markets" className="border-border/30 px-2 sm:px-4">
                <AccordionTrigger className="text-[14px] sm:text-[15px] font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  What assets and markets can I track?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed pb-4">
                  Our trading journal is designed to support a wide range of asset classes. You can easily track and backtest strategies 
                  for Forex currency pairs (such as EURUSD, GBPJPY), Gold (XAUUSD) and commodity instruments, major global Indices (like US30, NAS100), 
                  Cryptocurrencies, and stocks.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="getting-started" className="border-0 px-2 sm:px-4">
                <AccordionTrigger className="text-[14px] sm:text-[15px] font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  How long does it take to start tracking?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed pb-4">
                  Signing up takes less than 3 minutes. Simply create an account, verify your setup through our partner broker options 
                  to unlock full platform features, build your first trading workspace, and begin journaling. No credit card is ever required.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Structured Schema Markup for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://www.tradetrackerpro.in/#software",
                  "name": "TradeTracker Pro",
                  "url": "https://www.tradetrackerpro.in",
                  "operatingSystem": "All",
                  "applicationCategory": "BusinessApplication",
                  "offers": {
                    "@type": "Offer",
                    "price": "0.00",
                    "priceCurrency": "USD"
                  },
                  "description": "The best free trade journal and strategy backtesting software. TradeTracker Pro helps forex, gold, stock, and crypto traders log trades, track metrics, and boost profitability.",
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "154"
                  }
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://www.tradetrackerpro.in/#faq",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "What is a trade journal and how does trade journaling help?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "A trade journal (also known as a trading log or tracker) is a comprehensive record of all your executed trades. Trade journaling is the practice of logging details like entry/exit prices, strategies, risk levels, and visual charts. By consistently keeping a trade journal, you can analyze your trading behaviors, refine your strategies, and eliminate bad trading habits, which is the fastest way to build long-term profitability."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Is TradeTracker Pro a free trade journal?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! TradeTracker Pro is a 100% free trade journal. We believe professional-grade trading logs, strategy backtesting software, and calendar analytics should be accessible to every disciplined trader. You can create multiple workspaces for different broker accounts, track unlimited trades, and upload chart screenshots without paying monthly subscriptions."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How does TradeTracker Pro compare to TradeZella or Excel?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Unlike traditional Excel/Spreadsheet trading logs, TradeTracker Pro offers automated calculations, beautiful day-wise equity curves, and dynamic calendar heatmaps without requiring complex formulas or manual data setups. Compared to expensive alternatives like TradeZella or TraderSync (which can cost $30–$50/month), TradeTracker Pro provides a cleaner, ultra-responsive developer-grade workspace, multiple sub-account tracking, and client-side compressed screenshot hosting completely free of charge."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What assets and markets can I track?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our trading journal is designed to support a wide range of asset classes. You can easily track and backtest strategies for Forex currency pairs (such as EURUSD, GBPJPY), Gold (XAUUSD) and commodity instruments, major global Indices (like US30, NAS100), Cryptocurrencies, and stocks."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How long does it take to start tracking?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Signing up takes less than 3 minutes. Simply create an account, verify your setup through our partner broker options to unlock full platform features, build your first trading workspace, and begin journaling. No credit card is ever required."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />
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

      <Footer />
    </div>
  );
}
