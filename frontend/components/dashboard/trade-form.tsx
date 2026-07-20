"use client";

import type React from "react";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SymbolCombobox, {
  type SymbolOption,
} from "@/components/inputs/symbol-combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTrade, uploadTradeScreenshot, getBrokerAccounts } from "@/lib/appwrite/actions";
import { computePnlUSD } from "@/lib/pnl";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TradeFormProps {
  userId: string;
  defaultAccountId?: string;
  onSuccess?: () => void;
}

const SYMBOL_OPTIONS: SymbolOption[] = [
  { value: "ETHUSD", label: "ETHUSD" },
  { value: "BTCUSD", label: "BTCUSD" },
  { value: "APPLE", label: "APPLE" },
  { value: "XAUUSD", label: "XAUUSD (Gold)" },
  { value: "XAGUSD", label: "XAGUSD (Silver)" },
  { value: "DE30", label: "DE30" },
  { value: "USTECH", label: "USTECH" },
  { value: "US30", label: "US30" },
  { value: "EURUSD", label: "EURUSD" },
  { value: "GBPUSD", label: "GBPUSD" },
  { value: "USDJPY", label: "USDJPY" },
  { value: "DXY", label: "DXY" },
  { value: "USOIL", label: "USOIL" },
];

function compressImage(file: File, quality = 0.7): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        } else {
          resolve(file);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function TradeForm({ userId, defaultAccountId, onSuccess }: TradeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [withSL, setWithSL] = useState(false);
  const [withTP, setWithTP] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }, []);

  const [accounts, setAccounts] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchAccounts() {
      if (!defaultAccountId) {
        const docs = await getBrokerAccounts(userId);
        setAccounts(docs);
      }
    }
    fetchAccounts();
  }, [userId, defaultAccountId]);

  const [formData, setFormData] = useState({
    symbol: "",
    entry_price: "",
    exit_price: "",
    quantity: "",
    trade_type: "long",
    entry_date: today,
    exit_date: "",
    status: "open",
    strategy_name: "",
    notes: "",
    stop_loss: "",
    take_profit: "",
    broker_account_id: defaultAccountId || "",
  });

  useEffect(() => {
    if (formData.status === "open") {
      setFormData((prev) => ({ ...prev, exit_price: "", exit_date: "" }));
    } else if (formData.status === "closed" && !formData.exit_date) {
      setFormData((prev) => ({
        ...prev,
        exit_date: today,
      }));
    }
  }, [formData.status, today]);

  // Live Risk-to-Reward Ratio (R:R) Calculation & Projections Engine
  const liveCalculation = useMemo(() => {
    const entry = Number.parseFloat(formData.entry_price);
    const sl = withSL ? Number.parseFloat(formData.stop_loss) : NaN;
    const tp = withTP ? Number.parseFloat(formData.take_profit) : NaN;
    const qty = Number.parseFloat(formData.quantity);

    if (isNaN(entry) || isNaN(qty) || qty <= 0) return null;

    let riskUsd = 0;
    let rewardUsd = 0;
    let rrRatio = "N/A";
    let isSLValid = true;
    let isTPValid = true;

    // Calculate Risk
    if (!isNaN(sl)) {
      if (formData.trade_type === "long") {
        isSLValid = sl < entry;
        riskUsd = (entry - sl) * qty;
      } else {
        isSLValid = sl > entry;
        riskUsd = (sl - entry) * qty;
      }
    }

    // Calculate Reward
    if (!isNaN(tp)) {
      if (formData.trade_type === "long") {
        isTPValid = tp > entry;
        rewardUsd = (tp - entry) * qty;
      } else {
        isTPValid = tp < entry;
        rewardUsd = (entry - tp) * qty;
      }
    }

    // Calculate Ratio
    if (!isNaN(sl) && !isNaN(tp) && isSLValid && isTPValid && riskUsd > 0) {
      rrRatio = `1 : ${(rewardUsd / riskUsd).toFixed(2)}`;
    }

    return {
      risk: isSLValid && !isNaN(sl) ? `$${riskUsd.toFixed(2)}` : "—",
      reward: isTPValid && !isNaN(tp) ? `$${rewardUsd.toFixed(2)}` : "—",
      ratio: rrRatio,
      isValid: isSLValid && isTPValid,
    };
  }, [formData.entry_price, formData.stop_loss, formData.take_profit, formData.quantity, formData.trade_type, withSL, withTP]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.entry_price || !formData.quantity) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out Symbol, Quantity, and Entry Price.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate P&L if trade is closed
      let pnl = null;
      let pnl_percentage = null;

      if (formData.status === "closed" && formData.exit_price) {
        const { pnl: calcPnl, pnlPct } = computePnlUSD({
          symbol: formData.symbol,
          entryPrice: Number.parseFloat(formData.entry_price),
          exitPrice: Number.parseFloat(formData.exit_price),
          quantity: Number.parseFloat(formData.quantity),
          tradeType: formData.trade_type as "long" | "short",
        });
        pnl = calcPnl;
        pnl_percentage = pnlPct;
      }

      // Upload screenshot if provided
      let screenshot_url = null;
      if (screenshot) {
        const fd = new FormData();
        fd.append("file", screenshot);
        fd.append("userId", userId);
        screenshot_url = await uploadTradeScreenshot(fd);
      }

      // Store full ISO timestamp
      const toTimestamp = (dateStr: string): string | null => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split("-").map(Number);
        const now = new Date();
        return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
      };

      const result = await createTrade({
        user_id: userId,
        symbol: formData.symbol.toUpperCase(),
        entry_price_text: formData.entry_price,
        exit_price_text: formData.exit_price || null,
        entry_price: Number.parseFloat(formData.entry_price),
        exit_price: formData.exit_price ? Number.parseFloat(formData.exit_price) : null,
        quantity: Number.parseFloat(formData.quantity),
        trade_type: formData.trade_type,
        entry_date: toTimestamp(formData.entry_date)!,
        exit_date: toTimestamp(formData.exit_date),
        status: formData.status,
        strategy_name: formData.strategy_name || null,
        notes: formData.notes || null,
        screenshot_url,
        pnl,
        pnl_percentage,
        stop_loss: formData.stop_loss ? Number.parseFloat(formData.stop_loss) : null,
        take_profit: formData.take_profit ? Number.parseFloat(formData.take_profit) : null,
        broker_account_id: formData.broker_account_id || null,
      });

      if (result.error) throw new Error(result.error);

      setIsSuccess(true);
      toast({
        title: "Trade Logged",
        description: `Logged ${formData.symbol.toUpperCase()} trade successfully!`,
      });

      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to log trade.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Dynamic Terminal Input Fields Form */}
      <Card className="lg:col-span-2 bg-card/20 border-border/40 backdrop-blur-md">
        <CardHeader className="border-b border-border/20 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Execution Terminal
          </CardTitle>
          <CardDescription className="text-[10px] uppercase text-muted-foreground">
            Configure simulated order properties for ledger storage
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symbol & Account Setup Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Symbol</Label>
                <SymbolCombobox
                  value={formData.symbol}
                  onChange={(val: string) => setFormData({ ...formData, symbol: val })}
                  options={SYMBOL_OPTIONS}
                  placeholder="Select Asset Symbol..."
                  className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                />
              </div>

              {!defaultAccountId && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Broker Account</Label>
                  <Select
                    value={formData.broker_account_id}
                    onValueChange={(val) => setFormData({ ...formData, broker_account_id: val })}
                  >
                    <SelectTrigger className="border-primary/10 hover:border-primary/30 text-xs h-9 rounded-lg bg-muted/10">
                      <SelectValue placeholder="Select broker account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.broker_type.toUpperCase()} - {acc.account_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Segment switches for Side (Buy vs Sell) & Status (Open vs Closed) */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Buy vs Sell segmented trigger bar */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Side</Label>
                <div className="relative flex p-0.5 bg-neutral-900/50 border border-border/40 rounded-xl select-none h-9">
                  {/* Sliding Indicator */}
                  <motion.div
                    className={cn(
                      "absolute top-0.5 bottom-0.5 rounded-lg shadow-sm",
                      formData.trade_type === "long" ? "bg-emerald-600" : "bg-red-600"
                    )}
                    initial={false}
                    animate={{
                      left: formData.trade_type === "long" ? "2px" : "50%",
                      right: formData.trade_type === "long" ? "50%" : "2px",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, trade_type: "long" })}
                    className={cn(
                      "flex-grow relative z-10 text-[9px] font-black uppercase tracking-widest text-center transition-colors rounded-lg",
                      formData.trade_type === "long" ? "text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Buy (Long)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, trade_type: "short" })}
                    className={cn(
                      "flex-grow relative z-10 text-[9px] font-black uppercase tracking-widest text-center transition-colors rounded-lg",
                      formData.trade_type === "short" ? "text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sell (Short)
                  </button>
                </div>
              </div>

              {/* Open vs Closed segmented trigger bar */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Status</Label>
                <div className="relative flex p-0.5 bg-neutral-900/50 border border-border/40 rounded-xl select-none h-9">
                  {/* Sliding Indicator */}
                  <motion.div
                    className="absolute top-0.5 bottom-0.5 rounded-lg bg-primary shadow-sm"
                    initial={false}
                    animate={{
                      left: formData.status === "open" ? "2px" : "50%",
                      right: formData.status === "open" ? "50%" : "2px",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "open" })}
                    className={cn(
                      "flex-grow relative z-10 text-[9px] font-black uppercase tracking-widest text-center transition-colors rounded-lg",
                      formData.status === "open" ? "text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Active / Open
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "closed" })}
                    className={cn(
                      "flex-grow relative z-10 text-[9px] font-black uppercase tracking-widest text-center transition-colors rounded-lg",
                      formData.status === "closed" ? "text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Settled / Closed
                  </button>
                </div>
              </div>
            </div>

            {/* Entry, Quantity, and Exit Fields */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="quantity" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lot size / Volume</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g. 1.00"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="entry_price" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Entry Price</Label>
                <Input
                  id="entry_price"
                  type="number"
                  placeholder="e.g. 1.1040"
                  step="any"
                  value={formData.entry_price}
                  onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                  className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="exit_price" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exit Price</Label>
                <Input
                  id="exit_price"
                  type="number"
                  placeholder={formData.status === "open" ? "Unavailable (Open Trade)" : "e.g. 1.1120"}
                  step="any"
                  disabled={formData.status === "open"}
                  value={formData.exit_price}
                  onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
                  className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg disabled:opacity-50"
                />
              </div>
            </div>

            {/* SL & TP Collapsible Switches */}
            <div className="grid gap-6 border-y border-border/20 py-4 md:grid-cols-2">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="withSL"
                    checked={withSL}
                    onCheckedChange={(c) => setWithSL(Boolean(c))}
                    className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-background"
                  />
                  <Label htmlFor="withSL" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Enable Stop Loss</Label>
                </div>
                <AnimatePresence>
                  {withSL && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Input
                        id="stop_loss"
                        type="number"
                        placeholder="Stop Loss Price..."
                        step="any"
                        value={formData.stop_loss}
                        onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                        className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="withTP"
                    checked={withTP}
                    onCheckedChange={(c) => setWithTP(Boolean(c))}
                    className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-background"
                  />
                  <Label htmlFor="withTP" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Enable Take Profit</Label>
                </div>
                <AnimatePresence>
                  {withTP && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Input
                        id="take_profit"
                        type="number"
                        placeholder="Take Profit Price..."
                        step="any"
                        value={formData.take_profit}
                        onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                        className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Dates & Strategy */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="entry_date" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Entry Date</Label>
                <Input
                  id="entry_date"
                  type="date"
                  max={today}
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                  className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="exit_date" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exit Date</Label>
                <Input
                  id="exit_date"
                  type="date"
                  max={today}
                  disabled={formData.status === "open"}
                  value={formData.exit_date}
                  onChange={(e) => setFormData({ ...formData, exit_date: e.target.value })}
                  className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="strategy" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strategy Tag</Label>
                <Input
                  id="strategy"
                  placeholder="e.g. Trendline Bounce, VWAP Dev"
                  value={formData.strategy_name}
                  onChange={(e) => setFormData({ ...formData, strategy_name: e.target.value })}
                  className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                />
              </div>
            </div>

            {/* Text Notes */}
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trade Journal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe setup confluence points, psychological states, and manual exit rationale..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-muted/10 border-primary/10 hover:border-primary/30 transition-all text-xs rounded-lg min-h-[80px]"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full bg-gold-gradient text-background font-bold text-xs uppercase h-10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isSuccess ? (
                <ShieldCheck className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isSuccess ? "Trade Saved successfully" : "Commit Trade to Ledger"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Projections Panel: Live R:R calculator & screenshot drop */}
      <div className="space-y-6">
        {/* Risk calculator projections card */}
        <Card className="bg-card/20 border-border/40 backdrop-blur-md relative overflow-hidden gold-glow-subtle">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Risk Management Projections
            </CardTitle>
            <CardDescription className="text-[10px] uppercase text-muted-foreground">
              Calculates target ratios dynamically as you type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {liveCalculation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Simulated Risk</span>
                  <span className="text-sm font-bold text-destructive">{liveCalculation.risk}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Simulated Reward</span>
                  <span className="text-sm font-bold text-emerald-500">{liveCalculation.reward}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Risk-to-Reward Ratio</span>
                  <span className="text-sm font-black text-primary">{liveCalculation.ratio}</span>
                </div>

                {!liveCalculation.isValid && (
                  <div className="text-[9px] text-destructive/80 font-bold uppercase flex items-center gap-1.5 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Warning: SL or TP price values mismatch order side!
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
                <HelpCircle className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                  Provide Quantity, Entry Price, & SL/TP to project ratios.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Screenshot Upload drop-zone */}
        <Card className="bg-card/20 border-border/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Chart Screenshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all rounded-xl p-6 text-center space-y-3 bg-neutral-900/10">
              <Upload className="w-6 h-6 text-primary/60" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {screenshot ? screenshot.name : "Drag & Drop trade graphic here"}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const compressed = await compressImage(file);
                    setScreenshot(compressed);
                  } else {
                    setScreenshot(null);
                  }
                }}
                className="hidden"
                id="screenshot-input"
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => document.getElementById("screenshot-input")?.click()}
                className="text-[9px] font-black uppercase tracking-widest h-7 border-primary/20 hover:bg-primary/5 text-primary"
              >
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
