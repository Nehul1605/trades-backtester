"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Globe,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsType {
  totalSignals: number;
  openSignals: number;
  winCount: number;
  lossCount: number;
  closedCount: number;
  accuracyPercent: number;
  totalPips: number;
}

interface MonthlyDataItem {
  monthKey: string;
  monthName: string;
  stats: StatsType;
  trades: any[];
}

interface PublicSignalsClientProps {
  stats: StatsType;
  monthlyData: MonthlyDataItem[];
  trades: any[];
}

export function PublicSignalsClient({
  stats: overallStats,
  monthlyData = [],
  trades: allTrades = [],
}: PublicSignalsClientProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const displayMonthlyData = React.useMemo(() => {
    if (monthlyData.length > 0) return monthlyData;
    const startYear = 2026;
    const result: MonthlyDataItem[] = [];

    for (let m = 7; m < 12; m++) {
      const tempDate = new Date(startYear, m, 1);
      const monthKey = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}`;
      const monthName = tempDate.toLocaleString("en-US", { month: "long", year: "numeric" });
      result.push({
        monthKey,
        monthName,
        stats: { totalSignals: 0, openSignals: 0, winCount: 0, lossCount: 0, closedCount: 0, accuracyPercent: 0, totalPips: 0 },
        trades: [],
      });
    }
    return result;
  }, [monthlyData]);

  // Dynamically calculate index matching current real-world date (new Date())
  const initialCurrentMonthIndex = React.useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const foundIdx = displayMonthlyData.findIndex((m) => m.monthKey === currentKey);
    return foundIdx !== -1 ? foundIdx : 0;
  }, [displayMonthlyData]);

  // Index of active month for single-month carousel view
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(0);

  // Automatically update active month index to match current date
  React.useEffect(() => {
    setActiveMonthIndex(initialCurrentMonthIndex);
  }, [initialCurrentMonthIndex]);

  const currentVisibleMonth = displayMonthlyData[activeMonthIndex] || displayMonthlyData[0];

  const handlePrevMonth = () => {
    if (selectedMonth === "all") {
      setSelectedMonth(displayMonthlyData[0].monthKey);
      setActiveMonthIndex(0);
    } else if (activeMonthIndex > 0) {
      const newIdx = activeMonthIndex - 1;
      setActiveMonthIndex(newIdx);
      setSelectedMonth(displayMonthlyData[newIdx].monthKey);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === "all") {
      setSelectedMonth(displayMonthlyData[0].monthKey);
      setActiveMonthIndex(0);
    } else if (activeMonthIndex < displayMonthlyData.length - 1) {
      const newIdx = activeMonthIndex + 1;
      setActiveMonthIndex(newIdx);
      setSelectedMonth(displayMonthlyData[newIdx].monthKey);
    }
  };

  const [filter, setFilter] = useState<"all" | "gold" | "eur">("all");

  const activeMonthGroup = displayMonthlyData.find((m) => m.monthKey === selectedMonth);
  const displayTrades = selectedMonth === "all" ? allTrades : (activeMonthGroup?.trades || []);

  const activeStats = React.useMemo(() => {
    const tradesForStats = displayTrades.filter((t) => {
      if (filter === "gold") return t.symbol.toUpperCase().includes("XAU") || t.symbol.toUpperCase().includes("GOLD");
      if (filter === "eur") return t.symbol.toUpperCase().includes("EUR");
      return true;
    });

    const totalSignals = tradesForStats.length;
    const openSignals = tradesForStats.filter((t) => t.status === "open").length;
    const winCount = tradesForStats.filter((t) => t.status === "tp_hit" || (t.status === "closed" && t.pnlPips > 0)).length;
    const lossCount = tradesForStats.filter((t) => t.status === "sl_hit" || (t.status === "closed" && t.pnlPips < 0)).length;
    const closedCount = winCount + lossCount;
    const accuracyPercent = closedCount > 0 ? Number(((winCount / closedCount) * 100).toFixed(1)) : 0;
    const totalPips = Number(tradesForStats.reduce((sum, t) => sum + (t.pnlPips || 0), 0).toFixed(1));

    return {
      totalSignals,
      openSignals,
      winCount,
      lossCount,
      closedCount,
      accuracyPercent,
      totalPips,
    };
  }, [displayTrades, filter]);

  const displayMonthlyDataFiltered = React.useMemo(() => {
    return displayMonthlyData.map((mGroup) => {
      const filteredGroupTrades = mGroup.trades.filter((t) => {
        if (filter === "gold") return t.symbol.toUpperCase().includes("XAU") || t.symbol.toUpperCase().includes("GOLD");
        if (filter === "eur") return t.symbol.toUpperCase().includes("EUR");
        return true;
      });

      const winCount = filteredGroupTrades.filter((t) => t.status === "tp_hit" || (t.status === "closed" && t.pnlPips > 0)).length;
      const lossCount = filteredGroupTrades.filter((t) => t.status === "sl_hit" || (t.status === "closed" && t.pnlPips < 0)).length;
      const closedCount = winCount + lossCount;
      const accuracyPercent = closedCount > 0 ? Number(((winCount / closedCount) * 100).toFixed(1)) : 0;
      const totalPips = Number(filteredGroupTrades.reduce((sum, t) => sum + (t.pnlPips || 0), 0).toFixed(1));

      return {
        ...mGroup,
        trades: filteredGroupTrades,
        stats: {
          ...mGroup.stats,
          totalSignals: filteredGroupTrades.length,
          openSignals: filteredGroupTrades.filter((t) => t.status === "open").length,
          winCount,
          lossCount,
          closedCount,
          accuracyPercent,
          totalPips,
        }
      };
    });
  }, [displayMonthlyData, filter]);

  const filteredDisplayTrades = React.useMemo(() => {
    return displayTrades.filter((t) => {
      if (filter === "gold") return t.symbol.toUpperCase().includes("XAU") || t.symbol.toUpperCase().includes("GOLD");
      if (filter === "eur") return t.symbol.toUpperCase().includes("EUR");
      return true;
    });
  }, [displayTrades, filter]);

  return (
    <div className="space-y-12">
      {/* Month Filter Selector Bar - Single Horizontal Row with Arrow Controls */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card/50 border border-primary/20 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center text-background shrink-0 font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Month-wise Signals
            </h3>
          </div>
        </div>

        {/* Single Row Horizontal List: All Months + Single Active Month Button between arrows */}
        <div className="flex items-center gap-2 shrink-0 max-w-full">
          {/* Static All Months Button */}
          <button
            onClick={() => setSelectedMonth("all")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
              selectedMonth === "all"
                ? "bg-gold-gradient text-background shadow-md shadow-amber-500/20 font-black"
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            )}
          >
            <span>All Months</span>
            <span className="opacity-80">
              ({allTrades.filter((t) => {
                if (filter === "gold") return t.symbol.toUpperCase().includes("XAU") || t.symbol.toUpperCase().includes("GOLD");
                if (filter === "eur") return t.symbol.toUpperCase().includes("EUR");
                return true;
              }).length})
            </span>
          </button>

          <div className="h-5 w-[1px] bg-border/40 shrink-0" />

          {/* Left Arrow Button */}
          <button
            onClick={handlePrevMonth}
            disabled={selectedMonth !== "all" && activeMonthIndex <= 0}
            className={cn(
              "p-1.5 rounded-lg bg-muted/40 text-muted-foreground transition-all shrink-0 cursor-pointer",
              selectedMonth !== "all" && activeMonthIndex <= 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-muted hover:text-foreground"
            )}
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Single Visible Month Button */}
          <button
            onClick={() => {
              setSelectedMonth(currentVisibleMonth.monthKey);
            }}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-w-[140px] justify-center",
              selectedMonth === currentVisibleMonth.monthKey
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-black"
                : "bg-muted/40 hover:bg-muted text-muted-foreground font-semibold"
            )}
          >
            <span>{currentVisibleMonth.monthName}</span>
            <span className="opacity-80">
              ({currentVisibleMonth.trades.filter((t) => {
                if (filter === "gold") return t.symbol.toUpperCase().includes("XAU") || t.symbol.toUpperCase().includes("GOLD");
                if (filter === "eur") return t.symbol.toUpperCase().includes("EUR");
                return true;
              }).length})
            </span>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNextMonth}
            disabled={activeMonthIndex >= displayMonthlyData.length - 1}
            className={cn(
              "p-1.5 rounded-lg bg-muted/40 text-muted-foreground transition-all shrink-0 cursor-pointer",
              activeMonthIndex >= displayMonthlyData.length - 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-muted hover:text-foreground"
            )}
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accuracy Stats Cards for Active Month / All Time */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-2xl bg-card/50 border border-primary/20 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            {selectedMonth === "all" ? "All-Time Win Rate" : `${activeMonthGroup?.monthName} Win Rate`}
          </div>
          <div className="text-4xl font-extrabold tracking-tight text-emerald-500 font-mono">
            {activeStats.accuracyPercent}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {activeStats.winCount} Wins / {activeStats.lossCount} Losses ({activeStats.closedCount} closed)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card/50 border border-border/60 shadow-xs">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            Pips Gained ({selectedMonth === "all" ? "Total" : activeMonthGroup?.monthName})
          </div>
          <div className="text-4xl font-extrabold tracking-tight text-gold-gradient font-mono">
            {activeStats.totalPips > 0 ? `+${activeStats.totalPips}` : activeStats.totalPips}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Cumulative pips recorded in period
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card/50 border border-border/60 shadow-xs">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            Total Signals Issued
          </div>
          <div className="text-4xl font-extrabold tracking-tight font-mono text-foreground">
            {activeStats.totalSignals}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Official trade signal calls
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card/50 border border-border/60 shadow-xs">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            Active Signals
          </div>
          <div className="text-4xl font-extrabold tracking-tight font-mono text-blue-400">
            {activeStats.openSignals}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Currently open market positions
          </p>
        </div>
      </div>

      {/* Public Signal Feed Row-wise */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {selectedMonth === "all" ? "Public Trade Signals Log" : `${activeMonthGroup?.monthName} Trade Signals`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified market entries, stop loss, take profit, and exit pips performance
            </p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 uppercase font-black text-[10px] self-start sm:self-auto">
            Live Feed
          </Badge>
        </div>

        {/* Symbol Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/30 hover:bg-muted text-muted-foreground"
              )}
            >
              All Signals ({displayTrades.length})
            </button>
            <button
              onClick={() => setFilter("gold")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer",
                filter === "gold"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-muted/30 hover:bg-muted text-muted-foreground"
              )}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Gold (XAUUSD)
            </button>
            <button
              onClick={() => setFilter("eur")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                filter === "eur"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/30 hover:bg-muted text-muted-foreground"
              )}
            >
              EURUSD
            </button>
          </div>
        </div>

        {filteredDisplayTrades.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/20">
            <Award className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold uppercase tracking-wider">No signals posted for this month</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select another month tab to inspect operator trade calls.
            </p>
          </div>
        ) : selectedMonth === "all" ? (
          /* Render Monthwise Grouped Row Sections when "All Months" is selected */
          <div className="space-y-10">
            {displayMonthlyDataFiltered.map((mGroup) => {
              if (mGroup.trades.length === 0) return null; // Hide empty months when filtered
              return (
                <div key={mGroup.monthKey} className="space-y-3">
                  {/* Month Group Header Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card/60 border border-primary/20 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-primary/40 font-black text-xs uppercase px-3 py-1">
                        {mGroup.monthName}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-semibold">
                        {mGroup.trades.length} signal calls
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-emerald-400 font-bold">
                        Win Rate: {mGroup.stats.accuracyPercent}%
                      </span>
                      <span className="text-gold-gradient font-bold">
                        Pips: {mGroup.stats.totalPips > 0 ? `+${mGroup.stats.totalPips}` : mGroup.stats.totalPips}
                      </span>
                    </div>
                  </div>

                  {/* Signals Row List for this Month */}
                  <div className="space-y-3">
                    {mGroup.trades.map((trade: any) => (
                      <TradeSignalRow key={trade._id || trade.id} trade={trade} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Render Rows for Selected Month */
          <div className="space-y-3">
            {filteredDisplayTrades.map((trade: any) => (
              <TradeSignalRow key={trade._id || trade.id} trade={trade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TradeSignalRow({ trade }: { trade: any }) {
  const isLong = trade.direction === "long";
  const isTp = trade.status === "tp_hit";
  const isSl = trade.status === "sl_hit";
  const isOpen = trade.status === "open";
  const isGold = trade.symbol?.toUpperCase().includes("XAU") || trade.symbol?.toUpperCase().includes("GOLD");

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-card/40 border border-border/60 hover:border-primary/40 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative",
        isGold && "border-amber-500/30 bg-amber-500/5",
        isTp && "border-emerald-500/30 bg-emerald-500/5",
        isSl && "border-rose-500/30 bg-rose-500/5"
      )}
    >
      {/* Left: Symbol, Direction, Date */}
      <div className="flex items-center gap-3 shrink-0">
        <Badge
          className={cn(
            "font-extrabold text-xs tracking-wider uppercase px-3 py-1.5",
            isGold
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
              : "bg-primary text-primary-foreground"
          )}
        >
          {trade.symbol}
        </Badge>

        <Badge
          variant="outline"
          className={cn(
            "text-xs font-bold gap-1 uppercase px-2.5 py-1",
            isLong
              ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
              : "text-rose-500 border-rose-500/30 bg-rose-500/10"
          )}
        >
          {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isLong ? "BUY" : "SELL"}
        </Badge>

        <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline-block">
          {new Date(trade.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Middle: Horizontal Price Levels */}
      <div className="flex items-center gap-3 sm:gap-6 bg-muted/30 px-3.5 py-2 rounded-lg text-sm font-mono shrink-0 overflow-x-auto">
        <div>
          <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Entry</span>
          <span className="font-bold text-foreground">{trade.entryPrice}</span>
        </div>
        <div className="h-6 w-[1px] bg-border/40" />
        <div>
          <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Stop Loss</span>
          <span className="font-bold text-rose-400">{trade.stopLoss}</span>
        </div>
        <div className="h-6 w-[1px] bg-border/40" />
        <div>
          <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Take Profit</span>
          <span className="font-bold text-emerald-400">{trade.takeProfit}</span>
        </div>
        {trade.exitPrice && (
          <>
            <div className="h-6 w-[1px] bg-border/40" />
            <div>
              <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Exit Price</span>
              <span className="font-bold text-blue-400">{trade.exitPrice}</span>
            </div>
          </>
        )}
      </div>

      {/* Notes (if present) */}
      {trade.notes && (
        <p className="text-xs text-muted-foreground italic truncate max-w-xs hidden xl:block" title={trade.notes}>
          &quot;{trade.notes}&quot;
        </p>
      )}

      {/* Right: Status Badge & PnL Pips */}
      <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
        <Badge
          variant="outline"
          className={
            isOpen
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold text-[10px]"
              : isTp
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold text-[10px]"
              : isSl
              ? "bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold text-[10px]"
              : "bg-muted text-muted-foreground text-[10px]"
          }
        >
          {isOpen ? "OPEN" : isTp ? "TP HIT" : isSl ? "SL HIT" : trade.status.toUpperCase()}
        </Badge>

        <div className="font-mono text-xs font-extrabold min-w-[70px] text-right">
          {trade.pnlPips > 0 ? (
            <span className="text-emerald-500">+{trade.pnlPips} Pips</span>
          ) : trade.pnlPips < 0 ? (
            <span className="text-rose-500">{trade.pnlPips} Pips</span>
          ) : (
            <span className="text-muted-foreground">0 Pips</span>
          )}
        </div>
      </div>
    </div>
  );
}
