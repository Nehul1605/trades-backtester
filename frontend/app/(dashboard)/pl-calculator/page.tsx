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
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <DashboardHeader />
      <div className="w-full">
        <PLCalculator />
      </div>
    </div>
  );
}
