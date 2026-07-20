import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AccountsDashboard } from "@/components/dashboard/accounts-dashboard";
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
            <h1 className="text-3xl font-black uppercase tracking-wider text-gold-gradient">
              Accounts Hub
            </h1>
            <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">
              Simulated MT5 Broker accounts management
            </p>
          </div>

          <div>
            <AccountsDashboard userId={userId} />
          </div>
        </div>
      </main>
    </div>
  );
}
