import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBrokerAccountById, getTradesForAccount } from "@/lib/actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AccountWorkspace } from "@/components/dashboard/account-workspace";

interface AccountWorkspacePageProps {
  params: Promise<{ accountId: string }>;
}

export default async function AccountWorkspacePage({ params }: AccountWorkspacePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { accountId } = await params;

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
        <AccountWorkspace account={account} initialTrades={trades} />
      </main>
    </div>
  );
}
