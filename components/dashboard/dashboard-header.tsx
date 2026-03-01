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

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

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
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-base font-bold hidden sm:inline">
              TradeTracker<span className="text-primary">Pro</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 text-[8px] font-bold uppercase px-1 py-0 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
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
