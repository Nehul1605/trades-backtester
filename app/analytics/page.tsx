import { redirect } from "next/navigation";
import { getTradesForUser } from "@/lib/appwrite/actions";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/analytics/stats-cards";
import { PerformanceChart } from "@/components/analytics/performance-chart";
import { StrategyBreakdown } from "@/components/analytics/strategy-breakdown";
import { TradeTypeDistribution } from "@/components/analytics/trade-type-distribution";
import { RecentTrades } from "@/components/analytics/recent-trades";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const tradeDocs = await getTradesForUser(
    session.user.id,
    "entry_date",
    "asc",
  );

  const trades = tradeDocs.map((doc: any) => ({
    id: doc.$id,
    symbol: doc.symbol,
    entry_price: doc.entry_price,
    exit_price: doc.exit_price,
    entry_price_text: doc.entry_price_text,
    exit_price_text: doc.exit_price_text,
    quantity: doc.quantity,
    trade_type: doc.trade_type,
    entry_date: doc.entry_date,
    exit_date: doc.exit_date,
    status: doc.status,
    strategy_name: doc.strategy_name,
    notes: doc.notes,
    screenshot_url: doc.screenshot_url,
    pnl: doc.pnl,
    pnl_percentage: doc.pnl_percentage,
    stop_loss: doc.stop_loss,
    take_profit: doc.take_profit,
    broker_account_id: doc.broker_account_id,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
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
