"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, Sparkles, Bell, ShieldAlert, Zap, Globe, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated") return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-primary" />
            Economic Calendar
          </h1>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Real-time macroeconomic release schedule & high-impact news alerts
          </p>
        </div>
      </div>

      {/* Main Coming Soon Card */}
      <Card className="bg-card/20 border border-border/40 backdrop-blur-md overflow-hidden relative shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="text-center pt-10 pb-6 border-b border-border/20 flex flex-col items-center">
          <Badge variant="outline" className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Coming Soon Feature
          </Badge>

          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-border/50 flex items-center justify-center mb-4 shadow-inner">
            <Clock className="w-8 h-8 text-primary animate-pulse" />
          </div>

          <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground">
            Macro Economic Intelligence Ledger
          </CardTitle>
          <CardDescription className="text-xs uppercase text-muted-foreground mt-2 max-w-lg leading-relaxed font-semibold">
            We are engineering a proprietary institutional economic calendar with real-time news feeds, custom timezone offsets, and automated prop firm risk alerts.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-10 space-y-8">
          {/* Upcoming Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900/50 border border-border/30 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase text-foreground tracking-wider">Millisecond Live Stream</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                Instant WebSocket broadcast for CPI, NFP, rate decisions, and central bank speeches.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/50 border border-border/30 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase text-foreground tracking-wider">Multi-Timezone Engine</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                Auto-detection for IST (GMT +5:30), EST, and London GMT timezones with custom overrides.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/50 border border-border/30 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase text-foreground tracking-wider">Surprise Indicators</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                Automated calculation of release deviations with Bullish/Bearish market outcome tags.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/50 border border-border/30 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase text-foreground tracking-wider">Prop Firm Protection</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                High-impact news warning system to prevent trading rule violations during news blackout windows.
              </p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 gap-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold uppercase text-foreground tracking-wider">
                Development Status: Active Beta Build
              </span>
            </div>
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 text-[9px] font-black uppercase tracking-widest px-3 py-1">
              Launching Soon
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
