import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, BarChart3, Target, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ElectricBorder from "@/components/ElectricBorder"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-4xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">TradeTracker Pro</h1>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight">Master Your Trading Strategy</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl leading-relaxed">
              Professional backtesting platform to track, analyze, and optimize your trading performance with real-time
              P&L calculations
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
            <ElectricBorder
              color="#7df9ff"
              speed={2}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg transparent">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Comprehensive trade analysis with detailed P&L tracking and performance metrics
              </p>
            </div>
            </ElectricBorder>
            
            <ElectricBorder
              color="#7df9ff"
              speed={2}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg transparent border border-border/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Strategy Testing</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Backtest your trading strategies with historical data and optimize your approach
              </p>
            </div>
              </ElectricBorder>

              <ElectricBorder
              color="#7df9ff"
              speed={2}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg transparent border border-border/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Secure & Private</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Your trading data is encrypted and protected with enterprise-grade security
              </p>
            </div>
            </ElectricBorder>
          </div>
        </div>
      </div>
    </div>
  )
}
