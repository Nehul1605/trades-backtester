import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LiveMeetingWrapper } from "@/components/live-market/LiveMeetingWrapper";

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
    const userStatus = (session.user as any).status;
    if (userStatus !== "approved") {
      redirect("/verification-pending");
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <LiveMeetingWrapper>
            <Suspense fallback={null}>{children}</Suspense>
          </LiveMeetingWrapper>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
