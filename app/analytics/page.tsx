import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/analytics/stats-cards";
import { PerformanceChart } from "@/components/analytics/performance-chart";
import { StrategyBreakdown } from "@/components/analytics/strategy-breakdown";
import { TradeTypeDistribution } from "@/components/analytics/trade-type-distribution";
import { RecentTrades } from "@/components/analytics/recent-trades";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: true });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader user={user} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Performance breakdown across all your trades
            </p>
          </div>

          <StatsCards trades={trades || []} />

          <div className="grid gap-6 lg:grid-cols-2">
            <PerformanceChart trades={trades || []} />
            <TradeTypeDistribution trades={trades || []} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <StrategyBreakdown trades={trades || []} />
            <RecentTrades trades={trades || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
