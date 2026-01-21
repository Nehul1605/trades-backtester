import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TradeForm } from "@/components/dashboard/trade-form"
import { TradeList } from "@/components/dashboard/trade-list"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's trades
  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Trading Journal</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Track your trades and analyze your strategy performance
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
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
  )
}
