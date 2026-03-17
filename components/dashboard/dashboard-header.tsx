"use client";

import { Button } from "@/components/ui/button";
import { Activity, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();

  // Conditionally render SidebarTrigger only if within a SidebarProvider
  const sidebarContext = useSidebar();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login", redirect: true });
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Sidebar Toggle + Mobile Logo */}
        <div className="flex items-center gap-2">
          {sidebarContext && <SidebarTrigger />}
          <div
            className={`flex items-center gap-2 ${sidebarContext ? "md:hidden" : ""}`}
          >
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold">TradeTracker</span>
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
