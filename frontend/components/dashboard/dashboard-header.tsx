"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Lock, Clock, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  statusData?: any;
  isLocked?: boolean;
  initialUser?: any;
}

export function DashboardHeader({
  statusData,
  isLocked: propIsLocked,
  initialUser,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user || initialUser;
  const router = useRouter();
  const pathname = usePathname();

  const sidebarContext = useSidebar();

  const isAdmin = (user as any)?.role === "admin" || statusData?.role === "admin";
  const userStatus = statusData?.status || (user as any)?.status || "pending";
  const isPromo = statusData?.isPromoActive ?? (user as any)?.isPromoActive;
  const isPremium = statusData?.isPremiumActive ?? (user as any)?.isPremiumActive;
  const membershipTag = statusData?.membershipTag || (user as any)?.membershipTag;
  const daysRemaining = statusData?.daysRemainingInTrial;

  const isBypassed = isAdmin || membershipTag === "OPERATOR HQ" || isPremium;
  const isPromoTrial = isPromo && !isBypassed && userStatus === "approved";
  const isLocked = propIsLocked ?? (!isAdmin && !isBypassed && !isPromoTrial);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login", redirect: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Sidebar Toggle + Mobile Logo */}
        <div className="flex items-center gap-2">
          {sidebarContext && <SidebarTrigger />}
          <div
            className={`flex items-center gap-2.5 ${sidebarContext ? "md:hidden" : ""}`}
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-lg shrink-0 select-none shadow-sm">
              <img
                src="/logo.png"
                className="h-8 w-auto max-w-none absolute left-0 top-0 pointer-events-none"
                alt="TradeTracker Pro Logo Icon"
              />
            </div>
            <span className="text-base font-extrabold tracking-tight uppercase">TradeTracker</span>
          </div>
        </div>

        {/* Right Status Actions & Countdown */}
        <div className="flex items-center gap-2.5">
          {/* Active Promo Trial Countdown */}
          {isPromoTrial && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-wider animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Trial: {daysRemaining !== undefined ? `${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'} Left` : "Active"}
                </span>
              </div>
              <Button
                asChild
                size="sm"
                className="h-8 bg-gold-gradient text-background font-black text-[11px] uppercase tracking-wider px-3 rounded-lg shadow-sm shadow-primary/20"
              >
                <Link href="/premium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Upgrade
                </Link>
              </Button>
            </div>
          )}

          {/* Locked / Expired State Pill */}
          {isLocked && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Platform Locked</span>
              </div>
              <Button
                asChild
                size="sm"
                className="h-8 bg-gold-gradient text-background font-black text-[11px] uppercase tracking-wider px-3 rounded-lg shadow-sm shadow-primary/20"
              >
                <Link href="/premium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Upgrade to Premium
                </Link>
              </Button>
            </div>
          )}

          {/* Premium / Operator HQ Approved Badge */}
          {isBypassed && !isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 border-primary/20 hover:bg-primary/10 text-primary font-black text-[11px] uppercase tracking-wider px-2.5 rounded-lg"
              >
                <Link href="/premium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Plans
                </Link>
              </Button>
              <Link href="/premium">
                <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30 text-[10px] font-black uppercase px-2.5 py-1 cursor-pointer transition-colors">
                  ✨ {membershipTag || "PREMIUM"}
                </Badge>
              </Link>
            </div>
          )}

          {/* Owner Admin Mode */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 border-amber-500/30 hover:bg-amber-500/10 text-amber-400 font-black text-[11px] uppercase tracking-wider px-2.5 rounded-lg"
              >
                <Link href="/premium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Plans & Pricing
                </Link>
              </Button>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] font-black uppercase px-2.5 py-1">
                🛡️ OWNER ADMIN
              </Badge>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

