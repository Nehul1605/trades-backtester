import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LiveMeetingWrapper } from "@/components/live-market/LiveMeetingWrapper";

import { DashboardContentGuard } from "@/components/dashboard/dashboard-content-guard";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const isVerificationRequired =
    process.env.NEXT_PUBLIC_REQUIRE_REFERRAL_VERIFICATION !== "false" &&
    process.env.REQUIRE_REFERRAL_VERIFICATION !== "false";

  const isAdmin = (session.user as any).role === "admin";

  let statusData: any = null;
  let userStatus = (session.user as any).status || "pending";
  const token = (session.user as any).accessToken;

  // Always fetch live status from backend to sync MongoDB and real-time trial state
  if (token) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/verification/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        statusData = await res.json();
        if (statusData.status) {
          userStatus = statusData.status;
        }
      }
    } catch (error) {
      console.error("Dashboard layout live verification check error:", error);
    }
  }

  const isLocked = isVerificationRequired && !isAdmin && userStatus !== "approved";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          statusData={statusData}
          isLocked={isLocked}
          initialUser={session.user}
        />
        <SidebarInset className="flex flex-col min-h-screen">
          <DashboardHeader
            statusData={statusData}
            isLocked={isLocked}
            initialUser={session.user}
          />
          <LiveMeetingWrapper>
            <Suspense fallback={null}>
              <DashboardContentGuard isLocked={isLocked} statusData={statusData}>
                {children}
              </DashboardContentGuard>
            </Suspense>
          </LiveMeetingWrapper>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
