"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Award,
  Target,
  TrendingUp,
  Plus,
  CheckCircle2,
  XCircle,
  Radio,
  Loader2,
  Trash2,
  Edit3,
  Zap,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  getOperatorTrades,
  createOperatorTrade,
  updateOperatorTrade,
  deleteOperatorTrade,
} from "@/lib/actions";
import SpotlightCard from "@/components/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MonthlyDataItem {
  monthKey: string;
  monthName: string;
  stats: {
    totalSignals: number;
    openSignals: number;
    winCount: number;
    lossCount: number;
    closedCount: number;
    accuracyPercent: number;
    totalPips: number;
    waitingCount?: number;
    triggeredCount?: number;
  };
  trades: RdxTrade[];
}

interface RdxTrade {
  _id: string;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number;
  takeProfit: number;
  status:
    | "waiting_for_trigger"
    | "triggered"
    | "open"
    | "active"
    | "tp_hit"
    | "sl_hit"
    | "closed"
    | "close"
    | "breakeven"
    | "never_triggered"
    | "not_triggered";
  pnlPips: number;
  tradeCategory?: "operator_hq" | "rdx_gold";
  notes: string;
  createdAt: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
}

export function RdxTradesView() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin";

  const [trades, setTrades] = useState<RdxTrade[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [stats, setStats] = useState({
    totalSignals: 0,
    openSignals: 0,
    winCount: 0,
    lossCount: 0,
    closedCount: 0,
    accuracyPercent: 0,
    totalPips: 0,
    waitingCount: 0,
    triggeredCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "buy" | "sell" | "waiting" | "never" | "triggered" | "wins">("all");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<RdxTrade | null>(null);

  // Form State for RDX Gold Trade Setup
  const [createForm, setCreateForm] = useState({
    symbol: "XAUUSD",
    direction: "long" as "long" | "short",
    entryPrice: "",
    stopLoss: "",
    takeProfit: "",
    status: "waiting_for_trigger" as RdxTrade["status"],
    notes: "",
    createdAt: "",
  });

  const [updateForm, setUpdateForm] = useState({
    status: "tp_hit" as RdxTrade["status"],
    exitPrice: "",
    notes: "",
    createdAt: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getOperatorTrades();
      const rdxOnly = (res.trades || []).filter(
        (t: any) => t.tradeCategory === "rdx_gold"
      );
      setTrades(rdxOnly);

      if ((res as any).rdxGoldStats) {
        setStats((res as any).rdxGoldStats);
      } else {
        const totalSignals = rdxOnly.length;
        const waitingCount = rdxOnly.filter((t: any) => t.status === "waiting_for_trigger").length;
        const triggeredCount = rdxOnly.filter((t: any) => t.status === "triggered").length;
        const openSignals = rdxOnly.filter((t: any) => t.status === "open" || t.status === "triggered").length;
        const winCount = rdxOnly.filter((t: any) => t.status === "tp_hit" || (t.status === "closed" && t.pnlPips > 0)).length;
        const lossCount = rdxOnly.filter((t: any) => t.status === "sl_hit" || (t.status === "closed" && t.pnlPips < 0)).length;
        const closedCount = winCount + lossCount;
        const accuracyPercent = closedCount > 0 ? Number(((winCount / closedCount) * 100).toFixed(1)) : 0;
        const totalPips = Number(rdxOnly.reduce((sum: number, t: any) => sum + (t.pnlPips || 0), 0).toFixed(1));
        setStats({ totalSignals, openSignals, waitingCount, triggeredCount, winCount, lossCount, closedCount, accuracyPercent, totalPips });
      }

      if (res.monthlyData) setMonthlyData(res.monthlyData);
    } catch (err) {
      console.error("Failed to load RDX Gold Trades:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry = parseFloat(createForm.entryPrice);
    const sl = parseFloat(createForm.stopLoss);
    const tp = parseFloat(createForm.takeProfit);

    if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please provide valid entry price, SL, and TP for Gold.",
      });
      return;
    }

    startTransition(async () => {
      const result = await createOperatorTrade({
        symbol: "XAUUSD",
        direction: createForm.direction,
        tradeCategory: "rdx_gold",
        entryPrice: entry,
        stopLoss: sl,
        takeProfit: tp,
        status: createForm.status,
        notes: createForm.notes,
        createdAt: createForm.createdAt || undefined,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "RDX Post Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "RDX Gold Level Posted",
          description: `Daily ${createForm.direction === "long" ? "BUY" : "SELL"} Gold Level published to RDX Trades!`,
        });
        setIsCreateOpen(false);
        setCreateForm({
          symbol: "XAUUSD",
          direction: "long",
          entryPrice: "",
          stopLoss: "",
          takeProfit: "",
          status: "waiting_for_trigger",
          notes: "",
          createdAt: "",
        });
        fetchData();
      }
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;

    startTransition(async () => {
      const result = await updateOperatorTrade(selectedTrade._id, {
        status: updateForm.status,
        exitPrice: updateForm.exitPrice ? parseFloat(updateForm.exitPrice) : null,
        notes: updateForm.notes,
        createdAt: updateForm.createdAt || undefined,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "RDX Level Status Updated",
          description: "Status and P&L successfully updated.",
        });
        setIsUpdateOpen(false);
        setSelectedTrade(null);
        fetchData();
      }
    });
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RDX Gold Trade setup?")) return;

    startTransition(async () => {
      const result = await deleteOperatorTrade(id);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "RDX Level Removed",
          description: "Signal entry deleted successfully.",
        });
        fetchData();
      }
    });
  };

  const openUpdateModal = (trade: RdxTrade) => {
    setSelectedTrade(trade);
    let formattedDate = "";
    if (trade.createdAt) {
      const d = new Date(trade.createdAt);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split("T")[0];
      }
    }
    setUpdateForm({
      status: trade.status,
      exitPrice: trade.exitPrice ? String(trade.exitPrice) : "",
      notes: trade.notes || "",
      createdAt: formattedDate,
    });
    setIsUpdateOpen(true);
  };

  const displayMonthlyData = monthlyData.length > 0 ? monthlyData : [
    {
      monthKey: selectedMonth,
      monthName: "Current Month",
      stats,
      trades,
    }
  ];

  const activeMonthIndex = displayMonthlyData.findIndex((m) => m.monthKey === selectedMonth);

  const handlePrevMonth = () => {
    if (activeMonthIndex > 0) {
      setSelectedMonth(displayMonthlyData[activeMonthIndex - 1].monthKey);
    }
  };

  const handleNextMonth = () => {
    if (activeMonthIndex >= 0 && activeMonthIndex < displayMonthlyData.length - 1) {
      setSelectedMonth(displayMonthlyData[activeMonthIndex + 1].monthKey);
    }
  };

  const baseTrades = selectedMonth === "all" ? trades : (displayMonthlyData.find((m) => m.monthKey === selectedMonth)?.trades.filter((t) => t.tradeCategory === "rdx_gold") || trades);

  const activeStats = React.useMemo(() => {
    const totalSignals = baseTrades.length;
    const openSignals = baseTrades.filter((t) => t.status === "open" || t.status === "triggered" || t.status === "active").length;
    const waitingCount = baseTrades.filter((t) => t.status === "waiting_for_trigger").length;
    const notTriggeredCount = baseTrades.filter((t) => t.status === "not_triggered" || t.status === "never_triggered").length;
    const triggeredCount = baseTrades.filter((t) => t.status === "triggered" || t.status === "active" || t.status === "open").length;
    const winCount = baseTrades.filter((t) => t.status === "tp_hit" || ((t.status === "closed" || t.status === "close") && t.pnlPips > 0)).length;
    const lossCount = baseTrades.filter((t) => t.status === "sl_hit" || ((t.status === "closed" || t.status === "close") && t.pnlPips < 0)).length;
    const closedCount = winCount + lossCount;
    const accuracyPercent = closedCount > 0 ? Number(((winCount / closedCount) * 100).toFixed(1)) : 0;
    const totalPips = Number(baseTrades.reduce((sum, t) => sum + (t.pnlPips || 0), 0).toFixed(1));

    return {
      totalSignals,
      openSignals,
      waitingCount,
      notTriggeredCount,
      triggeredCount,
      winCount,
      lossCount,
      closedCount,
      accuracyPercent,
      totalPips,
    };
  }, [baseTrades]);

  const filteredTrades = baseTrades
    .filter((t) => {
      if (filter === "buy") return t.direction === "long";
      if (filter === "sell") return t.direction === "short";
      if (filter === "waiting") return t.status === "waiting_for_trigger";
      if (filter === "never") return t.status === "never_triggered" || t.status === "not_triggered";
      if (filter === "triggered") return t.status === "triggered" || t.status === "open" || t.status === "active";
      if (filter === "wins") return t.status === "tp_hit" || ((t.status === "closed" || t.status === "close") && t.pnlPips > 0);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: RdxTrade["status"]) => {
    switch (status) {
      case "waiting_for_trigger":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase px-2.5 py-0.5 animate-pulse flex items-center gap-1">
            <Hourglass className="w-3 h-3" /> Waiting for Trigger
          </Badge>
        );
      case "not_triggered":
      case "never_triggered":
        return (
          <Badge className="bg-slate-500/10 text-slate-400 border border-slate-500/30 font-bold text-xs uppercase px-2.5 py-0.5 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-slate-400" /> Not Triggered
          </Badge>
        );
      case "active":
      case "triggered":
      case "open":
        return (
          <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold text-xs uppercase px-2.5 py-0.5 animate-pulse flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> Active
          </Badge>
        );
      case "tp_hit":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase px-2.5 py-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> TP Hit
          </Badge>
        );
      case "sl_hit":
        return (
          <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs uppercase px-2.5 py-0.5 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> SL Hit
          </Badge>
        );
      case "breakeven":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold text-xs uppercase px-2.5 py-0.5 flex items-center gap-1">
            Breakeven
          </Badge>
        );
      case "closed":
      case "close":
        return (
          <Badge className="bg-muted text-muted-foreground border border-border/40 font-bold text-xs uppercase px-2.5 py-0.5 flex items-center gap-1">
            Close
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full select-none">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-primary fill-primary/20" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-gold-gradient italic">
              RDX Trades <span className="text-foreground not-italic">(Gold Strategy)</span>
            </h1>
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-bold text-xs uppercase px-2.5 py-0.5">
              Daily 1 BUY & 1 SELL Gold Level
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">
            Daily Gold (XAUUSD) Buy & Sell levels posted by Admin. Track real-time trigger status, TP/SL hits, and accuracy.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gold-gradient text-background hover:opacity-90 font-bold text-xs uppercase px-4 shadow-sm self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" /> Post Daily Gold Level
          </Button>
        )}
      </div>

      {/* SCOREBOARD BANNER STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SpotlightCard className="p-4 bg-card/40 border-primary/20 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Accuracy Rate</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-primary mt-2">
            {activeStats.accuracyPercent}%
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {activeStats.winCount} Wins / {activeStats.closedCount} Closed Setups
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-4 bg-card/40 border-emerald-500/20 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Total Pips Gained</span>
            <TrendingUp className={cn("w-4 h-4", activeStats.totalPips >= 0 ? "text-emerald-400" : "text-red-400")} />
          </div>
          <div className={cn("text-2xl font-black mt-2", activeStats.totalPips > 0 ? "text-emerald-400" : activeStats.totalPips < 0 ? "text-red-400" : "text-muted-foreground")}>
            {activeStats.totalPips > 0 ? `+${activeStats.totalPips} Pips` : `${activeStats.totalPips} Pips`}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Net Gold Pips Accumulation
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-4 bg-card/40 border-cyan-500/20 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Triggered / Running</span>
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2">
            {activeStats.triggeredCount} Active
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Levels Triggered & In Play
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-4 bg-card/40 border-amber-500/20 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Waiting Trigger</span>
            <Hourglass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {activeStats.waitingCount} Pending
          </div>
        </SpotlightCard>
      </div>

      {/* FILTER & MONTH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 border border-border/40 p-3 rounded-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="text-xs font-bold rounded-xl h-8 uppercase"
          >
            All Setups
          </Button>
          <Button
            size="sm"
            variant={filter === "buy" ? "default" : "outline"}
            onClick={() => setFilter("buy")}
            className="text-xs font-bold rounded-xl h-8 uppercase text-emerald-400 border-emerald-500/30"
          >
            BUY Levels
          </Button>
          <Button
            size="sm"
            variant={filter === "sell" ? "default" : "outline"}
            onClick={() => setFilter("sell")}
            className="text-xs font-bold rounded-xl h-8 uppercase text-red-400 border-red-500/30"
          >
            SELL Levels
          </Button>
          <Button
            size="sm"
            variant={filter === "waiting" ? "default" : "outline"}
            onClick={() => setFilter("waiting")}
            className="text-xs font-bold rounded-xl h-8 uppercase text-amber-400 border-amber-500/30"
          >
            Waiting Trigger
          </Button>
          <Button
            size="sm"
            variant={filter === "never" ? "default" : "outline"}
            onClick={() => setFilter("never")}
            className="text-xs font-bold rounded-xl h-8 uppercase text-slate-400 border-slate-500/30"
          >
            Not Triggered
          </Button>
          <Button
            size="sm"
            variant={filter === "triggered" ? "default" : "outline"}
            onClick={() => setFilter("triggered")}
            className="text-xs font-bold rounded-xl h-8 uppercase text-cyan-400 border-cyan-500/30"
          >
            Active / Triggered
          </Button>
          <Button
            size="sm"
            variant={filter === "wins" ? "default" : "outline"}
            onClick={() => setFilter("wins")}
            className="text-xs font-bold rounded-xl h-8 uppercase"
          >
            Winners
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrevMonth}
            disabled={activeMonthIndex <= 0}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-bold uppercase text-foreground px-2">
            {selectedMonth === "all" ? "All Months History" : displayMonthlyData[activeMonthIndex]?.monthName || selectedMonth}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNextMonth}
            disabled={activeMonthIndex >= displayMonthlyData.length - 1}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* RDX GOLD TRADES LIST */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading RDX Gold Levels...</p>
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="py-20 text-center bg-card/20 rounded-2xl border border-border/40 space-y-3">
          <Zap className="w-10 h-10 text-primary/40 mx-auto" />
          <p className="text-sm font-bold uppercase text-muted-foreground">No RDX Gold Setups Found</p>
          <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
            {isAdmin ? "Click 'Post Daily Gold Level' above to publish Buy & Sell levels for Gold." : "Check back soon for daily Gold levels posted by Admin."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTrades.map((t, idx) => {
              const isWin = t.status === "tp_hit" || ((t.status === "closed" || t.status === "close") && t.pnlPips > 0);
              const isLoss = t.status === "sl_hit" || ((t.status === "closed" || t.status === "close") && t.pnlPips < 0);
              const slDist = Math.abs(t.entryPrice - t.stopLoss);
              const tpDist = Math.abs(t.takeProfit - t.entryPrice);
              const rrRatio = slDist > 0 ? (tpDist / slDist).toFixed(1) : "1.0";

              return (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                >
                  <div
                    className={cn(
                      "p-4 rounded-xl bg-card/40 border border-border/60 hover:border-primary/40 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative",
                      isWin && "border-emerald-500/30 bg-emerald-500/5",
                      isLoss && "border-rose-500/30 bg-rose-500/5"
                    )}
                  >
                    {/* Left: Symbol, Direction, Date (No Time) */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs tracking-wider uppercase px-3 py-1.5 shadow-xs">
                        XAUUSD (GOLD)
                      </Badge>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-bold gap-1 uppercase px-2.5 py-1",
                          t.direction === "long"
                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            : "text-rose-400 border-rose-500/30 bg-rose-500/10"
                        )}
                      >
                        {t.direction === "long" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {t.direction === "long" ? "BUY LEVEL" : "SELL LEVEL"}
                      </Badge>

                      <span className="text-[11px] text-muted-foreground font-mono inline-block">
                        {new Date(t.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Middle: Price Levels Row */}
                    <div className="flex items-center gap-3 sm:gap-6 bg-muted/30 px-3.5 py-2 rounded-lg text-sm font-mono shrink-0 overflow-x-auto">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Entry</span>
                        <span className="font-bold text-foreground">${t.entryPrice}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-border/40" />
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Stop Loss</span>
                        <span className="font-bold text-rose-400">${t.stopLoss}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-border/40" />
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Take Profit</span>
                        <span className="font-bold text-emerald-400">${t.takeProfit}</span>
                      </div>
                      {t.exitPrice && t.exitPrice > 0 && (
                        <>
                          <div className="h-6 w-[1px] bg-border/40" />
                          <div>
                            <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">Exit Price</span>
                            <span className="font-bold text-cyan-400">${t.exitPrice}</span>
                          </div>
                        </>
                      )}
                      <div className="h-6 w-[1px] bg-border/40 hidden md:block" />
                      <div className="hidden md:block">
                        <span className="text-[10px] uppercase text-muted-foreground block font-sans font-semibold">R:R</span>
                        <span className="font-bold text-muted-foreground">1:{rrRatio}</span>
                      </div>
                    </div>

                    {/* Notes (if present) */}
                    {t.notes && (
                      <p className="text-xs text-muted-foreground italic truncate max-w-xs hidden xl:block" title={t.notes}>
                        &quot;{t.notes}&quot;
                      </p>
                    )}

                    {/* Right: Status, PnL Pips, Admin Controls */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                      {getStatusBadge(t.status)}

                      {/* PnL Pips Display */}
                      <div className="font-mono text-xs font-extrabold min-w-[70px] text-right">
                        {t.pnlPips > 0 ? (
                          <span className="text-emerald-400">+{t.pnlPips} Pips</span>
                        ) : t.pnlPips < 0 ? (
                          <span className="text-rose-400">{t.pnlPips} Pips</span>
                        ) : (
                          <span className="text-muted-foreground">0 Pips</span>
                        )}
                      </div>

                      {/* Admin Control Buttons */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 border-l border-border/40 pl-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openUpdateModal(t)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Update Status"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTrade(t._id)}
                            className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            title="Delete Setup"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border-primary/30 text-foreground max-w-lg rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Post Daily RDX Gold Level
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Publish official Buy or Sell Gold level setup for daily tracking.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Symbol</Label>
                <Input value="XAUUSD (GOLD)" disabled className="h-9 font-bold bg-muted/40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-primary">Direction</Label>
                <select
                  value={createForm.direction}
                  onChange={(e) => setCreateForm({ ...createForm, direction: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-lg bg-muted/30 border border-primary/30 text-foreground text-xs font-bold"
                >
                  <option value="long">📈 BUY / LONG Level</option>
                  <option value="short">📉 SELL / SHORT Level</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-primary">Entry Price (Level)</Label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 2650.50"
                required
                className="h-10 font-mono text-sm border-primary/30"
                value={createForm.entryPrice}
                onChange={(e) => setCreateForm({ ...createForm, entryPrice: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-red-400">Stop Loss (SL)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="SL Price"
                  required
                  className="h-9 font-mono border-red-500/30"
                  value={createForm.stopLoss}
                  onChange={(e) => setCreateForm({ ...createForm, stopLoss: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-emerald-400">Take Profit (TP)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="TP Price"
                  required
                  className="h-9 font-mono border-emerald-500/30"
                  value={createForm.takeProfit}
                  onChange={(e) => setCreateForm({ ...createForm, takeProfit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Initial Status Dropdown</Label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-primary/30 text-foreground text-xs font-bold"
              >
                <option value="waiting_for_trigger">Waiting for Trigger</option>
                <option value="active">Active</option>
                <option value="sl_hit">SL Hit</option>
                <option value="tp_hit">TP Hit</option>
                <option value="breakeven">Breakeven</option>
                <option value="closed">Close</option>
                <option value="not_triggered">Not Triggered</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Trade Date</Label>
              <Input
                type="date"
                className="h-9 font-sans"
                value={createForm.createdAt}
                onChange={(e) => setCreateForm({ ...createForm, createdAt: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Setup Notes / Reason</Label>
              <Textarea
                placeholder="e.g. Key daily support level + NY session liquidity sweep"
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                className="text-xs min-h-[60px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-xs uppercase font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-gold-gradient text-background font-bold text-xs uppercase px-5">
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                Publish Gold Level
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* UPDATE MODAL */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="bg-card border-primary/30 text-foreground max-w-md rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Update Gold Level Status</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select status from dropdown and optionally enter exit price.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-primary">Status Dropdown</Label>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as any })}
                className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-primary/30 text-foreground text-xs font-bold"
              >
                <option value="waiting_for_trigger">Waiting for Trigger</option>
                <option value="active">Active</option>
                <option value="sl_hit">SL Hit</option>
                <option value="tp_hit">TP Hit</option>
                <option value="breakeven">Breakeven</option>
                <option value="closed">Close</option>
                <option value="not_triggered">Not Triggered</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Exit Price (Optional)</Label>
              <Input
                type="number"
                step="any"
                placeholder="Final Exit Price"
                className="h-9 font-mono"
                value={updateForm.exitPrice}
                onChange={(e) => setUpdateForm({ ...updateForm, exitPrice: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Trade Date</Label>
              <Input
                type="date"
                className="h-9 font-sans"
                value={updateForm.createdAt}
                onChange={(e) => setUpdateForm({ ...updateForm, createdAt: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Comment / Update Notes</Label>
              <Textarea
                placeholder="e.g. Smashed TP1 with +150 pips profit!"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                className="text-xs min-h-[60px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsUpdateOpen(false)} className="text-xs uppercase font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-gold-gradient text-background font-bold text-xs uppercase px-5">
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                Save Outcome
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
