"use client";

import * as React from "react";
import {
  Activity,
  BarChart3,
  Home,
  Calendar,
  Link2,
  LogOut,
  Settings,
  HelpCircle,
  TrendingUp,
  Brain,
  History,
  LayoutDashboard,
  ChevronRight,
  Calculator,
  LayoutGrid,
  ShieldCheck,
  Percent,
  Scale,
  Award,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { cn, getMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  statusData?: any;
  isLocked?: boolean;
  initialUser?: any;
}

export function AppSidebar({
  statusData,
  isLocked: propIsLocked,
  initialUser,
}: AppSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const activeUser = session?.user || initialUser;

  const user = {
    name: activeUser?.name || "User",
    email: activeUser?.email || "",
    avatar: activeUser?.image || "",
  };

  const isAdmin = (activeUser as any)?.role === "admin" || statusData?.role === "admin";
  const userStatus = statusData?.status || (activeUser as any)?.status || "pending";
  const isPromo = statusData?.isPromoActive ?? (activeUser as any)?.isPromoActive;
  const isPremium = statusData?.isPremiumActive ?? (activeUser as any)?.isPremiumActive;
  const membershipTag = statusData?.membershipTag || (activeUser as any)?.membershipTag;
  
  const isBypassed = isAdmin || membershipTag === "OPERATOR HQ" || isPremium;
  const isPromoTrial = isPromo && !isBypassed && userStatus === "approved";
  const isFullyLocked = propIsLocked ?? (!isAdmin && !isBypassed && !isPromoTrial);

  const [viewMode, setViewMode] = React.useState<"admin" | "user">("admin");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminViewMode") as "admin" | "user";
      if (saved) setViewMode(saved);
    }
  }, []);

  const toggleViewMode = () => {
    handleNavClick();
    const newMode = viewMode === "admin" ? "user" : "admin";
    setViewMode(newMode);
    localStorage.setItem("adminViewMode", newMode);
    window.dispatchEvent(new Event("admin-view-mode-change"));
    
    if (newMode === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    
    router.refresh();
  };

  const navGroups = [
    {
      label: "Core Platform",
      items: [
        { title: "Dashboard Console", url: "/dashboard", icon: LayoutDashboard },
        { title: "Operator HQ Signals", url: "/operator-hq", icon: Award },
        { title: "Live Market Stream", url: "/market", icon: TrendingUp },
        { title: "Economic Calendar", url: "/calendar", icon: Calendar },
      ],
    },
    {
      label: "Trading Tools",
      items: [
        { title: "Position Calculator", url: "/position-calculator", icon: Scale },
        { title: "P&L Calculator", url: "/pl-calculator", icon: Calculator },
        { title: "Consistency Calculator", url: "/consistency-calculator", icon: Percent },
      ],
    },
    {
      label: "Membership & Plans",
      items: [
        { title: "Plans & Pricing", url: "/premium", icon: Sparkles, badge: "PRO" },
      ],
    },
    {
      label: "Account & Support",
      items: [
        { title: "Account Settings", url: "/settings", icon: Settings },
        { title: "Help & Support", url: "/help", icon: HelpCircle },
      ],
    },
  ];

  let displayGroups = navGroups;

  if (isAdmin && viewMode === "admin") {
    // In admin mode, show Owner Admin Console + Membership Plans
    displayGroups = [
      {
        label: "Owner Admin",
        items: [
          { title: "Admin Console", url: "/admin", icon: ShieldCheck },
          { title: "Plans & Pricing", url: "/premium", icon: Sparkles, badge: "PLANS" },
        ],
      },
    ];
  }

  const getDisplayBadge = () => {
    if (isAdmin) return "Admin";
    if (isFullyLocked) return "Locked";
    if (isPromoTrial || membershipTag === "PROMO TRIAL") return "Trial";
    if (membershipTag === "PREMIUM" || isPremium) return "Premium";
    if (membershipTag === "OPERATOR HQ") return "Operator HQ";
    return membershipTag || "Free";
  };

  const getBadgeStyles = () => {
    if (isAdmin) return "bg-amber-500/20 text-amber-400";
    if (isFullyLocked) return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (isPromoTrial || membershipTag === "PROMO TRIAL") return "bg-yellow-500/10 text-yellow-400";
    return "bg-primary/10 text-primary";
  };

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border bg-sidebar"
    >
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-border/50 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0"
        >
          <div className="relative h-11 w-48 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 overflow-hidden transition-all duration-300 rounded-lg">
            <img
              src="/logo.png"
              className="h-11 w-auto max-w-none absolute left-0 top-0 select-none pointer-events-none group-data-[collapsible=icon]:h-10"
              alt="TradeTracker Pro Logo"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="scrollbar-none">
        {/* User Profile Section - Simple for Dashboard */}
        <div className="px-4 py-4 group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/40 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
              <AvatarImage src={getMediaUrl(user.avatar)} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs truncate text-foreground">
                  {user.name}
                </span>
                <Link href="/premium" onClick={handleNavClick}>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[9px] h-4 px-1.5 leading-none border-none font-bold uppercase shrink-0 whitespace-nowrap hover:opacity-80 transition-opacity cursor-pointer",
                      getBadgeStyles()
                    )}
                  >
                    {getDisplayBadge()}
                  </Badge>
                </Link>
              </div>
              <span className="text-[10px] text-muted-foreground truncate opacity-70">
                {user.email}
              </span>
            </div>
          </div>

          {/* Toggle view mode inside sidebar */}
          {mounted && isAdmin && (
            <div className="mt-3 group-data-[collapsible=icon]:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleViewMode}
                className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-accent/20 border-primary/10 hover:border-primary/30 hover:bg-accent/40 text-primary transition-all flex items-center justify-center gap-2 rounded-lg"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Mode: {viewMode === "admin" ? "Admin" : "User"}
              </Button>
            </div>
          )}
        </div>

        {displayGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-2">
            <SidebarGroupLabel className="px-5 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 h-8 group-data-[collapsible=icon]:invisible">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  const isItemLocked =
                    (isFullyLocked && !["/settings", "/help", "/premium"].includes(item.url)) ||
                    (isPromoTrial && ["/market", "/operator-hq", "/calendar"].includes(item.url));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "h-10 px-3 transition-all duration-200 rounded-lg group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
                            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground font-medium",
                        )}
                      >
                        <Link
                          href={item.url}
                          onClick={handleNavClick}
                          className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                        >
                          <item.icon
                            className="h-4 w-4 shrink-0 transition-colors"
                          />
                          <span className="group-data-[collapsible=icon]:hidden text-[13px] tracking-tight">
                            {item.title}
                          </span>
                          {isItemLocked ? (
                            <Lock className="ml-auto h-3.5 w-3.5 text-amber-500/80 shrink-0 group-data-[collapsible=icon]:hidden animate-pulse" />
                          ) : (
                            (item as any).badge && (
                              <Badge
                                className={cn(
                                  "ml-auto text-[9px] h-4 px-1 group-data-[collapsible=icon]:hidden font-black",
                                  (item as any).badge === "PRO"
                                    ? "bg-primary-foreground text-primary"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                {(item as any).badge}
                              </Badge>
                            )
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                handleNavClick();
                signOut();
              }}
              className="h-10 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              tooltip="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
