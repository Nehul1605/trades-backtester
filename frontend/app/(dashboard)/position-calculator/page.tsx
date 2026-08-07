import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PositionCalculator } from "@/components/dashboard/position-calculator";

export default async function PositionCalculatorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="w-full">
        <PositionCalculator />
      </div>
    </div>
  );
}
