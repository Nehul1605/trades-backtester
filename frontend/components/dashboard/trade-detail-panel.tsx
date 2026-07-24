"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  ExternalLink,
  Edit2,
  Save,
  X,
  Upload,
  Loader2,
  Trash2,
} from "lucide-react";
import { updateTrade, uploadTradeScreenshot, deleteTrade } from "@/lib/actions";
import { computePnlUSD, TradeType } from "@/lib/pnl";
import { cn, getLocalDateString } from "@/lib/utils";

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

interface TradeDetailPanelProps {
  trade: Trade;
  onUpdate: () => void;
  colSpan: number;
}

export function TradeDetailPanel({ trade, onUpdate, colSpan }: TradeDetailPanelProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit fields state
  const [editSymbol, setEditSymbol] = useState(trade.symbol);
  const [editQuantity, setEditQuantity] = useState(trade.quantity.toString());
  const [editTradeType, setEditTradeType] = useState(trade.trade_type);
  const [editStatus, setEditStatus] = useState(trade.status);
  const [editEntryPrice, setEditEntryPrice] = useState(
    trade.entry_price_text || trade.entry_price.toString()
  );
  const [editExitPrice, setEditExitPrice] = useState(
    trade.exit_price_text || (trade.exit_price ? trade.exit_price.toString() : "")
  );
  const [editStopLoss, setEditStopLoss] = useState(
    trade.stop_loss ? trade.stop_loss.toString() : ""
  );
  const [editTakeProfit, setEditTakeProfit] = useState(
    trade.take_profit ? trade.take_profit.toString() : ""
  );

  const formatInitialDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "" : getLocalDateString(d);
    } catch {
      return "";
    }
  };

  const [editEntryDate, setEditEntryDate] = useState(formatInitialDate(trade.entry_date));
  const [editExitDate, setEditExitDate] = useState(formatInitialDate(trade.exit_date));
  const [editStrategyName, setEditStrategyName] = useState(trade.strategy_name || "");
  const [editNotes, setEditNotes] = useState(trade.notes || "");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  // Handle status toggle adjustments
  useEffect(() => {
    if (editStatus === "open") {
      setEditExitPrice("");
      setEditExitDate("");
    } else if (editStatus === "closed" && !editExitDate) {
      setEditExitDate(getLocalDateString(new Date()));
    }
  }, [editStatus]);

  const handleCancel = () => {
    // Reset fields back to initial values
    setEditSymbol(trade.symbol);
    setEditQuantity(trade.quantity.toString());
    setEditTradeType(trade.trade_type);
    setEditStatus(trade.status);
    setEditEntryPrice(trade.entry_price_text || trade.entry_price.toString());
    setEditExitPrice(trade.exit_price_text || (trade.exit_price ? trade.exit_price.toString() : ""));
    setEditStopLoss(trade.stop_loss ? trade.stop_loss.toString() : "");
    setEditTakeProfit(trade.take_profit ? trade.take_profit.toString() : "");
    setEditEntryDate(formatInitialDate(trade.entry_date));
    setEditExitDate(formatInitialDate(trade.exit_date));
    setEditStrategyName(trade.strategy_name || "");
    setEditNotes(trade.notes || "");
    setScreenshotFile(null);
    setIsEditing(false);
  };

  const handleDeleteTrade = async () => {
    if (!confirm("Are you sure you want to delete this trade?")) return;
    setDeleting(true);
    try {
      const { error } = await deleteTrade(trade.id);
      if (error) throw new Error(error);
      onUpdate();
      router.refresh();
    } catch (err: any) {
      alert("Failed to delete trade: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!editSymbol || !editQuantity || !editEntryPrice) {
      alert("Please fill out Symbol, Volume/Quantity, and Entry Price.");
      return;
    }

    setSaving(true);
    try {
      // 1. Calculate P&L if closed
      let pnl = null;
      let pnlPercentage = null;

      if (editStatus === "closed" && editExitPrice) {
        const { pnl: calcPnl, pnlPct } = computePnlUSD({
          symbol: editSymbol,
          entryPrice: Number.parseFloat(editEntryPrice),
          exitPrice: Number.parseFloat(editExitPrice),
          quantity: Number.parseFloat(editQuantity),
          tradeType: editTradeType as "long" | "short",
        });
        pnl = calcPnl;
        pnlPercentage = pnlPct;
      }

      // 2. Upload screenshot if selected
      let finalScreenshotUrl = trade.screenshot_url;
      if (screenshotFile) {
        const fd = new FormData();
        fd.append("file", screenshotFile);
        fd.append("userId", ""); // Handled automatically by token backend
        const uploadedUrl = await uploadTradeScreenshot(fd);
        if (uploadedUrl) {
          finalScreenshotUrl = uploadedUrl;
        }
      }

      // 3. Helper to format date pickers back to timestamp
      const toTimestamp = (dateStr: string): string | null => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split("-").map(Number);
        const now = new Date();
        return new Date(
          y,
          m - 1,
          d,
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        ).toISOString();
      };

      const updateData: Record<string, any> = {
        symbol: editSymbol.toUpperCase(),
        quantity: Number.parseFloat(editQuantity),
        trade_type: editTradeType,
        status: editStatus,
        entry_price: Number.parseFloat(editEntryPrice),
        entry_price_text: editEntryPrice,
        exit_price: editStatus === "closed" && editExitPrice ? Number.parseFloat(editExitPrice) : null,
        exit_price_text: editStatus === "closed" ? editExitPrice : null,
        stop_loss: editStopLoss ? Number.parseFloat(editStopLoss) : null,
        take_profit: editTakeProfit ? Number.parseFloat(editTakeProfit) : null,
        entry_date: toTimestamp(editEntryDate)!,
        exit_date: editStatus === "closed" && editExitDate ? toTimestamp(editExitDate) : null,
        strategy_name: editStrategyName || null,
        notes: editNotes || null,
        screenshot_url: finalScreenshotUrl,
        pnl,
        pnl_percentage: pnlPercentage,
      };

      const { error } = await updateTrade(trade.id, updateData);
      if (error) throw new Error(error);

      setIsEditing(false);
      onUpdate();
      router.refresh();
    } catch (err: any) {
      alert("Failed to update trade: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="bg-neutral-900/40 border-b border-border/20">
      <td colSpan={colSpan} className="p-0" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          /* EDIT COCKPIT LAYOUT */
          <div className="p-4 md:p-6 bg-neutral-950/65 border-t border-border/10 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                <h5 className="text-[11px] uppercase font-black tracking-widest text-primary">
                  Modify Transaction parameters
                </h5>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCancel}
                  className="text-[10px] font-black uppercase h-8 cursor-pointer"
                  disabled={saving}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="xs"
                  onClick={handleSave}
                  className="text-[10px] font-black uppercase h-8 bg-gold-gradient text-background cursor-pointer"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1" />
                  )}
                  {saving ? "Saving..." : "Commit Update"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4 text-xs font-semibold">
              {/* Asset & Quantity Grid */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Symbol</Label>
                <Input
                  value={editSymbol}
                  onChange={(e) => setEditSymbol(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs h-9 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Lots (Qty)</Label>
                <Input
                  type="number"
                  step="any"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs h-9 rounded-lg"
                />
              </div>

              {/* Side & Status Selector */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Order Side</Label>
                <Select value={editTradeType} onValueChange={setEditTradeType}>
                  <SelectTrigger className="border-primary/20 hover:border-primary/40 bg-muted/10 text-xs h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">LONG (Buy)</SelectItem>
                    <SelectItem value="short">SHORT (Sell)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="border-primary/20 hover:border-primary/40 bg-muted/10 text-xs h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">ACTIVE / OPEN</SelectItem>
                    <SelectItem value="closed">SETTLED / CLOSED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entry & Exit Prices */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Entry Price</Label>
                <Input
                  type="number"
                  step="any"
                  value={editEntryPrice}
                  onChange={(e) => setEditEntryPrice(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs h-9 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Exit Price</Label>
                <Input
                  type="number"
                  step="any"
                  disabled={editStatus === "open"}
                  value={editExitPrice}
                  onChange={(e) => setEditExitPrice(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs h-9 rounded-lg disabled:opacity-50"
                  placeholder={editStatus === "open" ? "Unavailable" : "Exit Price..."}
                />
              </div>

              {/* SL & TP */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Stop Loss (SL)</Label>
                <Input
                  type="number"
                  step="any"
                  value={editStopLoss}
                  onChange={(e) => setEditStopLoss(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs h-9 rounded-lg"
                  placeholder="No Stop Loss"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Take Profit (TP)</Label>
                <Input
                  type="number"
                  step="any"
                  value={editTakeProfit}
                  onChange={(e) => setEditTakeProfit(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs h-9 rounded-lg"
                  placeholder="No Take Profit"
                />
              </div>

              {/* Dates & Strategy */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Opened Date</Label>
                <Input
                  type="date"
                  value={editEntryDate}
                  onChange={(e) => setEditEntryDate(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 text-xs h-9 rounded-lg [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Closed Date</Label>
                <Input
                  type="date"
                  disabled={editStatus === "open"}
                  value={editExitDate}
                  onChange={(e) => setEditExitDate(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 text-xs h-9 rounded-lg disabled:opacity-50 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Strategy Tag</Label>
                <Input
                  value={editStrategyName}
                  onChange={(e) => setEditStrategyName(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs h-9 rounded-lg"
                  placeholder="e.g. Trendline bounce"
                />
              </div>
            </div>

            {/* Notes & Screenshot */}
            <div className="grid gap-4 md:grid-cols-3 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Journal Confluence Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="bg-muted/10 border-primary/20 hover:border-primary/40 focus:border-primary text-xs rounded-lg min-h-[90px]"
                  placeholder="Psychology state, confluence signals..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/95">Screenshot Attachment</Label>
                <div className="flex flex-col gap-2 items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/35 rounded-xl p-3 bg-neutral-900/20 text-center min-h-[90px]">
                  <Upload className="w-4.5 h-4.5 text-primary/75" />
                  <span className="text-[9px] uppercase font-black text-muted-foreground">
                    {screenshotFile ? screenshotFile.name : "Attach graphics"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setScreenshotFile(file);
                      }
                    }}
                    className="hidden"
                    id={`screenshot-edit-${trade.id}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => document.getElementById(`screenshot-edit-${trade.id}`)?.click()}
                    className="text-[8px] tracking-widest font-black uppercase h-6 border-primary/20 text-primary hover:bg-primary/5 cursor-pointer"
                  >
                    Select File
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PREMIUM READ ONLY LAYOUT */
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-neutral-950/45 border-t border-border/10 animate-in fade-in duration-200">
            {/* Strategy Column */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-primary">
                Strategy Reference
              </h5>
              <div className="bg-secondary/20 rounded-xl p-3.5 border border-primary/10 min-h-[85px] flex flex-col justify-center relative">
                {trade.strategy_name ? (
                  <div>
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black tracking-wider uppercase py-0.5 px-2"
                    >
                      {trade.strategy_name}
                    </Badge>
                    <p className="text-[9px] text-muted-foreground/80 mt-2 uppercase font-black tracking-widest">
                      Active Strategy Model
                    </p>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic font-medium">
                    No strategy tag provided for this trade.
                  </span>
                )}
              </div>
            </div>

            {/* Notes Column */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-primary">
                Journal Confluence Notes
              </h5>
              <div className="bg-secondary/20 rounded-xl p-3.5 border border-primary/10 min-h-[85px] text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap font-semibold font-sans">
                {trade.notes ? (
                  trade.notes
                ) : (
                  <span className="text-muted-foreground italic font-medium">
                    No journal notes recorded.
                  </span>
                )}
              </div>
            </div>

            {/* Screenshot Column */}
            <div className="space-y-2.5 relative">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-primary">
                Execution Screenshot
              </h5>
              <div className="bg-secondary/20 rounded-xl p-3.5 border border-primary/10 min-h-[85px] flex items-center justify-center overflow-hidden">
                {trade.screenshot_url ? (
                  <div className="relative group overflow-hidden rounded-lg border border-border/50 max-h-48 w-full flex items-center justify-center bg-black/40">
                    <img
                      src={trade.screenshot_url}
                      alt={`${trade.symbol} Chart`}
                      className="max-h-40 object-contain rounded transition-transform duration-300 group-hover:scale-105"
                    />
                    <a
                      href={trade.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full Image
                    </a>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic font-medium">
                    No execution screenshot uploaded.
                  </span>
                )}
              </div>

              {/* Action Buttons Panel */}
              <div className="absolute bottom-[-16px] right-0 flex items-center gap-2 mt-4">
                <Button
                  size="xs"
                  onClick={() => setIsEditing(true)}
                  className="h-7 text-[9px] uppercase font-black tracking-wider bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Entry
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={handleDeleteTrade}
                  disabled={deleting}
                  className="h-7 text-[9px] uppercase font-black tracking-wider border border-destructive/20 transition-all rounded-md flex items-center gap-1 cursor-pointer"
                >
                  {deleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
