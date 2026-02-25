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
import { Trash2, ExternalLink, History, ChevronDown, ChevronUp, LayoutList, Calendar, Target, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computePnlUSD } from "@/lib/pnl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface TradeListProps {
  trades: Trade[];
}

export function TradeList({ trades }: TradeListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterSymbol, setFilterSymbol] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState(4);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  const symbols = Array.from(new Set(trades.map((t) => t.symbol))).sort();

  const filtered =
    filterSymbol === "ALL"
      ? trades
      : trades.filter((t) => t.symbol === filterSymbol);
  
  const openTrades = filtered.filter((t) => t.status === "open");
  const closedTrades = filtered.filter((t) => t.status === "closed");
  
  const hasMore = closedTrades.length > visibleCount;
  const displayedClosedTrades = closedTrades.slice(0, visibleCount);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade?")) return;

    setDeletingId(id);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to delete trade:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 8,
    }).format(value);
  };

  if (trades.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>
            Your recorded trades will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No trades recorded yet. Add your first trade to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>{filtered.length} trades shown</CardDescription>
          </div>
          <div className="w-56">
            <Select value={filterSymbol} onValueChange={setFilterSymbol}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Filter symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Symbols</SelectItem>
                {symbols.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Open Trades
            </h4>
            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20">{openTrades.length}</Badge>
          </div>
          
          {openTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center italic">No active trades currently open.</p>
          ) : (
            <div className="space-y-3">
              {openTrades.map((trade) => (
                <div
                  key={trade.id}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
                    expandedTradeId === trade.id 
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-sm" 
                      : "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                  }`}
                  onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base tracking-tight">{trade.symbol}</span>
                      <Badge
                        variant={trade.trade_type === "long" ? "default" : "secondary"}
                        className="text-[11px] px-2 h-5 uppercase font-bold"
                      >
                        {trade.trade_type}
                      </Badge>
                      {trade.broker_account_id && (
                        <Badge variant="outline" className="text-[10px] h-4.5 border-emerald-500/30 text-emerald-500 font-semibold px-2">
                          SYNCED
                        </Badge>
                      )}
                      {expandedTradeId === trade.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground/60 transition-transform" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:text-muted-foreground/60" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <CloseTradeButton trade={trade} onClosed={() => router.refresh()} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(trade.id)}
                        disabled={deletingId === trade.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none uppercase font-bold tracking-wider opacity-80">Entry Price</p>
                      <p className="text-sm font-bold font-mono text-foreground">
                        {trade.entry_price_text ?? trade.entry_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none uppercase font-bold tracking-wider opacity-80">Quantity</p>
                      <p className="text-sm font-bold font-mono text-foreground">
                        {trade.quantity}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none uppercase font-bold tracking-wider opacity-80">Entered On</p>
                      <p className="text-[12px] font-bold text-muted-foreground font-mono">
                        {formatDate(trade.entry_date)}
                      </p>
                    </div>
                  </div>

                  {expandedTradeId === trade.id && (
                    <div className="mt-5 pt-4 border-t border-emerald-500/20 animate-in fade-in slide-in-from-top-3 duration-300">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="bg-background/40 p-3 rounded-xl border border-border/30 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-2 tracking-widest">
                            <Target className="w-3 h-3" /> Management
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Status</span>
                              <span className="font-mono text-emerald-500 font-bold uppercase tracking-tight">{trade.status}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Stop Loss</span>
                              <span className="font-mono font-bold">{trade.stop_loss ? trade.stop_loss.toFixed(2) : "No SL Entry"}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Take Profit</span>
                              <span className="font-mono font-bold">{trade.take_profit ? trade.take_profit.toFixed(2) : "No TP Entry"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/40 p-3 rounded-xl border border-border/30 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-2 tracking-widest">
                            <Info className="w-3 h-3" /> Source
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Strategy</span>
                              <span className="truncate max-w-25 text-right font-bold" title={trade.strategy_name || "Manual"}>
                                {trade.strategy_name || "Manual"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Connection</span>
                              <span className="text-right font-bold">{trade.broker_account_id ? "MT5/Exness Sync" : "Manual Log"}</span>
                            </div>
                            {trade.notes && (
                              <div className="mt-2 pt-2 border-t border-border/20 text-xs italic text-muted-foreground/80 leading-relaxed font-serif">
                                &quot;{trade.notes}&quot;
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 mt-10">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight">
              <History className="w-5 h-5 text-muted-foreground/60" />
              Trade Performance History
            </h4>
            <Badge variant="outline" className="bg-secondary/30 px-3 py-1 text-sm">{closedTrades.length}</Badge>
          </div>
          
          {closedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center bg-secondary/10 rounded-xl border border-dashed border-border/50">
              Your historical data will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {displayedClosedTrades.map((trade) => (
                <div
                  key={trade.id}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                    expandedTradeId === trade.id 
                      ? "border-primary/50 bg-primary/10 shadow-md ring-1 ring-primary/20" 
                      : "border-border/40 bg-card/30 hover:bg-card/60 hover:shadow-sm"
                  }`}
                  onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base tracking-tight">{trade.symbol}</span>
                      <Badge
                        variant={trade.trade_type === "long" ? "default" : "secondary"}
                        className="text-[11px] px-2 h-5 uppercase font-bold"
                      >
                        {trade.trade_type}
                      </Badge>
                      {trade.broker_account_id && (
                        <Badge variant="outline" className="text-[10px] h-4.5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 px-2 font-bold">
                          SYNCED
                        </Badge>
                      )}
                      {expandedTradeId === trade.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground/60 transition-transform" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:text-muted-foreground/60" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                      {trade.screenshot_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View Screenshot">
                          <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(trade.id)}
                        disabled={deletingId === trade.id}
                        title="Delete Trade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none font-bold uppercase tracking-wider opacity-60">P&L</p>
                      <p className={`text-sm font-bold font-mono ${trade.pnl && trade.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        {trade.pnl ? formatCurrency(trade.pnl) : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none font-bold uppercase tracking-wider opacity-60">Return</p>
                      <p className={`text-sm font-bold font-mono ${(trade.pnl_percentage || 0) >= 0 ? "text-profit/90" : "text-loss/90"}`}>
                        {trade.pnl_percentage ? `${trade.pnl_percentage.toFixed(2)}%` : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none font-bold uppercase tracking-wider opacity-60">Entry</p>
                      <p className="text-sm font-bold font-mono text-foreground/80">
                        {trade.entry_price_text ?? (trade.entry_price ? trade.entry_price.toFixed(2) : "—")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none font-bold uppercase tracking-wider opacity-60">Exit</p>
                      <p className="text-sm font-bold font-mono text-foreground/80">
                        {trade.exit_price_text ?? (trade.exit_price ? trade.exit_price.toFixed(2) : "—")}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[11px] text-muted-foreground leading-none font-bold uppercase tracking-wider opacity-60">Closed On</p>
                      <p className="text-[11px] font-bold text-muted-foreground font-mono">
                        {trade.exit_date ? formatDate(trade.exit_date) : "—"}
                      </p>
                    </div>
                  </div>

                  {expandedTradeId === trade.id && (
                    <div className="mt-5 pt-4 border-t border-border/20 animate-in fade-in slide-in-from-top-3 duration-300">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-background/20 p-3 rounded-xl border border-border/20 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-2">
                             Execution Log
                          </p>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Entry</span>
                              <span className="font-mono font-bold text-foreground/90">{trade.entry_price_text ?? (trade.entry_price ? trade.entry_price.toFixed(2) : "—")}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Exit</span>
                              <span className="font-mono font-bold text-foreground/90">{trade.exit_price_text ?? (trade.exit_price ? trade.exit_price.toFixed(2) : "—")}</span>
                            </div>
                            <div className="flex justify-between text-xs mt-1 pt-1 border-t border-border/10">
                              <span className="text-muted-foreground">Entry Date</span>
                              <span className="font-mono font-bold">{formatDate(trade.entry_date)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Exit Date</span>
                              <span className="font-mono font-bold">{trade.exit_date ? formatDate(trade.exit_date) : "—"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/20 p-3 rounded-xl border border-border/20 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-2">
                             Position Data
                          </p>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Volume/Lots</span>
                              <span className="font-mono font-bold">{trade.quantity}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Order Type</span>
                              <span className="uppercase font-bold text-[10px] bg-secondary/50 px-2 py-0.5 rounded tracking-widest">{trade.trade_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/20 p-3 rounded-xl border border-border/20 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-2">
                             Profit Metrics
                          </p>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Final P&L</span>
                              <span className={`font-mono font-bold ${trade.pnl && trade.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                                {trade.pnl ? formatCurrency(trade.pnl) : "—"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">ROI (%)</span>
                              <span className={`font-mono font-bold ${trade.pnl_percentage && trade.pnl_percentage >= 0 ? "text-profit/90" : "text-loss/90"}`}>
                                {trade.pnl_percentage ? `${trade.pnl_percentage.toFixed(2)}%` : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {trade.notes && (
                        <div className="bg-secondary/20 p-3 rounded-xl text-xs text-muted-foreground leading-relaxed">
                          <p className="font-bold text-[10px] uppercase mb-1 tracking-widest text-foreground/70">Execution Notes</p>
                          &quot;{trade.notes}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex gap-4 pt-2">
                {hasMore && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 py-6 text-xs uppercase font-bold tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 mt-2 border border-dashed border-border/60 transition-all"
                    onClick={() => setVisibleCount(prev => prev + 4)}
                  >
                    View More History
                    <ChevronDown className="ml-2 w-5 h-5" />
                  </Button>
                )}
                {visibleCount > 4 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`${!hasMore ? "w-full" : "w-40"} py-6 text-xs uppercase font-bold tracking-wider text-muted-foreground hover:text-destructive/80 hover:bg-destructive/5 mt-2 border border-dashed border-border/60 transition-all`}
                    onClick={() => setVisibleCount(4)}
                  >
                    Collapse
                    <ChevronUp className="ml-2 w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CloseTradeButton({
  trade,
  onClosed,
}: {
  trade: Trade;
  onClosed: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [exitPrice, setExitPrice] = useState<string>("");
  const [exitDate, setExitDate] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const handleClose = async () => {
    setSaving(true);
    try {
      const { pnl, pnlPct } = computePnlUSD({
        symbol: trade.symbol,
        entryPrice: (trade.entry_price_text ?? trade.entry_price) as any,
        exitPrice: exitPrice,
        quantity: trade.quantity,
        tradeType: (trade.trade_type as "long" | "short") || "long",
      });

      const { error } = await supabase
        .from("trades")
        .update({
          status: "closed",
          exit_price_text: exitPrice,
          exit_price: Number.parseFloat(exitPrice),
          exit_date: exitDate || null,
          pnl,
          pnl_percentage: pnlPct,
        })
        .eq("id", trade.id);

      if (error) throw error;
      setOpen(false);
      onClosed();
    } catch (e) {
      console.error("[v0] close-trade error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Close Trade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Trade - {trade.symbol}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="exit_price">Exit Price</Label>
            <Input
              id="exit_price"
              type="number"
              inputMode="decimal"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exit_date">Exit Date</Label>
            <Input
              id="exit_date"
              type="date"
              max={today}
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleClose} disabled={saving || !exitPrice}>
            Confirm Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
