"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn, getLocalDateString } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  pnl: number | null;
  entry_date: string;
  status: string;
}

interface TradingCalendarProps {
  initialTrades: Trade[];
}

export function TradingCalendar({ initialTrades }: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter closed trades
  const closedTrades = useMemo(() => {
    return initialTrades.filter((t) => t.status === "closed" && t.pnl !== null);
  }, [initialTrades]);

  // Aggregate stats by day
  const dailyStats = useMemo(() => {
    const pnlMap: Record<string, number> = {};
    const tradesMap: Record<string, Trade[]> = {};

    closedTrades.forEach((trade) => {
      const dateObj = new Date(trade.entry_date);
      if (isNaN(dateObj.getTime())) return;
      const dateStr = getLocalDateString(dateObj);

      pnlMap[dateStr] = (pnlMap[dateStr] || 0) + (trade.pnl || 0);
      
      if (!tradesMap[dateStr]) {
        tradesMap[dateStr] = [];
      }
      tradesMap[dateStr].push(trade);
    });

    return { pnlMap, tradesMap };
  }, [closedTrades]);

  // Generate calendar days
  const calendarData = useMemo(() => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Padding for first day of week
    const firstDayOfWeek = startOfMonth.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Populate calendar days
    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = getLocalDateString(date);
      const pnl = dailyStats.pnlMap[dateStr] || 0;
      const dayTrades = dailyStats.tradesMap[dateStr] || [];

      days.push({
        day: d,
        date: dateStr,
        pnl,
        trades: dayTrades,
      });
    }

    // Weekly performance breakdown
    const weeks: { label: string; pnl: number }[] = [];
    let currentWeekPnL = 0;

    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = getLocalDateString(date);
      const pnl = dailyStats.pnlMap[dateStr] || 0;
      currentWeekPnL += pnl;

      if (date.getDay() === 6 || d === endOfMonth.getDate()) {
        const weekNum = Math.ceil((d + firstDayOfWeek) / 7);
        weeks.push({
          label: `Week ${weekNum}`,
          pnl: currentWeekPnL,
        });
        currentWeekPnL = 0;
      }
    }

    return { days, weeks };
  }, [currentDate, dailyStats]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + offset);
    setCurrentDate(nextDate);
  };

  // Monthly summary metrics
  const monthlyMetrics = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    let profitDays = 0;
    let lossDays = 0;
    let totalPnL = 0;

    calendarData.days.forEach((day) => {
      if (!day) return;
      totalPnL += day.pnl;
      if (day.pnl > 0) {
        profitDays++;
      } else if (day.pnl < 0) {
        lossDays++;
      }
    });

    return { profitDays, lossDays, totalPnL };
  }, [calendarData, currentDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 3/4 Grid: Calendar body */}
      <Card className="lg:col-span-3 bg-card/20 border-border/40 backdrop-blur-md overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 border-b border-border/20">
          <div className="flex items-center gap-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-foreground text-base font-bold">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-lg border border-border/40">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background/80"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background/80"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-emerald-500 uppercase">Profit Days</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <span className="text-[10px] font-black text-rose-500 uppercase">Loss Days</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow pb-8 pt-6">
          <div className="grid grid-cols-7 gap-3 h-full">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-black uppercase text-muted-foreground/60 pb-3 tracking-widest border-b border-border/10"
              >
                {day}
              </div>
            ))}
            {calendarData.days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "min-h-[90px] rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300 group",
                  !day 
                    ? "bg-transparent border-transparent" 
                    : "bg-muted/5 border-border/40 hover:border-primary/50 hover:bg-neutral-900/10 shadow-sm",
                  day && day.pnl > 0 ? "bg-emerald-500/[0.02] border-emerald-500/20" : "",
                  day && day.pnl < 0 ? "bg-rose-500/[0.02] border-rose-500/20" : "",
                  day && day.date === getLocalDateString(new Date()) ? "border-primary border-2 shadow-[0_0_15px_rgba(var(--primary),0.05)]" : ""
                )}
              >
                {day && (
                  <>
                    <span className="text-[10px] font-black absolute top-2 left-2.5 text-muted-foreground/30 group-hover:text-primary transition-colors">
                      {day.day}
                    </span>
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          "text-sm font-black tracking-tighter",
                          day.pnl > 0 ? "text-emerald-500" : day.pnl < 0 ? "text-rose-500" : "text-muted-foreground/10"
                        )}
                      >
                        {day.pnl !== 0 
                          ? `${day.pnl > 0 ? "+" : ""}${Math.round(day.pnl).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}` 
                          : "—"}
                      </span>
                      {day.pnl !== 0 && (
                        <div className={cn("h-1 w-6 rounded-full", day.pnl > 0 ? "bg-emerald-500/30" : "bg-rose-500/30")} />
                      )}
                    </div>
                    {day.trades.length > 0 && (
                      <span className="absolute bottom-1.5 right-2 text-[8px] font-bold text-muted-foreground/45 uppercase">
                        {day.trades.length} {day.trades.length === 1 ? "Trade" : "Trades"}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 1/4 Grid: Monthly summaries & Breakdown lists */}
      <div className="space-y-6">
        {/* Monthly Summary Statistics */}
        <Card className="bg-card/20 border-border/40 backdrop-blur-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Month P&L</span>
              <span className={cn("text-sm font-black", monthlyMetrics.totalPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {monthlyMetrics.totalPnL >= 0 ? "+" : ""}${monthlyMetrics.totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Profitable Days</span>
              <span className="text-xs font-bold text-emerald-500">{monthlyMetrics.profitDays} Days</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Losing Days</span>
              <span className="text-xs font-bold text-rose-500">{monthlyMetrics.lossDays} Days</span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Breakdown stats card */}
        <Card className="bg-card/20 border-border/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {calendarData.weeks.map((week, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-muted/10 border border-border/30 flex items-center justify-between"
              >
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase">{week.label}</p>
                  <p className="text-[10px] font-bold tracking-tight uppercase text-foreground/80 mt-0.5">Settle P&L</p>
                </div>
                <div className={cn("text-xs font-black", week.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  {week.pnl >= 0 ? "+" : ""}${Math.round(week.pnl).toLocaleString()}
                </div>
              </div>
            ))}
            {calendarData.weeks.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] uppercase font-bold text-center py-8 opacity-50">
                Log settled orders to display weekly summary
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
