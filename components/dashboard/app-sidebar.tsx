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
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

  const navGroups = [
    {
      label: "Main Menu",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Trades", url: "/trades", icon: History },
        { title: "Trader's Stats", url: "/journal", icon: LayoutGrid },
      ],
    },
    {
      label: "Performance",
      items: [
        { title: "Analytics", url: "/analytics", icon: BarChart3 },
        { title: "Live Market", url: "/market", icon: TrendingUp },
        { title: "Economic Calendar", url: "/calendar", icon: Calendar, badge: "Soon" },
      ],
    },
    {
      label: "Tools & Intelligence",
      items: [
        { title: "P&L Calculator", url: "/pl-calculator", icon: Calculator },
        { title: "AI Insights", url: "/ai-report", icon: Brain, badge: "PRO" },
        { title: "Broker Connect", url: "/integrations", icon: Link2 },
      ],
    },
    {
      label: "Preferences",
      items: [
        { title: "Settings", url: "/settings", icon: Settings },
        { title: "Help & Support", url: "/help", icon: HelpCircle },
      ],
    },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-extrabold text-sm tracking-tight uppercase">TradeTracker<span className="text-primary italic">Pro</span></span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* User Profile Section */}
        <div className="px-4 pt-6 pb-2">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/40 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none">
              <Avatar className="h-9 w-9 border-2 border-primary/20 shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0 overflow-hidden group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-1.5">
                   <span className="font-bold text-xs truncate text-foreground">{user.name.toUpperCase()}</span>
                   <Badge variant="secondary" className="text-[9px] h-3.5 px-1 leading-none bg-primary/10 text-primary border-none font-black uppercase">FREE</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground truncate opacity-70">{user.email}</span>
              </div>
           </div>
        </div>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-2">
            <SidebarGroupLabel className="px-5 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 h-8">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5 px-2">
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "h-10 px-3 transition-all duration-200 rounded-lg",
                          isActive 
                            ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20" 
                            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground font-medium"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                          <span className="group-data-[collapsible=icon]:hidden text-[13px] tracking-tight">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              className={cn(
                                "ml-auto text-[9px] h-4 px-1 group-data-[collapsible=icon]:hidden font-black",
                                item.badge === "PRO" ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                              )}
                            >
                              {item.badge}
                            </Badge>
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
                onClick={() => signOut()}
                className="h-10 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                tooltip="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden font-medium">Sign Out</span>
              </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
