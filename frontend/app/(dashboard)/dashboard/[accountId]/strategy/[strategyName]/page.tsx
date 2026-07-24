import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBrokerAccountById, getTradesForAccount } from "@/lib/actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StrategyDetailsView } from "@/components/analytics/strategy-details-view";

interface StrategyPageProps {
  params: Promise<{
    accountId: string;
    strategyName: string;
  }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { accountId, strategyName: encodedStrategyName } = await params;
  const strategyName = decodeURIComponent(encodedStrategyName);

  // Fetch account metadata and its associated trades
  const account = await getBrokerAccountById(accountId);
  if (!account) {
    redirect("/dashboard");
  }

  const trades = await getTradesForAccount(accountId);

  return (
    <div className="flex h-full flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-auto">
        <StrategyDetailsView
          account={account}
          trades={trades}
          strategyName={strategyName}
        />
      </main>
    </div>
  );
}
