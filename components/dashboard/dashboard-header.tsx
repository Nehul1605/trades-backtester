"use client";

import { Button } from "@/components/ui/button";
import {
  Activity,
  LogOut,
  BarChart3,
  Home,
  Calendar,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const sidebarContext = useSidebar();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const email = session?.user?.email ?? "";

  const navItems = [
    { href: "/dashboard", label: "Journal", icon: Home },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/calendar", label: "Calendar", icon: Calendar, badge: "Soon" },
    { href: "/integrations", label: "Connect", icon: Link2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {sidebarContext && <SidebarTrigger />}
          <div className="h-6 w-px bg-border hidden md:block" />
          <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest leading-none">
            {pathname.split("/").filter(Boolean).pop() || "Dashboard"}
          </h1>
        </div>

        {/* Right: User + Actions */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          <span className="text-sm text-muted-foreground hidden md:inline truncate max-w-45">
            {email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
