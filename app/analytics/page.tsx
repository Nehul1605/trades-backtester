import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/analytics/stats-cards"
import { PerformanceChart } from "@/components/analytics/performance-chart"
import { StrategyBreakdown } from "@/components/analytics/strategy-breakdown"
import { TradeTypeDistribution } from "@/components/analytics/trade-type-distribution"
import { RecentTrades } from "@/components/analytics/recent-trades"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch all user's trades
  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      {/* Lightweight topbar with Dashboard nav */}
      <div className="border-b border-border/50 bg-background/50">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Comprehensive analysis of your trading strategy performance
            </p>
          </div>

          <StatsCards trades={trades || []} />

          <div className="grid gap-8 lg:grid-cols-2">
            <PerformanceChart trades={trades || []} />
            <TradeTypeDistribution trades={trades || []} />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <StrategyBreakdown trades={trades || []} />
            <RecentTrades trades={trades || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
