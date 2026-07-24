"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, TrendingUp, TrendingDown, Target, ChevronDown, ChevronUp } from "lucide-react";
import { cn, getLocalDateString } from "@/lib/utils";
import { TradeDetailPanel } from "@/components/dashboard/trade-detail-panel";

interface Trade {
  id: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  entry_price_text?: string | null;
  exit_price_text?: string | null;
  quantity: number;
  trade_type: string;
  entry_date: string;
  exit_date: string | null;
  status: string;
  strategy_name: string | null;
  notes: string | null;
  screenshot_url: string | null;
  pnl: number | null;
  pnl_percentage: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  broker_account_id?: string | null;
}

interface StrategyDetailsViewProps {
  account: any;
  trades: Trade[];
  strategyName: string;
}

export function StrategyDetailsView({ account, trades, strategyName }: StrategyDetailsViewProps) {
  const router = useRouter();
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  // 1. Get all closed trades belonging to this strategy
  const strategyClosedTrades = useMemo(() => {
    return trades.filter(
      (t) => t.status === "closed" && t.pnl !== null && t.strategy_name === strategyName
    );
  }, [trades, strategyName]);

  // 2. Compute performance metrics for this strategy
  const metrics = useMemo(() => {
    const total = strategyClosedTrades.length;
    const wins = strategyClosedTrades.filter((t) => (t.pnl || 0) > 0);
    const losses = strategyClosedTrades.filter((t) => (t.pnl || 0) <= 0);
    
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const totalPnL = strategyClosedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalPct = strategyClosedTrades.reduce((sum, t) => sum + (t.pnl_percentage || 0), 0);
    const avgPct = total > 0 ? totalPct / total : 0;

    return { total, winsCount: wins.length, lossesCount: losses.length, winRate, totalPnL, avgPct };
  }, [strategyClosedTrades]);

  // 3. Filter trades by dates for table display & export
  const filteredStrategyTrades = useMemo(() => {
    return strategyClosedTrades.filter((t) => {
      const tradeDateObj = new Date(t.entry_date);
      const tradeDateStr = isNaN(tradeDateObj.getTime()) ? "" : getLocalDateString(tradeDateObj);
      const matchStartDate = !filterStartDate || tradeDateStr >= filterStartDate;
      const matchEndDate = !filterEndDate || tradeDateStr <= filterEndDate;
      return matchStartDate && matchEndDate;
    });
  }, [strategyClosedTrades, filterStartDate, filterEndDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleExportStrategyCSV = () => {
    if (filteredStrategyTrades.length === 0) return;

    // CSV Headers
    const headers = [
      "Asset/Symbol",
      "Type",
      "Lots/Quantity",
      "Entry Price",
      "Exit Price",
      "Stop Loss (SL)",
      "Take Profit (TP)",
      "Opened Date",
      "Closed Date",
      "P&L ($)",
      "P&L (%)",
      "Notes"
    ];

    // Map rows
    const rows = filteredStrategyTrades.map((t) => [
      t.symbol,
      t.trade_type.toUpperCase(),
      t.quantity,
      t.entry_price_text || t.entry_price,
      t.exit_price_text || t.exit_price || "—",
      t.stop_loss || "—",
      t.take_profit || "—",
      new Date(t.entry_date).toISOString().split("T")[0],
      t.exit_date ? new Date(t.exit_date).toISOString().split("T")[0] : "—",
      t.pnl || 0,
      t.pnl_percentage ? t.pnl_percentage.toFixed(2) : "0.00",
      `"${(t.notes || "").replace(/"/g, '""')}"` // escape quotes
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `strategy_${strategyName.replace(/\s+/g, "_").toLowerCase()}_trades_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href={`/dashboard/${account.id}?tab=analytics`}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Link>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground">
              Strategy: <span className="text-gold-gradient">{strategyName}</span>
            </h1>
          </div>
          <p className="text-xs uppercase text-muted-foreground font-semibold">
            Performance Ledger for Account: {account.broker_type.toUpperCase()} ({account.account_id})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {filteredStrategyTrades.length > 0 && (
            <Button
              onClick={handleExportStrategyCSV}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-accent/20 border-primary/20 text-primary hover:border-primary/50 hover:bg-accent/40 text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV Ledger
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Cumulative PnL</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-lg md:text-xl font-mono font-black",
              metrics.totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {metrics.totalPnL >= 0 ? "+" : ""}{formatCurrency(metrics.totalPnL)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Win Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-xl font-mono font-black text-foreground">
              {metrics.winRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Average PnL (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-lg md:text-xl font-mono font-black",
              metrics.avgPct >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {metrics.avgPct >= 0 ? "+" : ""}{metrics.avgPct.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Total Trades</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-xl font-mono font-black text-foreground">
              {metrics.total} <span className="text-[10px] text-muted-foreground font-mono">({metrics.winsCount}W / {metrics.lossesCount}L)</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Content */}
      <Card className="bg-card/20 border border-border/40 rounded-xl overflow-hidden">
        <CardHeader className="border-b border-border/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Strategy Trade History
              </CardTitle>
              <CardDescription className="text-[10px] uppercase text-muted-foreground mt-0.5">
                {filteredStrategyTrades.length} of {metrics.total} closed trades matching criteria
              </CardDescription>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-secondary/50 border border-primary/20 hover:border-primary/40 focus-within:border-primary/50 rounded-lg px-3 h-10 text-xs transition-all">
                <span className="text-[9px] uppercase font-black text-muted-foreground">From</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-foreground font-mono text-xs w-32 [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center gap-2 bg-secondary/50 border border-primary/20 hover:border-primary/40 focus-within:border-primary/50 rounded-lg px-3 h-10 text-xs transition-all">
                <span className="text-[9px] uppercase font-black text-muted-foreground">To</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-foreground font-mono text-xs w-32 [color-scheme:dark]"
                />
              </div>

              {(filterStartDate || filterEndDate) && (
                <Button
                  onClick={() => {
                    setFilterStartDate("");
                    setFilterEndDate("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-10 text-xs uppercase font-black text-muted-foreground hover:text-destructive hover:bg-transparent"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {filteredStrategyTrades.length === 0 ? (
              <div className="py-20 text-center text-sm text-muted-foreground uppercase font-black tracking-wider">
                No trades match the selected date range
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs md:text-sm">
                <thead>
                  <tr className="bg-neutral-900/30 text-[10px] uppercase font-extrabold text-foreground tracking-widest border-b border-border/20">
                    <th className="py-4 px-6">Asset/Symbol</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Lots/Quantity</th>
                    <th className="py-4 px-6">Entry Price</th>
                    <th className="py-4 px-6">Exit Price</th>
                    <th className="py-4 px-6">P&L ($)</th>
                    <th className="py-4 px-6">P&L (%)</th>
                    <th className="py-4 px-6">Closed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10 font-bold text-xs md:text-sm">
                  {filteredStrategyTrades.flatMap((t) => {
                    const isExpanded = expandedTradeId === t.id;
                    return [
                      <tr
                        key={t.id}
                        className="hover:bg-muted/5 transition-colors cursor-pointer"
                        onClick={() => setExpandedTradeId(isExpanded ? null : t.id)}
                      >
                        <td className="py-4 px-6 font-black text-foreground">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span>{t.symbol}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider",
                            t.trade_type === "long" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {t.trade_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-foreground">{t.quantity}</td>
                        <td className="py-4 px-6 font-mono text-foreground">${t.entry_price}</td>
                        <td className="py-4 px-6 font-mono text-foreground">
                          {t.exit_price ? `$${t.exit_price}` : "—"}
                        </td>
                        <td className={cn(
                          "py-4 px-6 font-mono",
                          (t.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {t.pnl !== null ? `${t.pnl >= 0 ? "+" : ""}${formatCurrency(t.pnl)}` : "—"}
                        </td>
                        <td className={cn(
                          "py-4 px-6 font-mono",
                          (t.pnl_percentage || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {t.pnl_percentage !== null ? `${t.pnl_percentage >= 0 ? "+" : ""}${t.pnl_percentage.toFixed(2)}%` : "—"}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground font-mono">
                          {new Date(t.entry_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                      </tr>,
                      isExpanded && (
                        <TradeDetailPanel
                          key={`${t.id}-details`}
                          trade={t}
                          colSpan={8}
                          onUpdate={() => router.refresh()}
                        />
                      )
                    ];
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
