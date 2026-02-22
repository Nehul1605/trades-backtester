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
  LineChart,
  BookOpen,
  CheckCircle2,
  Activity,
  Calendar,
  Link2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CandlestickBackground from "@/components/CandlestickBackground";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Navbar — TradingView-style compact header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              TradeTracker<span className="text-primary">Pro</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href="#features"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Button
              asChild
              size="sm"
              className="h-8 px-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[92vh]">
        <CandlestickBackground />

        <div className="container relative z-10 mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Market Analytics
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="text-foreground">Track. Analyze.</span>
            <br className="hidden md:block" />
            <span className="text-primary">Profit.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            The professional trading journal trusted by serious traders. Log
            every trade, backtest your strategies, and find your edge in the
            markets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Link href="/auth/sign-up">
                Start Trading Journal <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-medium rounded-lg border-border hover:bg-accent"
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Free to start
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              No credit card required
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Real-time analytics
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className="border-y border-border/60 py-8 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                label: "Active Traders",
                value: "2,000+",
                color: "text-primary",
              },
              {
                label: "Total Volume",
                value: "$50M+",
                color: "text-foreground",
              },
              {
                label: "Strategies Tested",
                value: "15,000+",
                color: "text-foreground",
              },
              {
                label: "Platform Uptime",
                value: "99.9%",
                color: "text-primary",
              },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div
                  className={`text-2xl md:text-3xl font-bold font-mono ${stat.color}`}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything you need to trade profitably
            </h2>
            <p className="text-muted-foreground">
              Built by traders, for traders. Professional-grade tools to track,
              analyze, and improve your performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: "Trade Journaling",
                desc: "Log every trade with ease. Add notes, entry/exit prices, and tags to build a library of your trading performance.",
                badge: null,
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "View your Win Ratio, Accuracy, and Equity curves. Identify your edge with precise P&L tracking.",
                badge: null,
              },
              {
                icon: LayoutDashboard,
                title: "Control Dashboard",
                desc: "A unified view to quickly add trades and see live performance stats at a glance.",
                badge: null,
              },
              {
                icon: Calendar,
                title: "Forex Factory Calendar",
                desc: "Direct access to the Forex Factory economic calendar to stay updated on market-moving news.",
                badge: "COMING SOON",
              },
              {
                icon: Link2,
                title: "MT5 & Exness Sync",
                desc: "Securely connect your Exness and MT5 accounts to sync order history and see your net P&L.",
                badge: "UPCOMING",
              },
              {
                icon: Target,
                title: "Strategy Refining",
                desc: "Analyze your historical data to see which strategies perform best and refine your rules.",
                badge: null,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-200 hover:border-primary/30"
              >
                {feature.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {feature.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-border/60">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to better trading
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Log Your Trades",
                desc: "Enter your trade details or sync directly from your favorite brokers in seconds.",
              },
              {
                step: "02",
                title: "Connect Broker Sync",
                desc: "Securely link your MT5 or Exness account to automate your order history and P&L tracking.",
              },
              {
                step: "03",
                title: "Analyze & Optimize",
                desc: "Use advanced analytics and the Forex Factory calendar to find your edge and maximize profits.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold font-mono text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="pricing"
        className="py-24 relative overflow-hidden border-t border-border/60"
      >
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">
              Ready to find your edge?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of traders who track their performance with
              TradeTracker Pro.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              >
                <Link href="/auth/sign-up">Get Started Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base rounded-lg border-border"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-base font-bold">
                  TradeTracker<span className="text-primary">Pro</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional trading journal and strategy backtesting platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} TradeTracker Pro. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Twitter
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Discord
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
