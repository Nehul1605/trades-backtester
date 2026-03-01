"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  BarChart3, 
  Calendar as CalendarIcon,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Trade {
  id: string;
  symbol: string;
  entry_date: string;
  pnl: number | null;
  status: string;
  trade_type: string;
}

interface TraderStatsProps {
  initialTrades: Trade[];
}

type TimePeriod = "1w" | "1m" | "3m" | "6m" | "1y" | "all";

export function TraderStats({ initialTrades }: TraderStatsProps) {
  const [period, setPeriod] = useState<TimePeriod>("all");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const filteredTrades = useMemo(() => {
    const now = new Date();
    let cutoff = new Date(0); // All time

    if (period === "1w") cutoff = new Date(now.setDate(now.getDate() - 7));
    else if (period === "1m") cutoff = new Date(now.setMonth(now.getMonth() - 1));
    else if (period === "3m") cutoff = new Date(now.setMonth(now.getMonth() - 3));
    else if (period === "6m") cutoff = new Date(now.setMonth(now.getMonth() - 6));
    else if (period === "1y") cutoff = new Date(now.setFullYear(now.getFullYear() - 1));

    return initialTrades.filter(t => 
      t.status === "closed" && 
      t.pnl !== null && 
      new Date(t.entry_date) >= cutoff
    );
  }, [initialTrades, period]);

  const stats = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter(t => (t.pnl || 0) > 0);
    const losses = filteredTrades.filter(t => (t.pnl || 0) < 0);
    const netPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length) : 0;
    
    const bestTrade = filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => t.pnl || 0)) : 0;
    const worstTrade = filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => t.pnl || 0)) : 0;

    // Calculate streakes
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let profitFactor = 0;
    let totalWinsPnL = 0;
    let totalLossesPnL = 0;

    // Sort by date for streak calculation
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

    let tempWinStreak = 0;
    let tempLossStreak = 0;

    sortedTrades.forEach(t => {
      const pnl = Number(t.pnl) || 0;
      if (pnl > 0) {
        totalWinsPnL += pnl;
        tempWinStreak++;
        tempLossStreak = 0;
        if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
      } else if (pnl < 0) {
        totalLossesPnL += Math.abs(pnl);
        tempLossStreak++;
        tempWinStreak = 0;
        if (tempLossStreak > maxLossStreak) maxLossStreak = tempLossStreak;
      }
    });

    profitFactor = totalLossesPnL > 0 ? totalWinsPnL / totalLossesPnL : totalWinsPnL > 0 ? 10 : 0;
    const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Efficiency by type - Ensure case-insensitive matching
    const longTrades = filteredTrades.filter(t => t.trade_type?.toLowerCase() === "long");
    const shortTrades = filteredTrades.filter(t => t.trade_type?.toLowerCase() === "short");
    const longWinRate = longTrades.length > 0 ? (longTrades.filter(t => (t.pnl || 0) > 0).length / longTrades.length) * 100 : 0;
    const shortWinRate = shortTrades.length > 0 ? (shortTrades.filter(t => (t.pnl || 0) > 0).length / shortTrades.length) * 100 : 0;

    // Daily Calendar Data
    const dailyPnL = filteredTrades.reduce((acc, t) => {
      // Use entrance date, formatted to YYYY-MM-DD
      const dateObj = new Date(t.entry_date);
      if (isNaN(dateObj.getTime())) return acc; // Skip invalid dates
      const date = dateObj.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (Number(t.pnl) || 0);
      return acc;
    }, {} as Record<string, number>);

    return { 
      total, wins, losses, netPnL, winRate, avgWin, avgLoss, bestTrade, worstTrade,
      maxWinStreak, maxLossStreak, profitFactor, rrRatio, longWinRate, shortWinRate,
      dailyPnL
    };
  }, [filteredTrades]);

  // Calendar Helper
  const calendarData = useMemo(() => {
    const days = [];
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    // Grid prefix (empty days before 1st of month)
    const firstDayOfWeek = startOfMonth.getDay(); // 0 is Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        day: d,
        date: dateStr,
        pnl: stats.dailyPnL[dateStr] || null
      });
    }

    // Week-wise stats logic
    const weeks: { label: string; pnl: number }[] = [];
    let currentWeekPnL = 0;
    
    // Process all days in the month for weekly aggregation
    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      const pnl = stats.dailyPnL[date.toISOString().split('T')[0]] || 0;
      currentWeekPnL += pnl;
      
      // If it's Saturday or last day of month, push week
      if (date.getDay() === 6 || d === endOfMonth.getDate()) {
        const weekNum = Math.ceil((d + firstDayOfWeek) / 7);
        weeks.push({ label: `Week ${weekNum}`, pnl: currentWeekPnL });
        currentWeekPnL = 0;
      }
    }

    return { days, weeks };
  }, [stats.dailyPnL, currentCalendarDate]);

  const changeMonth = (offset: number) => {
    const d = new Date(currentCalendarDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentCalendarDate(d);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Time Period Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)} className="w-full sm:w-auto">
          <TabsList className="bg-transparent h-10 gap-1 p-0">
            {["1w", "1m", "3m", "6m", "1y", "all"].map((p) => (
              <TabsTrigger 
                key={p} 
                value={p} 
                className="rounded-lg px-4 text-xs font-bold uppercase data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background/50 border border-border">
          <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stats Overview</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Net P&L Card */}
        <Card className="col-span-1 md:col-span-2 bg-card/40 border-border/50 backdrop-blur-md overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-full h-1 ${stats.netPnL >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
              <CardDescription className="text-[10px] uppercase font-medium mt-1">Growth progression in period</CardDescription>
            </div>
            {stats.netPnL >= 0 ? <TrendingUp className="text-emerald-500 w-5 h-5" /> : <TrendingDown className="text-rose-500 w-5 h-5" />}
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-black tracking-tighter ${stats.netPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ${stats.netPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Win Rate Circular-ish Badge */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md flex flex-col justify-center items-center p-6 space-y-4">
          <div className="relative h-24 w-24 flex items-center justify-center">
            <svg className="h-full w-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * stats.winRate) / 100} className="text-primary transition-all duration-1000" />
            </svg>
            <span className="absolute text-xl font-black tracking-tighter">{stats.winRate.toFixed(0)}%</span>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Winning Ratio</p>
            <div className="flex gap-2 mt-1">
               <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500">{stats.wins.length}W</Badge>
               <Badge variant="outline" className="text-[10px] border-rose-500/20 text-rose-500">{stats.losses.length}L</Badge>
            </div>
          </div>
        </Card>

        {/* Efficiency Card */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Efficiency <Zap className="w-3.5 h-3.5 text-yellow-500" />
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div>
                 <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span>Performance</span>
                    <span>{stats.winRate.toFixed(1)}%</span>
                 </div>
                 <Progress value={stats.winRate} className="h-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Long Success</p>
                    <p className="text-sm font-black text-emerald-500">{stats.longWinRate.toFixed(1)}%</p>
                 </div>
                 <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Short Success</p>
                    <p className="text-sm font-black text-rose-500">{stats.shortWinRate.toFixed(1)}%</p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Stats Grid from Screenshot */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Execution Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-px bg-border/20 rounded-lg overflow-hidden border border-border/20">
             {[
               { label: "Avg Winner", value: `$${stats.avgWin.toFixed(2)}`, color: "text-emerald-500" },
               { label: "Avg Loser", value: `-$${stats.avgLoss.toFixed(2)}`, color: "text-rose-500" },
               { label: "Best Trade", value: `$${stats.bestTrade.toLocaleString()}`, color: "text-emerald-500" },
               { label: "Worst Trade", value: `$${stats.worstTrade.toLocaleString()}`, color: "text-rose-500" },
               { label: "Win Streak", value: `${stats.maxWinStreak} trades`, color: "text-emerald-500" },
               { label: "Loss Streak", value: `${stats.maxLossStreak} trades`, color: "text-rose-500" },
               { label: "Avg R:R", value: `1:${stats.rrRatio.toFixed(2)}`, color: "text-primary text-[11px]" },
               { label: "Profit Factor", value: stats.profitFactor.toFixed(2), color: "text-primary" },
             ].map((s, i) => (
                <div key={i} className="bg-card p-4 flex flex-col gap-1">
                   <span className="text-[9px] uppercase font-bold text-muted-foreground">{s.label}</span>
                   <span className={`text-sm font-black tracking-tight ${s.color}`}>{s.value}</span>
                </div>
             ))}
          </CardContent>
        </Card>

        {/* Top Symbols Component */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md md:col-span-2">
           <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Best Performing Assets</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="space-y-4">
                 {filteredTrades.length > 0 ? (
                   Array.from(new Set(filteredTrades.map(t => t.symbol))).slice(0, 5).map(symbol => {
                     const symbTrades = filteredTrades.filter(t => t.symbol === symbol);
                     const symbPnL = symbTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                     return (
                        <div key={symbol} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/10 hover:bg-muted/30 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                                 {symbol.substring(0, 3)}
                              </div>
                              <span className="font-bold text-sm tracking-tight">{symbol}</span>
                           </div>
                           <div className="text-right">
                              <p className={`font-black text-sm ${symbPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                 {symbPnL >= 0 ? '+' : ''}{symbPnL.toLocaleString()}
                              </p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">{symbTrades.length} Trades Executed</p>
                           </div>
                        </div>
                     )
                   })
                 ) : (
                   <div className="h-50 flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest rounded-xl border border-dashed border-border/50 font-bold">
                      No Asset Data in this Period
                   </div>
                 )}
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Daily Net P&L Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[650px]">
        <Card className="lg:col-span-3 bg-card/40 border-border/50 backdrop-blur-md overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6">
            <div className="flex items-center gap-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-primary" /> 
                <span className="text-foreground text-base">{currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              </CardTitle>
              <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-lg border border-border/50">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background" onClick={() => changeMonth(-1)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background" onClick={() => changeMonth(1)}>
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
          <CardContent className="flex-grow pb-8">
            <div className="grid grid-cols-7 gap-3 h-full">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-[11px] font-black uppercase text-muted-foreground/60 pb-4 h-fit tracking-widest">
                  {day}
                </div>
              ))}
              {calendarData.days.map((day, i) => (
                <div 
                  key={i} 
                  className={`
                    min-h-[90px] rounded-2xl border flex flex-col items-center justify-center relative transition-all duration-300 group
                    ${!day ? 'bg-transparent border-transparent' : 'bg-muted/5 border-border/40 hover:border-primary/50 hover:bg-accent/5 shadow-sm'}
                    ${day?.pnl && day.pnl > 0 ? 'bg-emerald-500/[0.03] border-emerald-500/30' : ''}
                    ${day?.pnl && day.pnl < 0 ? 'bg-rose-500/[0.03] border-rose-500/30' : ''}
                    ${day?.date === new Date().toISOString().split('T')[0] ? 'border-primary border-2 shadow-[0_0_15px_rgba(var(--primary),0.1)]' : ''}
                  `}
                >
                  {day && (
                    <>
                      <span className="text-[11px] font-black absolute top-3 left-3 text-muted-foreground/30 group-hover:text-primary transition-colors">{day.day}</span>
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-base font-black tracking-tighter ${day.pnl && day.pnl > 0 ? 'text-emerald-500' : day.pnl && day.pnl < 0 ? 'text-rose-500' : 'text-muted-foreground/10'}`}>
                          {day.pnl ? `${day.pnl > 0 ? '+' : ''}${Math.round(day.pnl).toLocaleString()}` : '—'}
                        </span>
                        {day.pnl !== 0 && (
                           <div className={`h-1 w-8 rounded-full ${day.pnl > 0 ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`} />
                        )}
                      </div>
                      {day.tradesCount > 0 && (
                        <span className="absolute bottom-2 right-3 text-[9px] font-bold text-muted-foreground/40 uppercase">
                          {day.tradesCount} Trds
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Stats Section */}
        <Card className="lg:col-span-1 bg-card/40 border-border/50 backdrop-blur-md flex flex-col">
          <CardHeader className="pt-6">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            {calendarData.weeks.map((week, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-muted/20 border border-border/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{week.label}</p>
                  <p className="text-xs font-black tracking-tight">Period Performance</p>
                </div>
                <div className={`text-sm font-black ${week.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {week.pnl >= 0 ? '+' : ''}${Math.round(week.pnl).toLocaleString()}
                </div>
              </div>
            ))}
            {calendarData.weeks.length === 0 && (
               <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] uppercase font-bold text-center py-10 opacity-50">
                  Execute trades to see weekly progress
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
