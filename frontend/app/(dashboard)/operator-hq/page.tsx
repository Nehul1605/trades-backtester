import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OperatorHQ } from "@/components/dashboard/operator-hq";

export default async function OperatorHQPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="w-full">
        <OperatorHQ />
      </div>
    </div>
  );
}
