"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Hash,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Briefcase,
  Loader2,
  Trash2,
  CalendarDays,
  Activity,
  Award,
} from "lucide-react";
import { deleteTrade, topUpAccount } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TradeList } from "./trade-list";
import { TradeForm } from "./trade-form";
import { TraderStats } from "../analytics/trader-stats";
import { TradingCalendar } from "../analytics/trading-calendar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { TradeTypeDistribution } from "../analytics/trade-type-distribution";
import { StrategyBreakdown } from "../analytics/strategy-breakdown";
import { AnalyticsPeriodChart } from "../analytics/analytics-period-chart";

interface AccountWorkspaceProps {
  account: any;
  initialTrades: any[];
}

type TabType = "overview" | "trades" | "calendar" | "stats" | "analytics" | "add-trade";

export function AccountWorkspace({ account, initialTrades }: AccountWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [balance, setBalance] = useState(account.balance);
  const [equity, setEquity] = useState(account.equity);

  // Filter out closed trades for charts/stats
  const closedTrades = useMemo(() => {
    return initialTrades
      .filter((t) => t.status === "closed" && t.pnl !== null)
      .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
  }, [initialTrades]);

  // Compute key account metrics
  const metrics = useMemo(() => {
    const total = closedTrades.length;
    const wins = closedTrades.filter((t) => t.pnl > 0);
    const losses = closedTrades.filter((t) => t.pnl <= 0);
    
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const netPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const profitFactor = losses.length > 0 
      ? Math.abs(wins.reduce((sum, t) => sum + t.pnl, 0) / losses.reduce((sum, t) => sum + t.pnl, 0)) 
      : 1;

    return { total, winsCount: wins.length, winRate, netPnl, profitFactor };
  }, [closedTrades]);

  const handleTopUp = async () => {
    setTopUpLoading(true);
    try {
      const result = await topUpAccount(account.id);
      if (result.error) throw new Error(result.error);
      
      setBalance((b: number) => b + 500);
      setEquity((e: number) => e + 500);

      toast({
        title: "Top-Up Successful",
        description: "Added $500.00 to your simulated account.",
      });
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Top-Up Failed",
        description: err.message || "Failed to add funds.",
      });
    } finally {
      setTopUpLoading(false);
    }
  };

  // 1. Data mapping: Day-wise Equity Growth Curve (Line chart mapping cumulative balance day-by-day)
  const equityCurveData = useMemo(() => {
    const dayGroupedPnL: { date: string; pnl: number }[] = [];
    closedTrades.forEach((t) => {
      const d = new Date(t.entry_date);
      if (isNaN(d.getTime())) return;
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const existing = dayGroupedPnL.find((item) => item.date === dateStr);
      if (existing) {
        existing.pnl += t.pnl || 0;
      } else {
        dayGroupedPnL.push({ date: dateStr, pnl: t.pnl || 0 });
      }
    });

    let currentEquity = balance - metrics.netPnl; // starting point
    return dayGroupedPnL.map((item) => {
      currentEquity += item.pnl;
      return {
        name: item.date,
        equity: Number(currentEquity.toFixed(2)),
      };
    });
  }, [closedTrades, balance, metrics.netPnl]);

  // Calculate dynamic y-axis domain for equity curves starting from 0
  const equityYDomain = useMemo(() => {
    if (equityCurveData.length === 0) return [0, "auto"];
    const values = equityCurveData.map((d) => d.equity);
    const max = Math.max(...values, balance);
    // Pad the max value by 10% so the top of the curve has nice breathing room
    return [0, Math.ceil(max * 1.1)];
  }, [equityCurveData, balance]);

  const initialBalance = useMemo(() => balance - metrics.netPnl, [balance, metrics.netPnl]);

  // 2. Data mapping: Weekday Performance analysis (Bar chart comparing PnL on Mon-Fri)
  const weekdayPnLData = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const pnlMap: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
    };

    closedTrades.forEach((t) => {
      const date = new Date(t.entry_date);
      const dayName = days[date.getDay()];
      if (pnlMap[dayName] !== undefined) {
        pnlMap[dayName] += t.pnl || 0;
      }
    });

    return Object.keys(pnlMap).map((day) => ({
      day,
      pnl: Number(pnlMap[day].toFixed(2)),
    }));
  }, [closedTrades]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const balanceValue = payload[0].value;
      const pnlValue = balanceValue - initialBalance;
      const pnlPercentage = (pnlValue / initialBalance) * 100;
      
      return (
        <div className="bg-neutral-950/95 border border-border/60 rounded-xl p-3 shadow-xl space-y-1 select-none text-[11px]">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{payload[0].payload.name}</p>
          <p className="font-bold text-foreground">
            Balance: <span className="font-mono text-primary">${balanceValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </p>
          <p className={cn("font-bold", pnlValue >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {pnlValue >= 0 ? "Gain: +" : "Loss: "}${pnlValue.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({pnlPercentage.toFixed(2)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground uppercase font-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Accounts
          </Link>
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground">
              {account.broker_type} Workspace
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold uppercase text-[9px]">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash className="w-3 h-3 text-primary/60" />
            <span className="font-semibold uppercase">MT5 ID: {account.account_id}</span>
            <span>•</span>
            <Clock className="w-3 h-3 text-primary/60" />
            <span>Synced: {new Date(account.last_sync || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Top-up CTA */}
        <div className="flex items-center gap-3">
          <div className="text-right group-data-[collapsible=icon]:hidden">
            <div className="text-xs text-muted-foreground uppercase font-black tracking-wider">Account Balance</div>
            <div className="text-2xl font-black text-gold-gradient">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <Button
            onClick={handleTopUp}
            disabled={topUpLoading}
            className="bg-gold-gradient text-background hover:opacity-90 font-bold uppercase text-xs h-10 px-5"
          >
            {topUpLoading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            Top Up (+$500)
          </Button>
        </div>
      </div>

      {/* Segmented Pill Tabs Navigation inside Workspace */}
      <div className="relative flex p-1 bg-accent/20 border border-border/40 rounded-xl w-full max-w-3xl select-none">
        {/* Sliding Pill Tab Indicator */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-primary shadow-sm"
          initial={false}
          animate={{
            left:
              activeTab === "overview"
                ? "4px"
                : activeTab === "add-trade"
                ? "16.66%"
                : activeTab === "trades"
                ? "33.33%"
                : activeTab === "calendar"
                ? "50%"
                : activeTab === "stats"
                ? "66.66%"
                : "83.33%",
            right:
              activeTab === "overview"
                ? "83.33%"
                : activeTab === "add-trade"
                ? "66.66%"
                : activeTab === "trades"
                ? "50%"
                : activeTab === "calendar"
                ? "33.33%"
                : activeTab === "stats"
                ? "16.66%"
                : "4px",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />

        {(["overview", "add-trade", "trades", "calendar", "stats", "analytics"] as TabType[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 relative z-10 py-2 text-[10px] font-black uppercase tracking-wider text-center transition-colors rounded-lg cursor-pointer",
              activeTab === tab ? "text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "overview"
              ? "Overview"
              : tab === "add-trade"
              ? "Journal Trade"
              : tab === "trades"
              ? "Trades"
              : tab === "calendar"
              ? "Calendar"
              : tab === "stats"
              ? "Stats"
              : "Analytics"}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid gap-6">
              {/* Metric stats cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/20 border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Net Profit
                    </CardTitle>
                    {metrics.netPnl >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className={cn("text-2xl font-black", metrics.netPnl >= 0 ? "text-emerald-500" : "text-destructive")}>
                      {metrics.netPnl >= 0 ? "+" : ""}${metrics.netPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold mt-1">
                      Closed trade payouts
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/20 border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Win Rate
                    </CardTitle>
                    <Award className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-foreground">
                      {metrics.winRate.toFixed(1)}%
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold mt-1">
                      Ratio of profitable trades
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/20 border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Profit Factor
                    </CardTitle>
                    <Activity className="w-4 h-4 text-primary/70" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-foreground">
                      {metrics.profitFactor.toFixed(2)}
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold mt-1">
                      Wins divided by loss values
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/20 border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Total Executed
                    </CardTitle>
                    <Briefcase className="w-4 h-4 text-primary/70" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-foreground">
                      {metrics.total}
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold mt-1">
                      Simulated trades registered
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick display of Equity Growth & recent trades table */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 bg-card/20 border-border/40">
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Equity Growth Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={equityCurveData} margin={{ left: -10, right: 10 }}>
                        <defs>
                          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c5a880" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#c5a880" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={equityYDomain} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={initialBalance} stroke="#c5a880" strokeDasharray="3 3" opacity={0.35} label={{ value: "Initial Balance", fill: "#c5a880", fontSize: 8, position: "top" }} />
                        <Area type="monotone" dataKey="equity" stroke="#c5a880" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Account Settings / Meta details card */}
                <Card className="bg-card/20 border-border/40">
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Simulated Configs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-semibold">
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span className="text-muted-foreground uppercase">Currency</span>
                      <span>{account.currency || "USD"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span className="text-muted-foreground uppercase">Server</span>
                      <span>{account.server || "Simulation server"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span className="text-muted-foreground uppercase">Last Sync</span>
                      <span>{new Date(account.last_sync || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span className="text-muted-foreground uppercase">Leverage</span>
                      <span>1:100</span>
                    </div>
                    <div className="pt-2 text-center text-muted-foreground">
                      * All balances and operations are fully simulated local backups.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: TRADE HISTORY */}
          {activeTab === "trades" && (
            <div className="bg-card/20 border border-border/40 rounded-xl p-4 md:p-6">
              <TradeList trades={initialTrades} />
            </div>
          )}

          {/* TAB 3: TRADING CALENDAR */}
          {activeTab === "calendar" && (
            <TradingCalendar initialTrades={initialTrades} />
          )}

          {/* TAB 4: TRADER'S STATS */}
          {activeTab === "stats" && (
            <div className="bg-card/20 border border-border/40 rounded-xl p-4 md:p-6">
              {/* Render global Stats component with filtered trades directly */}
              <TraderStats initialTrades={initialTrades} hideAccountSelector={true} />
            </div>
          )}

          {/* TAB 4: VISUAL PERFORMANCE ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="grid gap-6">
              {/* Row 1: Dynamic period metric analytics */}
              <AnalyticsPeriodChart
                closedTrades={closedTrades}
                initialBalance={initialBalance}
              />

              {/* Row 2: Strategy Breakdown + Buy/Sell ratios */}
              <div className="grid gap-6 lg:grid-cols-2">
                <TradeTypeDistribution trades={initialTrades} />
                <StrategyBreakdown trades={initialTrades} />
              </div>
            </div>
          )}

          {/* TAB 5: JOURNAL TRADE */}
          {activeTab === "add-trade" && (
            <TradeForm
              userId={account.user_id}
              defaultAccountId={account.id}
              onSuccess={() => {
                setActiveTab("trades");
                router.refresh();
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
