"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";

interface Trade {
  id: string;
  pnl: number | null;
  status: string;
}

interface StatsCardsProps {
  trades: Trade[];
}

export function StatsCards({ trades }: StatsCardsProps) {
  const closedTrades = trades.filter(
    (t) => t.status === "closed" && t.pnl !== null,
  );

  const totalPnL = closedTrades.reduce(
    (sum, trade) => sum + (trade.pnl || 0),
    0,
  );
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);
  const winRate =
    closedTrades.length > 0
      ? (winningTrades.length / closedTrades.length) * 100
      : 0;

  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
        winningTrades.length
      : 0;
  const avgLoss =
    losingTrades.length > 0
      ? Math.abs(
          losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
            losingTrades.length,
        )
      : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
        <div
          className={`absolute top-0 left-0 w-1 h-full ${totalPnL >= 0 ? "bg-emerald-500" : "bg-rose-500"} opacity-50`}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Total P&L
          </CardTitle>
          <div className="p-1.5 rounded-md bg-background/50 border border-border">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {formatCurrency(totalPnL)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              {closedTrades.length} Trades
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-50" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Win Rate
          </CardTitle>
          <div className="p-1.5 rounded-md bg-background/50 border border-border">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-foreground">
            {winRate.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
              {winningTrades.length}W
            </span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">
              {losingTrades.length}L
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Avg Win
          </CardTitle>
          <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-emerald-500">
            {formatCurrency(avgWin)}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">
            Best Performance
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-50" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Avg Loss
          </CardTitle>
          <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/20">
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-rose-500">
            {formatCurrency(avgLoss)}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">
            Risk Management
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
