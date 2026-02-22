"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Target, BarChart3, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Trade {
  id: string;
  strategy_name: string | null;
  pnl: number | null;
  pnl_percentage: number | null;
  status: string;
}

interface StrategyBreakdownProps {
  trades: Trade[];
}

export function StrategyBreakdown({ trades }: StrategyBreakdownProps) {
  const [visibleCount, setVisibleCount] = useState(3);
  const closedTrades = trades.filter(
    (t) => t.status === "closed" && t.pnl !== null && t.strategy_name,
  );

  const strategyMap = new Map<
    string,
    { count: number; totalPnL: number; totalPct: number; wins: number }
  >();

  closedTrades.forEach((trade) => {
    const strategy = trade.strategy_name || "Unknown";
    const existing = strategyMap.get(strategy) || {
      count: 0,
      totalPnL: 0,
      totalPct: 0,
      wins: 0,
    };

    strategyMap.set(strategy, {
      count: existing.count + 1,
      totalPnL: existing.totalPnL + (trade.pnl || 0),
      totalPct: existing.totalPct + (trade.pnl_percentage || 0),
      wins: existing.wins + ((trade.pnl || 0) > 0 ? 1 : 0),
    });
  });

  const allStrategies = Array.from(strategyMap.entries())
    .map(([name, data]) => ({
      name,
      ...data,
      winRate: (data.wins / data.count) * 100,
      avgPct: data.totalPct / data.count
    }))
    .sort((a, b) => b.totalPnL - a.totalPnL);

  const strategies = allStrategies.slice(0, visibleCount);
  const hasMore = allStrategies.length > visibleCount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  };

  if (strategies.length === 0) {
    return (
      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Strategy Breakdown</CardTitle>
          </div>
          <CardDescription>Performance filtered by execution logic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[240px] text-muted-foreground text-xs gap-2 border border-dashed border-border/40 rounded-xl bg-secondary/5">
            <BarChart3 className="w-8 h-8 opacity-20" />
            No strategy data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxTotalPnL = Math.max(...strategies.map(s => Math.abs(s.totalPnL)));

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-bold uppercase tracking-wider">Strategy Logic</CardTitle>
            </div>
            <CardDescription className="text-[11px] font-medium">Profitability by methodology</CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] h-5 py-0 bg-primary/5 text-primary border-primary/20">
            {strategies.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-6">
        <div className="space-y-5">
          {strategies.map((strategy) => (
            <div key={strategy.name} className="space-y-3 group cursor-default">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-md ${strategy.totalPnL >= 0 ? "bg-profit/10" : "bg-loss/10"}`}>
                    {strategy.totalPnL >= 0 ? <TrendingUp className="w-4 h-4 text-profit" /> : <TrendingDown className="w-4 h-4 text-loss" />}
                  </div>
                  <span className="text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors">{strategy.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${strategy.totalPnL >= 0 ? "text-profit" : "text-loss"}`}>
                      {formatCurrency(strategy.totalPnL)}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase opacity-60">Cumulative</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">Win Rate: <span className="text-foreground font-mono font-bold">{strategy.winRate.toFixed(1)}%</span></span>
                    <span className="text-muted-foreground">Sample: <span className="text-foreground font-mono font-bold">{strategy.count}</span></span>
                  </div>
                  <span className={`${strategy.avgPct >= 0 ? "text-profit/90" : "text-loss/90"} font-mono font-bold`}>
                    avg {strategy.avgPct.toFixed(2)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden flex">
                  <div 
                    className={`${strategy.totalPnL >= 0 ? "bg-profit" : "bg-loss"} h-full opacity-80`} 
                    style={{ width: `${Math.max(15, (Math.abs(strategy.totalPnL) / maxTotalPnL) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6 pt-2">
          {hasMore && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-[11px] h-9 uppercase font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 border border-dashed border-border/40"
              onClick={() => setVisibleCount(prev => prev + 3)}
            >
              Load More Strategies
              <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          )}
          {visibleCount > 3 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${!hasMore ? "w-full" : "w-24"} text-[11px] h-9 uppercase font-bold text-muted-foreground hover:text-destructive/80 hover:bg-loss/5 border border-dashed border-border/40`}
              onClick={() => setVisibleCount(3)}
            >
              Less
              <ChevronUp className="ml-1 w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
