import { redirect } from "next/navigation";
import { getTradesForUser } from "@/lib/appwrite/actions";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TraderStats } from "@/components/analytics/trader-stats";
import { computePnlUSD, TradeType } from "@/lib/pnl";

export default async function JournalPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  // Fetch user's trades for stats calculation
  const tradeDocs = await getTradesForUser(userId, "$createdAt", "desc");

  // Map Appwrite documents to the shape the TraderStats component expects
  const trades = tradeDocs.map((doc: any) => {
    let calculatedPnl = doc.pnl;
    
    // Compute P&L if missing but prices exist
    if ((!doc.pnl || doc.pnl === 0) && doc.entry_price && doc.exit_price && doc.quantity) {
      const { pnl } = computePnlUSD({
        symbol: doc.symbol,
        entryPrice: doc.entry_price,
        exitPrice: doc.exit_price,
        quantity: doc.quantity,
        tradeType: (doc.trade_type?.toLowerCase() || "long") as TradeType,
      });
      calculatedPnl = pnl;
    }

    return {
      id: doc.$id,
      symbol: doc.symbol,
      pnl: calculatedPnl,
      status: doc.status,
      entry_date: doc.entry_date,
      trade_type: doc.trade_type,
    };
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase tracking-widest">Trader's Hub</h1>
            <p className="text-muted-foreground mt-2 uppercase text-[10px] font-bold tracking-wider">
              High-fidelity performance metrics and execution insights.
            </p>
          </div>
          
          <TraderStats initialTrades={trades} />
        </div>
      </main>
    </div>
  );
}
