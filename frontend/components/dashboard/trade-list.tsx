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
import {
  Trash2,
  ExternalLink,
  History,
  ChevronDown,
  ChevronUp,
  LayoutList,
  Calendar,
  Target,
  Info,
  Download,
} from "lucide-react";
import { deleteTrade, updateTrade, getBrokerAccounts } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
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
  const [filterAccount, setFilterAccount] = useState<string>("ALL");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      const docs = await getBrokerAccounts("");
      setAccounts(docs);
    }
    loadAccounts();
  }, []);

  const symbols = Array.from(new Set(trades.map((t) => t.symbol))).sort();

  const filtered = trades.filter((t) => {
    const matchSymbol = filterSymbol === "ALL" || t.symbol === filterSymbol;
    const matchAccount =
      filterAccount === "ALL" ||
      (filterAccount === "none" && !t.broker_account_id) ||
      t.broker_account_id === filterAccount;
    return matchSymbol && matchAccount;
  });

  const openTrades = filtered.filter((t) => t.status === "open");
  const closedTrades = filtered.filter((t) => t.status === "closed");

  const hasMore = closedTrades.length > visibleCount;
  const displayedClosedTrades = closedTrades.slice(0, visibleCount);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade?")) return;

    setDeletingId(id);

    try {
      const { error } = await deleteTrade(id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to delete trade:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (closedTrades.length === 0) return;

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
    const rows = closedTrades.map((t) => [
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
    link.setAttribute("download", `closed_trades_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <Card className="border-border/50 bg-card/20 backdrop-blur-md overflow-hidden">
      <CardHeader className="border-b border-border/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Trade Ledger Console
            </CardTitle>
            <CardDescription className="text-[10px] uppercase text-muted-foreground">
              {filtered.length} total trades recorded in ledger
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48">
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger className="bg-secondary/50 border-primary/20 hover:border-primary/50 transition-all duration-200 text-xs h-9">
                  <SelectValue placeholder="Filter account" />
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
            <div className="w-44">
              <Select value={filterSymbol} onValueChange={setFilterSymbol}>
                <SelectTrigger className="bg-secondary/50 border-primary/20 hover:border-primary/50 transition-all duration-200 text-xs h-9">
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
        </div>
      </CardHeader>
      
      <CardContent className="p-0 space-y-8 pt-6">
        <div className="space-y-4 px-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <h4 className="text-xs font-black flex items-center gap-2 text-primary uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active Positions
            </h4>
            <Badge
              variant="outline"
              className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[9px] font-black"
            >
              {openTrades.length} OPEN
            </Badge>
          </div>

          {openTrades.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border/40 uppercase font-bold tracking-wider">
              No active positions currently open.
            </p>
          ) : (
            <div className="border border-border/40 rounded-xl overflow-hidden bg-neutral-950/20">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-neutral-900/30 text-[9px] uppercase font-black text-muted-foreground/60 border-b border-border/30">
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">Lots (Qty)</th>
                      <th className="py-3 px-4">Entry Price</th>
                      <th className="py-3 px-4">Stop Loss (SL)</th>
                      <th className="py-3 px-4">Take Profit (TP)</th>
                      <th className="py-3 px-4">Opened Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-xs font-semibold">
                    {openTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-neutral-900/10 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{trade.symbol}</span>
                            <Badge
                              className={cn(
                                "text-[8px] px-1 h-4 font-black uppercase border leading-none shrink-0",
                                trade.trade_type === "long" 
                                  ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" 
                                  : "bg-red-500/5 text-red-500 border-red-500/20"
                              )}
                            >
                              {trade.trade_type === "long" ? "LONG" : "SHORT"}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground/80">{trade.quantity}</td>
                        <td className="py-3 px-4 font-mono text-foreground/80">{trade.entry_price_text ?? trade.entry_price.toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground/80">{trade.stop_loss ? trade.stop_loss.toFixed(2) : "—"}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground/80">{trade.take_profit ? trade.take_profit.toFixed(2) : "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDate(trade.entry_date)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <CloseTradeButton trade={trade} onClosed={() => router.refresh()} />
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 px-6 pb-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <h4 className="text-xs font-black flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
              <History className="w-4 h-4 text-primary" />
              Settle Ledger History
            </h4>
            <div className="flex items-center gap-2">
              {closedTrades.length > 0 && (
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 bg-accent/20 border-primary/20 text-primary hover:border-primary/50 hover:bg-accent/40 text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              )}
              <Badge
                variant="outline"
                className="bg-secondary/30 px-3 py-0.5 text-[9px] font-black"
              >
                {closedTrades.length} CLOSED
              </Badge>
            </div>
          </div>

          {closedTrades.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border/40 uppercase font-bold tracking-wider">
              No historical trades recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="border border-border/40 rounded-xl overflow-hidden bg-neutral-950/20">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-neutral-900/30 text-[9px] uppercase font-black text-muted-foreground/60 border-b border-border/30">
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4">Lots (Qty)</th>
                        <th className="py-3 px-4">Entry</th>
                        <th className="py-3 px-4">Exit</th>
                        <th className="py-3 px-4">SL</th>
                        <th className="py-3 px-4">TP</th>
                        <th className="py-3 px-4">Opened</th>
                        <th className="py-3 px-4">Closed</th>
                        <th className="py-3 px-4">P&L ($)</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-xs font-semibold">
                      {displayedClosedTrades.map((trade) => (
                        <tr key={trade.id} className="hover:bg-neutral-900/10 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{trade.symbol}</span>
                              <Badge
                                className={cn(
                                  "text-[8px] px-1 h-4 font-black uppercase border leading-none shrink-0",
                                  trade.trade_type === "long" 
                                    ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" 
                                    : "bg-red-500/5 text-red-500 border-red-500/20"
                                )}
                              >
                                {trade.trade_type === "long" ? "LONG" : "SHORT"}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-foreground/80">{trade.quantity}</td>
                          <td className="py-3 px-4 font-mono text-foreground/80">{trade.entry_price_text ?? trade.entry_price.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono text-foreground/80">{trade.exit_price_text ?? (trade.exit_price ? trade.exit_price.toFixed(2) : "—")}</td>
                          <td className="py-3 px-4 font-mono text-muted-foreground/80">{trade.stop_loss ? trade.stop_loss.toFixed(2) : "—"}</td>
                          <td className="py-3 px-4 font-mono text-muted-foreground/80">{trade.take_profit ? trade.take_profit.toFixed(2) : "—"}</td>
                          <td className="py-3 px-4 text-muted-foreground/75 font-mono">{formatDate(trade.entry_date)}</td>
                          <td className="py-3 px-4 text-muted-foreground/75 font-mono">{trade.exit_date ? formatDate(trade.exit_date) : "—"}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-0.5 font-mono">
                              <span className={cn("font-bold", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-destructive")}>
                                {(trade.pnl || 0) >= 0 ? "+" : ""}{trade.pnl ? formatCurrency(trade.pnl) : "—"}
                              </span>
                              {trade.pnl_percentage && (
                                <span className={cn("text-[9px] font-semibold opacity-85", (trade.pnl_percentage || 0) >= 0 ? "text-emerald-500/90" : "text-destructive/90")}>
                                  {(trade.pnl_percentage || 0) >= 0 ? "+" : ""}{trade.pnl_percentage.toFixed(2)}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {trade.screenshot_url && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  asChild
                                  title="View Screenshot"
                                >
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                {hasMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 py-5 text-xs uppercase font-bold tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 mt-2 border border-dashed border-border/60 transition-all rounded-xl"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                  >
                    View More History
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                )}
                {visibleCount > 10 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "py-5 text-xs uppercase font-bold tracking-wider text-muted-foreground hover:text-destructive/80 hover:bg-destructive/5 mt-2 border border-dashed border-border/60 transition-all rounded-xl",
                      !hasMore ? "w-full" : "w-40"
                    )}
                    onClick={() => setVisibleCount(10)}
                  >
                    Collapse
                    <ChevronUp className="ml-2 w-4 h-4" />
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
  const today = new Date().toISOString().split("T")[0];
  const [open, setOpen] = useState(false);
  const [exitPrice, setExitPrice] = useState<string>("");
  const [exitDate, setExitDate] = useState<string>(today);
  const [saving, setSaving] = useState(false);

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

      const { error } = await updateTrade(trade.id, {
        status: "closed",
        exit_price_text: exitPrice,
        exit_price: Number.parseFloat(exitPrice),
        exit_date: exitDate || null,
        pnl,
        pnl_percentage: pnlPct,
      });

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
