import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LiveMeetingWrapper } from "@/components/live-market/LiveMeetingWrapper";

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

  if (isVerificationRequired) {
    let userStatus = (session.user as any).status;
    const token = (session.user as any).accessToken;

    // Always fetch live status from backend to sync MongoDB in real-time
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/verification/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status) {
            userStatus = data.status;
          }
        }
      } catch (error) {
        console.error("Dashboard layout live verification check error:", error);
      }
    }

    if (userStatus !== "approved") {
      redirect("/verification-pending");
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <DashboardHeader />
          <LiveMeetingWrapper>
            <Suspense fallback={null}>{children}</Suspense>
          </LiveMeetingWrapper>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
