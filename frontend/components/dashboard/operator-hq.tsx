"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  TrendingDown,
  Plus,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  BarChart3,
  Loader2,
  Trash2,
  Edit3,
  Sparkles,
  ShieldCheck,
  Zap,
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

interface OperatorTrade {
  _id: string;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number;
  takeProfit: number;
  status: "open" | "tp_hit" | "sl_hit" | "closed" | "breakeven";
  pnlPips: number;
  notes: string;
  createdAt: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
}

export function OperatorHQ() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const isAdmin = (session?.user as any)?.role === "admin";

  const [trades, setTrades] = useState<OperatorTrade[]>([]);
  const [stats, setStats] = useState({
    totalSignals: 0,
    openSignals: 0,
    winCount: 0,
    lossCount: 0,
    closedCount: 0,
    accuracyPercent: 0,
    totalPips: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "gold" | "eur" | "open" | "wins">("all");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<OperatorTrade | null>(null);

  // Form State
  const [createForm, setCreateForm] = useState({
    symbol: "XAUUSD",
    direction: "long" as "long" | "short",
    entryPrice: "2400.00",
    stopLoss: "2390.00",
    takeProfit: "2420.00",
    status: "open",
    notes: "Gold liquidity sweep & retest entry.",
  });

  const [updateForm, setUpdateForm] = useState({
    status: "tp_hit",
    exitPrice: "",
    notes: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getOperatorTrades();
      if (res.trades) setTrades(res.trades);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error("Failed to load operator HQ signals:", err);
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
        description: "Please provide valid entry, SL, and TP prices.",
      });
      return;
    }

    startTransition(async () => {
      const result = await createOperatorTrade({
        symbol: createForm.symbol,
        direction: createForm.direction,
        entryPrice: entry,
        stopLoss: sl,
        takeProfit: tp,
        status: createForm.status,
        notes: createForm.notes,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Signal Post Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Trade Signal Posted",
          description: `Official signal call for ${createForm.symbol} published to Operator HQ!`,
        });
        setIsCreateOpen(false);
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
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Signal Call Updated",
          description: `Status for ${selectedTrade.symbol} updated to ${updateForm.status.toUpperCase()}!`,
        });
        setIsUpdateOpen(false);
        setSelectedTrade(null);
        fetchData();
      }
    });
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to remove this signal call?")) return;
    startTransition(async () => {
      const result = await deleteOperatorTrade(id);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Signal Removed", description: "Signal call deleted successfully." });
        fetchData();
      }
    });
  };

  const openUpdateModal = (trade: OperatorTrade) => {
    setSelectedTrade(trade);
    setUpdateForm({
      status: trade.status,
      exitPrice: trade.exitPrice ? trade.exitPrice.toString() : trade.takeProfit.toString(),
      notes: trade.notes || "",
    });
    setIsUpdateOpen(true);
  };

  // Filtered trades list
  const filteredTrades = trades.filter((t) => {
    if (filter === "gold") return t.symbol.toUpperCase().includes("XAU") || t.symbol.toUpperCase().includes("GOLD");
    if (filter === "eur") return t.symbol.toUpperCase().includes("EUR");
    if (filter === "open") return t.status === "open";
    if (filter === "wins") return t.status === "tp_hit" || (t.status === "closed" && t.pnlPips > 0);
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Operator HQ
            </h1>
            <Badge variant="outline" className="bg-gold-gradient text-background font-bold text-xs uppercase border-none px-2.5 py-0.5">
              Official Signal Channel
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm">
            Live verified signal calls & transparent accuracy performance for Gold (XAUUSD) & Forex
          </p>
        </div>

        {/* Admin Post Button */}
        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gold-gradient text-background hover:opacity-90 transition-all font-bold text-xs uppercase px-4 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Post Signal Call
          </Button>
        )}
      </div>

      {/* Accuracy & Transparency Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Win Rate Accuracy */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-card/30 border-primary/20 backdrop-blur-md relative overflow-hidden gold-glow-subtle">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Accuracy Rate
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-gold-gradient">
                {stats.closedCount > 0 ? `${stats.accuracyPercent}%` : "0%"}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                {stats.closedCount > 0
                  ? `Verified Win Rate (${stats.winCount} W / ${stats.lossCount} L)`
                  : "No closed callouts yet"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Pips Gained */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="bg-card/30 border-emerald-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Total Pips Gained
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-emerald-500 font-mono">
                {stats.totalPips >= 0 ? `+${stats.totalPips}` : stats.totalPips}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                Cumulative pips across callouts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Signals Posted */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="bg-card/30 border-border/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Signal Calls Posted
              </CardTitle>
              <Radio className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                {stats.totalSignals}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                {stats.openSignals} Active • {stats.closedCount} Closed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Win / Loss Record */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <Card className="bg-card/30 border-border/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Win / Loss Record
              </CardTitle>
              <Award className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-500 font-mono">
                  {stats.winCount}W
                </span>
                <span className="text-xl text-muted-foreground font-bold font-mono">-</span>
                <span className="text-3xl font-extrabold tracking-tight text-rose-500 font-mono">
                  {stats.lossCount}L
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                Transparent verified outcomes
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/30 hover:bg-muted text-muted-foreground"
              )}
            >
              All Signals ({trades.length})
            </button>
            <button
              onClick={() => setFilter("gold")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1",
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
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filter === "eur"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/30 hover:bg-muted text-muted-foreground"
              )}
            >
              EURUSD
            </button>
            <button
              onClick={() => setFilter("open")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filter === "open"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-muted/30 hover:bg-muted text-muted-foreground"
              )}
            >
              Active Calls ({stats.openSignals})
            </button>
            <button
              onClick={() => setFilter("wins")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filter === "wins"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/30 hover:bg-muted text-muted-foreground"
              )}
            >
              Wins ({stats.winCount})
            </button>
          </div>

          <span className="text-xs text-muted-foreground">
            Showing {filteredTrades.length} callouts
          </span>
        </div>

        {/* Signals List Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Loading Operator HQ signals...
            </p>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border/60 rounded-2xl py-16 text-center space-y-3 bg-card/20">
            <Radio className="w-10 h-10 text-muted-foreground/50" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">No Signals Found</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              No signal callouts match the selected filter category.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredTrades.map((t, idx) => {
                const isGold = t.symbol.toUpperCase().includes("XAU") || t.symbol.toUpperCase().includes("GOLD");
                const isWin = t.status === "tp_hit" || (t.status === "closed" && t.pnlPips > 0);
                const isLoss = t.status === "sl_hit" || (t.status === "closed" && t.pnlPips < 0);
                const isOpen = t.status === "open";

                // RR ratio
                const slDist = Math.abs(t.entryPrice - t.stopLoss);
                const tpDist = Math.abs(t.takeProfit - t.entryPrice);
                const rrRatio = slDist > 0 ? (tpDist / slDist).toFixed(1) : "1.0";

                return (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="h-full"
                  >
                    <SpotlightCard
                      spotlightColor={isGold ? "rgba(217, 119, 6, 0.15)" : "rgba(59, 130, 246, 0.15)"}
                      className={cn(
                        "h-full bg-card/30 border-border/60 transition-all duration-300 relative rounded-2xl p-5 flex flex-col justify-between space-y-4",
                        isGold && "border-amber-500/30 gold-glow-subtle",
                        isWin && "border-emerald-500/40 bg-emerald-500/5",
                        isLoss && "border-rose-500/40 bg-rose-500/5"
                      )}
                    >
                      {/* Top Header: Symbol & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "font-extrabold text-xs tracking-wider uppercase px-2.5 py-0.5",
                                isGold
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
                                  : "bg-primary text-primary-foreground"
                              )}
                            >
                              {t.symbol}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] font-bold gap-1 uppercase px-2 py-0.5",
                                t.direction === "long"
                                  ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                                  : "text-rose-500 border-rose-500/30 bg-rose-500/10"
                              )}
                            >
                              {t.direction === "long" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {t.direction === "long" ? "BUY" : "SELL"}
                            </Badge>
                          </div>

                          {/* Status Badge */}
                          {t.status === "tp_hit" && (
                            <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase gap-1 px-2 py-0.5 shadow-xs">
                              <CheckCircle2 className="w-3 h-3" /> TP HIT
                            </Badge>
                          )}
                          {t.status === "sl_hit" && (
                            <Badge className="bg-rose-600 text-white font-black text-[10px] uppercase gap-1 px-2 py-0.5 shadow-xs">
                              <XCircle className="w-3 h-3" /> SL HIT
                            </Badge>
                          )}
                          {t.status === "open" && (
                            <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase gap-1 px-2 py-0.5 shadow-xs animate-pulse">
                              <Clock className="w-3 h-3" /> ACTIVE CALL
                            </Badge>
                          )}
                          {t.status === "breakeven" && (
                            <Badge variant="outline" className="text-muted-foreground text-[10px] font-bold uppercase">
                              BREAKEVEN
                            </Badge>
                          )}
                          {t.status === "closed" && (
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                              CLOSED
                            </Badge>
                          )}
                        </div>

                        {/* Trade Price Levels Grid */}
                        <div className="bg-muted/20 rounded-xl p-3.5 border border-border/40 font-mono space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-[11px] font-sans">Entry Price:</span>
                            <span className="font-bold text-foreground">{t.entryPrice}</span>
                          </div>

                          {t.exitPrice && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-[11px] font-sans">Exit Price:</span>
                              <span className={cn("font-bold", isWin ? "text-emerald-500" : isLoss ? "text-rose-500" : "text-foreground")}>
                                {t.exitPrice}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-rose-400">
                            <span className="text-muted-foreground text-[11px] font-sans">Stop Loss:</span>
                            <span>{t.stopLoss}</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-400">
                            <span className="text-muted-foreground text-[11px] font-sans">Take Profit:</span>
                            <span>{t.takeProfit}</span>
                          </div>
                        </div>

                        {/* Notes / Operator Context */}
                        {t.notes && (
                          <div className="text-xs text-muted-foreground italic bg-muted/10 p-2.5 rounded-lg border border-border/30">
                            &quot;{t.notes}&quot;
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Pips Callout & Actions */}
                      <div className="space-y-3 pt-3 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-[11px] text-muted-foreground font-sans">P&L Result:</span>
                            <span
                              className={cn(
                                "font-extrabold text-sm",
                                t.pnlPips > 0
                                  ? "text-emerald-500"
                                  : t.pnlPips < 0
                                  ? "text-rose-500"
                                  : "text-muted-foreground"
                              )}
                            >
                              {t.pnlPips > 0 ? `+${t.pnlPips} Pips` : `${t.pnlPips} Pips`}
                            </span>
                          </div>

                          <div className="text-[11px] text-muted-foreground font-mono">
                            1:{rrRatio} R:R
                          </div>
                        </div>

                        {/* Date & Admin Action Buttons */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                          <span>
                            {new Date(t.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 gap-1"
                                onClick={() => openUpdateModal(t)}
                              >
                                <Edit3 className="w-3 h-3 text-primary" /> Update
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[10px] px-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                onClick={() => handleDeleteTrade(t._id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Admin Dialog 1: Create Signal Call */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border-primary/25 text-foreground max-w-md rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Post Operator HQ Signal Call</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Publish an official trade signal callout to the Operator HQ channel feed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instrument</Label>
                <select
                  value={createForm.symbol}
                  onChange={(e) => setCreateForm({ ...createForm, symbol: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-muted/30 border border-primary/20 text-foreground text-sm font-medium"
                >
                  <option value="XAUUSD">XAUUSD (Gold)</option>
                  <option value="EURUSD">EURUSD</option>
                  <option value="GBPUSD">GBPUSD</option>
                  <option value="USDJPY">USDJPY</option>
                  <option value="BTCUSD">BTCUSD</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Direction</Label>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    type="button"
                    variant={createForm.direction === "long" ? "default" : "outline"}
                    className={cn(
                      "h-9 text-xs font-bold",
                      createForm.direction === "long" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                    )}
                    onClick={() => setCreateForm({ ...createForm, direction: "long" })}
                  >
                    BUY
                  </Button>
                  <Button
                    type="button"
                    variant={createForm.direction === "short" ? "default" : "outline"}
                    className={cn(
                      "h-9 text-xs font-bold",
                      createForm.direction === "short" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
                    )}
                    onClick={() => setCreateForm({ ...createForm, direction: "short" })}
                  >
                    SELL
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Entry Price</Label>
              <Input
                type="number"
                step="any"
                className="h-9 font-mono"
                value={createForm.entryPrice}
                onChange={(e) => setCreateForm({ ...createForm, entryPrice: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-rose-500">Stop Loss</Label>
                <Input
                  type="number"
                  step="any"
                  className="h-9 font-mono border-rose-500/30"
                  value={createForm.stopLoss}
                  onChange={(e) => setCreateForm({ ...createForm, stopLoss: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-emerald-500">Take Profit</Label>
                <Input
                  type="number"
                  step="any"
                  className="h-9 font-mono border-emerald-500/30"
                  value={createForm.takeProfit}
                  onChange={(e) => setCreateForm({ ...createForm, takeProfit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Status</Label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-muted/30 border border-primary/20 text-foreground text-sm font-medium"
              >
                <option value="open">Active Call (Open)</option>
                <option value="tp_hit">TP Hit (Win)</option>
                <option value="sl_hit">SL Hit (Loss)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Signal Notes / Reason</Label>
              <Textarea
                placeholder="e.g. Liquidity sweep on 15m timeframe + FVG retest"
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                className="text-xs bg-muted/20 min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-xs uppercase font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-gold-gradient text-background font-bold text-xs uppercase px-5">
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                Publish Signal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog 2: Update / Close Signal Call */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="bg-card border-primary/25 text-foreground max-w-md rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              Update Signal Call - {selectedTrade?.symbol}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update status, exit price, and outcome callout for this signal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Outcome Status</Label>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-primary/20 text-foreground text-sm font-medium"
              >
                <option value="tp_hit">TP Hit (WIN)</option>
                <option value="sl_hit">SL Hit (LOSS)</option>
                <option value="breakeven">Breakeven (0 Pips)</option>
                <option value="closed">Manually Closed</option>
                <option value="open">Active (Open)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exit Price</Label>
              <Input
                type="number"
                step="any"
                placeholder="Target Exit Price"
                className="h-10 font-mono"
                value={updateForm.exitPrice}
                onChange={(e) => setUpdateForm({ ...updateForm, exitPrice: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Update Notes / Comment</Label>
              <Textarea
                placeholder="e.g. Smashed TP1 & TP2 with +250 pips profit!"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                className="text-xs bg-muted/20 min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
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
