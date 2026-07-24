"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChevronRight,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getBrokerAccounts } from "@/lib/actions";
import { getLocalDateString } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  entry_date: string;
  pnl: number | null;
  status: string;
  trade_type: string;
  broker_account_id?: string | null;
}

interface TraderStatsProps {
  initialTrades: Trade[];
  hideAccountSelector?: boolean;
}

type TimePeriod = "1w" | "1m" | "3m" | "6m" | "1y" | "all";

export function TraderStats({ initialTrades, hideAccountSelector = false }: TraderStatsProps) {
  const [period, setPeriod] = useState<TimePeriod>("all");
  const [filterAccount, setFilterAccount] = useState<string>("ALL");
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    async function loadAccounts() {
      const docs = await getBrokerAccounts("");
      setAccounts(docs);
    }
    loadAccounts();
  }, []);

  const filteredTrades = useMemo(() => {
    const now = new Date();
    let cutoff = new Date(0); // All time

    if (period === "1w") cutoff = new Date(now.setDate(now.getDate() - 7));
    else if (period === "1m")
      cutoff = new Date(now.setMonth(now.getMonth() - 1));
    else if (period === "3m")
      cutoff = new Date(now.setMonth(now.getMonth() - 3));
    else if (period === "6m")
      cutoff = new Date(now.setMonth(now.getMonth() - 6));
    else if (period === "1y")
      cutoff = new Date(now.setFullYear(now.getFullYear() - 1));

    return initialTrades.filter((t) => {
      const matchPeriod =
        t.status === "closed" &&
        t.pnl !== null &&
        new Date(t.entry_date) >= cutoff;
      const matchAccount =
        filterAccount === "ALL" ||
        (filterAccount === "none" && !t.broker_account_id) ||
        t.broker_account_id === filterAccount;
      return matchPeriod && matchAccount;
    });
  }, [initialTrades, period, filterAccount]);

  const stats = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter((t) => (t.pnl || 0) > 0);
    const losses = filteredTrades.filter((t) => (t.pnl || 0) < 0);
    const netPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const avgWin =
      wins.length > 0
        ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length
        : 0;
    const avgLoss =
      losses.length > 0
        ? Math.abs(
            losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length,
          )
        : 0;

    const bestTrade =
      filteredTrades.length > 0
        ? Math.max(...filteredTrades.map((t) => t.pnl || 0))
        : 0;
    const worstTrade =
      filteredTrades.length > 0
        ? Math.min(...filteredTrades.map((t) => t.pnl || 0))
        : 0;

    // Calculate streakes
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let profitFactor = 0;
    let totalWinsPnL = 0;
    let totalLossesPnL = 0;

    // Sort by date for streak calculation
    const sortedTrades = [...filteredTrades].sort(
      (a, b) =>
        new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime(),
    );

    let tempWinStreak = 0;
    let tempLossStreak = 0;

    sortedTrades.forEach((t) => {
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

    profitFactor =
      totalLossesPnL > 0
        ? totalWinsPnL / totalLossesPnL
        : totalWinsPnL > 0
          ? 10
          : 0;
    const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Efficiency by type - Ensure case-insensitive matching
    const longTrades = filteredTrades.filter(
      (t) => t.trade_type?.toLowerCase() === "long",
    );
    const shortTrades = filteredTrades.filter(
      (t) => t.trade_type?.toLowerCase() === "short",
    );
    const longWinRate =
      longTrades.length > 0
        ? (longTrades.filter((t) => (t.pnl || 0) > 0).length /
            longTrades.length) *
          100
        : 0;
    const shortWinRate =
      shortTrades.length > 0
        ? (shortTrades.filter((t) => (t.pnl || 0) > 0).length /
            shortTrades.length) *
          100
        : 0;

    // Daily Calendar Data
    const dailyPnL = filteredTrades.reduce(
      (acc, t) => {
        // Use entrance date, formatted to YYYY-MM-DD
        const dateObj = new Date(t.entry_date);
        if (isNaN(dateObj.getTime())) return acc; // Skip invalid dates
        const date = getLocalDateString(dateObj);
        acc[date] = (acc[date] || 0) + (Number(t.pnl) || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      wins,
      losses,
      netPnL,
      winRate,
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
      maxWinStreak,
      maxLossStreak,
      profitFactor,
      rrRatio,
      longWinRate,
      shortWinRate,
    };
  }, [filteredTrades]);

  const handleExportStats = () => {
    const data = [
      ["Metric", "Value"],
      ["Total Closed Trades", stats.total],
      ["Winning Trades", stats.wins.length],
      ["Losing Trades", stats.losses.length],
      ["Net Profit ($)", stats.netPnL.toFixed(2)],
      ["Win Rate (%)", stats.winRate.toFixed(2) + "%"],
      ["Profit Factor", stats.profitFactor.toFixed(2)],
      ["Average Win ($)", stats.avgWin.toFixed(2)],
      ["Average Loss ($)", stats.avgLoss.toFixed(2)],
      ["Risk/Reward Ratio", stats.rrRatio.toFixed(2)],
      ["Largest Win ($)", stats.bestTrade.toFixed(2)],
      ["Largest Loss ($)", stats.worstTrade.toFixed(2)],
      ["Max Winning Streak", stats.maxWinStreak],
      ["Max Losing Streak", stats.maxLossStreak],
      ["Long Trades Win Rate (%)", stats.longWinRate.toFixed(2) + "%"],
      ["Short Trades Win Rate (%)", stats.shortWinRate.toFixed(2) + "%"]
    ];

    const csvContent = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trader_stats_${period}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Time Period Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as TimePeriod)}
            className="w-full sm:w-auto"
          >
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

          {!hideAccountSelector && (
            <div className="w-48">
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger className="bg-background border-primary/20 hover:border-primary/50 h-9 transition-all duration-200 text-xs">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Accounts</SelectItem>
                  <SelectItem value="none">Independent Trades</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.broker_type.toUpperCase()} ({acc.account_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stats.total > 0 && (
            <Button
              onClick={handleExportStats}
              variant="outline"
              size="sm"
              className="h-8 px-3 bg-accent/20 border-primary/20 text-primary hover:border-primary/50 hover:bg-accent/40 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Stats
            </Button>
          )}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background/50 border border-border">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Stats Overview
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Net P&L Card */}
        <Card className="col-span-1 md:col-span-2 bg-card/40 border-border/50 backdrop-blur-md overflow-hidden relative">
          <div
            className={`absolute top-0 left-0 w-full h-1 ${stats.netPnL >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Total Revenue
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-medium mt-1">
                Growth progression in period
              </CardDescription>
            </div>
            {stats.netPnL >= 0 ? (
              <TrendingUp className="text-emerald-500 w-5 h-5" />
            ) : (
              <TrendingDown className="text-rose-500 w-5 h-5" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-5xl font-black tracking-tighter ${stats.netPnL >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            >
              $
              {stats.netPnL.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        {/* Win Rate Circular-ish Badge */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md flex flex-col justify-center items-center p-6 space-y-4">
          <div className="relative h-24 w-24 flex items-center justify-center">
            <svg className="h-full w-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/10"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * stats.winRate) / 100}
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xl font-black tracking-tighter">
              {stats.winRate.toFixed(0)}%
            </span>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Winning Ratio
            </p>
            <div className="flex gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500/20 text-emerald-500"
              >
                {stats.wins.length}W
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] border-rose-500/20 text-rose-500"
              >
                {stats.losses.length}L
              </Badge>
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
                <p className="text-[9px] uppercase font-bold text-muted-foreground">
                  Long Success
                </p>
                <p className="text-sm font-black text-emerald-500">
                  {stats.longWinRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">
                  Short Success
                </p>
                <p className="text-sm font-black text-rose-500">
                  {stats.shortWinRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Stats Grid from Screenshot */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Quick Execution Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-px bg-border/20 rounded-lg overflow-hidden border border-border/20">
            {[
              {
                label: "Avg Winner",
                value: `$${stats.avgWin.toFixed(2)}`,
                color: "text-emerald-500",
              },
              {
                label: "Avg Loser",
                value: `-$${stats.avgLoss.toFixed(2)}`,
                color: "text-rose-500",
              },
              {
                label: "Best Trade",
                value: `$${stats.bestTrade.toLocaleString()}`,
                color: "text-emerald-500",
              },
              {
                label: "Worst Trade",
                value: `$${stats.worstTrade.toLocaleString()}`,
                color: "text-rose-500",
              },
              {
                label: "Win Streak",
                value: `${stats.maxWinStreak} trades`,
                color: "text-emerald-500",
              },
              {
                label: "Loss Streak",
                value: `${stats.maxLossStreak} trades`,
                color: "text-rose-500",
              },
              {
                label: "Avg R:R",
                value: `1:${stats.rrRatio.toFixed(2)}`,
                color: "text-primary text-[11px]",
              },
              {
                label: "Profit Factor",
                value: stats.profitFactor.toFixed(2),
                color: "text-primary",
              },
            ].map((s, i) => (
              <div key={i} className="bg-card p-4 flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">
                  {s.label}
                </span>
                <span
                  className={`text-sm font-black tracking-tight ${s.color}`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Symbols Component */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Best Performing Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTrades.length > 0 ? (
                Array.from(new Set(filteredTrades.map((t) => t.symbol)))
                  .slice(0, 5)
                  .map((symbol) => {
                    const symbTrades = filteredTrades.filter(
                      (t) => t.symbol === symbol,
                    );
                    const symbPnL = symbTrades.reduce(
                      (sum, t) => sum + (t.pnl || 0),
                      0,
                    );
                    return (
                      <div
                        key={symbol}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/10 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                            {symbol.substring(0, 3)}
                          </div>
                          <span className="font-bold text-sm tracking-tight">
                            {symbol}
                          </span>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-black text-sm ${symbPnL >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                          >
                            {symbPnL >= 0 ? "+" : ""}
                            {symbPnL.toLocaleString()}
                          </p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">
                            {symbTrades.length} Trades Executed
                          </p>
                        </div>
                      </div>
                    );
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
    </div>
  );
}
