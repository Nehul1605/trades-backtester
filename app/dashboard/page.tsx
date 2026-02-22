import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TradeForm } from "@/components/dashboard/trade-form";
import { TradeList } from "@/components/dashboard/trade-list";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch user's trades
  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader user={user} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Trading Journal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Log and track your trades
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <TradeForm userId={user.id} />
            </div>
            <div className="lg:col-span-2">
              <TradeList trades={trades || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
