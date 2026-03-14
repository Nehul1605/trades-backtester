"use client";

import { Button } from "@/components/ui/button";
import {
  Activity,
  LogOut,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Sidebar Toggle + Mobile Logo */}
        <div className="flex items-center gap-2">
          {sidebarContext && <SidebarTrigger />}
          <div className={`flex items-center gap-2 ${sidebarContext ? 'md:hidden' : ''}`}>
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold">TradeTracker</span>
          </div>
        </div>

        {/* Right: Theme Toggle + User */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {user?.image ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
              <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-border">
              <span className="text-xs font-medium text-primary">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
