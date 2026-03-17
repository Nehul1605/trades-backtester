import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TradeForm } from "@/components/dashboard/trade-form";
import { PnlSyncProvider } from "@/components/pnl-sync-provider";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  return (
    <div className="flex h-full flex-col bg-background">
      <PnlSyncProvider />
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Trading Journal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Log and track your trades
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <TradeForm userId={userId} />
          </div>
        </div>
      </main>
    </div>
  );
}
