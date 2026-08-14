import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PositionCalculator } from "@/components/dashboard/position-calculator";
import { FeatureLockedOverlay } from "@/components/dashboard/feature-locked-overlay";

export default async function PositionCalculatorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const isPromo = (session.user as any).isPromoActive;
  const isPremium = (session.user as any).isPremiumActive;

  if (isPromo && !isPremium) {
    return <FeatureLockedOverlay featureName="Position Calculator" />;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="w-full">
        <PositionCalculator />
      </div>
    </div>
  );
}
