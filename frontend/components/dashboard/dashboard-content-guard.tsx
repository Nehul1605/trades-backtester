"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LockedPlatformView } from "@/components/dashboard/LockedPlatformView";

const UNLOCKED_ROUTES = ["/settings", "/help", "/premium"];

interface DashboardContentGuardProps {
  isLocked: boolean;
  statusData: any;
  children: React.ReactNode;
}

export function DashboardContentGuard({
  isLocked,
  statusData,
  children,
}: DashboardContentGuardProps) {
  const pathname = usePathname();
  const isUnlockedRoute = UNLOCKED_ROUTES.some((route) => pathname.startsWith(route));

  if (isLocked && !isUnlockedRoute) {
    return <LockedPlatformView statusData={statusData} />;
  }

  return <>{children}</>;
}
