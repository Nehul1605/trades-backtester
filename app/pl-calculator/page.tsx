import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PLCalculator } from "@/components/dashboard/pl-calculator";

export default async function PLCalculatorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full">
            <PLCalculator />
        </div>
      </main>
    </div>
  );
}
