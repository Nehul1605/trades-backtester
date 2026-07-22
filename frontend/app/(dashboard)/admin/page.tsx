import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./admin-client";
import { getAdminVerifications } from "@/lib/actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function AdminPage() {
  const session = await auth();

  // Route security: Only admins can view this page
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch initial verifications from backend
  const verifications = await getAdminVerifications();

  return (
    <div className="flex h-full flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider text-gold-gradient">
              Referral Operations Center
            </h1>
            <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">
              Verify and manage trading community account access
            </p>
          </div>

          <AdminDashboardClient initialData={verifications} />
        </div>
      </main>
    </div>
  );
}
