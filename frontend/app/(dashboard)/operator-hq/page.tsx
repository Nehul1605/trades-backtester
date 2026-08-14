import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OperatorHQ } from "@/components/dashboard/operator-hq";
import { FeatureLockedOverlay } from "@/components/dashboard/feature-locked-overlay";

export default async function OperatorHQPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const isPromo = (session.user as any).isPromoActive;
  const isPremium = (session.user as any).isPremiumActive;
  const role = (session.user as any).role;
  const membershipTag = (session.user as any).membershipTag;

  const isBypassed = role === "admin" || membershipTag === "OPERATOR HQ" || isPremium;

  if (isPromo && !isBypassed) {
    return <FeatureLockedOverlay featureName="Operator HQ Signals" />;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="w-full">
        <OperatorHQ />
      </div>
    </div>
  );
}
