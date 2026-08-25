"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Scale,
  Sparkles,
  Info,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import SymbolCombobox, {
  type SymbolOption,
} from "@/components/inputs/symbol-combobox";
import {
  getInstrumentsAction,
  calculatePositionSizeAction,
  getBrokerAccounts,
} from "@/lib/actions";
import { cn } from "@/lib/utils";

interface PositionCalculatorProps {
  userId?: string;
}

export function PositionCalculator({ userId }: PositionCalculatorProps) {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [brokerAccounts, setBrokerAccounts] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State - Starts empty or with neutral defaults (letting user type Entry/SL/TP)
  const [symbol, setSymbol] = useState<string>("XAUUSD");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [accountSelection, setAccountSelection] = useState<string>("custom");
  const [balance, setBalance] = useState<string>("10000");
  const [riskPercent, setRiskPercent] = useState<string>("1");
  const [entryPrice, setEntryPrice] = useState<string>("");
  
  const [stopLossType, setStopLossType] = useState<"price" | "pips">("price");
  const [stopLossValue, setStopLossValue] = useState<string>("");

  const [takeProfitType, setTakeProfitType] = useState<"price" | "pips" | "rr">("rr");
  const [takeProfitValue, setTakeProfitValue] = useState<string>("");

  // Output State
  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch initial instruments & broker accounts
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const instRes = await getInstrumentsAction();
        if (instRes.success && instRes.instruments) {
          setInstruments(instRes.instruments);
          
          const defaultInst = instRes.instruments.find(
            (i: any) => i.symbol === "XAUUSD"
          ) || instRes.instruments[0];

          if (defaultInst) {
            setSymbol(defaultInst.symbol);
          }
        }

        if (userId) {
          const accounts = await getBrokerAccounts(userId);
          setBrokerAccounts(accounts || []);
        }
      } catch (err) {
        console.error("Error loading calculator initial data:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [userId]);

  // Update balance field when a broker account is selected
  useEffect(() => {
    if (accountSelection === "custom") return;
    const account = brokerAccounts.find((a) => a.id === accountSelection);
    if (account) {
      setBalance(String(account.balance || "0"));
    }
  }, [accountSelection, brokerAccounts]);

  const getDecimalsForSpec = useCallback((spec: any) => {
    if (!spec) return 2;
    if (spec.type === "Forex") {
      return spec.decimals !== undefined ? spec.decimals : 5;
    }
    if (spec.type === "Metal" || spec.type === "Energy" || spec.symbol === "USOIL" || spec.type === "Stock") {
      return 2;
    }
    if (spec.type === "Crypto" || spec.type === "Index") {
      if (spec.symbol === "DXY") return 2;
      return 0;
    }
    return 2;
  }, []);

  const getGuideImage = useCallback((spec: any) => {
    if (!spec) return "/guide-forex.png";
    
    // Explicit symbol-based mappings
    if (spec.symbol === "US100" || spec.symbol === "USTECH") {
      return "/guide-us100.png";
    }
    if (spec.symbol === "USDJPY") {
      return "/guide-usdjpy.png";
    }
    if (spec.symbol === "GBPUSD") {
      return "/guide-gbpusd.png";
    }
    if (spec.symbol === "USOIL") {
      return "/guide-usoil.png";
    }
    if (spec.symbol === "ETHUSD" || spec.symbol === "ETHUSDT") {
      return "/guide-eth.png";
    }
    if (spec.symbol === "XAUUSD") {
      return "/guide-gold.png";
    }
    if (spec.symbol === "US30") {
      return "/guide-index.png";
    }
    if (spec.symbol === "DE30") {
      return "/guide-de30.png";
    }
    if (spec.symbol === "XAGUSD") {
      return "/guide-xagusd.png";
    }
    if (spec.symbol === "APPLE") {
      return "/guide-stock.png";
    }
    
    // Generic fallbacks by category/type
    if (spec.type === "Index") {
      return "/guide-index.png"; // e.g. DE30 (DAX)
    }
    if (spec.type === "Metal") {
      return "/guide-gold.png";  // e.g. XAGUSD (Silver)
    }
    if (spec.type === "Crypto") {
      return "/guide-crypto.png"; // e.g. BTCUSD
    }
    if (spec.type === "Stock" || spec.type === "Energy") {
      return "/guide-stock.png";
    }
    return "/guide-forex.png";   // e.g. EURUSD
  }, []);

  // Perform backend position calculation
  const performCalculation = useCallback(async () => {
    const balNum = parseFloat(balance);
    const riskPctNum = parseFloat(riskPercent);
    const entryNum = parseFloat(entryPrice);
    const slValNum = parseFloat(stopLossValue);

    if (
      isNaN(balNum) || balNum <= 0 ||
      isNaN(riskPctNum) || riskPctNum <= 0 ||
      isNaN(entryNum) || entryNum <= 0 ||
      isNaN(slValNum) || slValNum <= 0
    ) {
      setCalculationResult(null);
      setCalcError(null);
      return;
    }

    // Additional SL Price logic check to avoid division by zero or negative sizing
    if (stopLossType === "price") {
      if (direction === "long" && slValNum >= entryNum) {
        setCalculationResult(null);
        setCalcError("For Long trades, Stop Loss price must be lower than Entry price");
        return;
      }
      if (direction === "short" && slValNum <= entryNum) {
        setCalculationResult(null);
        setCalcError("For Short trades, Stop Loss price must be higher than Entry price");
        return;
      }
    }

    try {
      setCalculating(true);
      setCalcError(null);

      const payload: any = {
        symbol,
        direction,
        balance: balNum,
        riskPercent: riskPctNum,
        entryPrice: entryNum,
        stopLossType,
      };

      if (stopLossType === "price") {
        payload.stopLossPrice = slValNum;
      } else {
        payload.stopLossPips = slValNum;
      }

      const tpValNum = parseFloat(takeProfitValue);
      if (!isNaN(tpValNum) && tpValNum > 0) {
        payload.takeProfitType = takeProfitType;
        if (takeProfitType === "price") {
          payload.takeProfitPrice = tpValNum;
        } else {
          // pips or rr
          payload.takeProfitPips = tpValNum;
        }
      }

      const res = await calculatePositionSizeAction(payload);
      if (res.success && res.calculation) {
        setCalculationResult(res.calculation);
      } else {
        setCalculationResult(null);
        setCalcError(res.error || "Failed to calculate position size");
      }
    } catch (err: any) {
      setCalculationResult(null);
      setCalcError(err.message || "An unexpected error occurred");
    } finally {
      setCalculating(false);
    }
  }, [
    symbol,
    direction,
    balance,
    riskPercent,
    entryPrice,
    stopLossType,
    stopLossValue,
    takeProfitType,
    takeProfitValue,
  ]);

  // Debounced execution to prevent backend spam on fast typing
  useEffect(() => {
    const timer = setTimeout(() => {
      performCalculation();
    }, 400);

    return () => clearTimeout(timer);
  }, [performCalculation]);

  const symbolOptions: SymbolOption[] = instruments.map((i) => ({
    value: i.symbol,
    label: `${i.symbol} (${i.type || i.category})`,
  }));

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const copyToClipboard = () => {
    if (calculationResult?.positionSizeStandard) {
      navigator.clipboard.writeText(calculationResult.positionSizeStandard.toFixed(2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find currently selected instrument specs
  const selectedInstrument = instruments.find((i) => i.symbol === symbol);

  // Pre-fill button actions
  const handleQuickBalance = (val: number) => {
    setAccountSelection("custom");
    setBalance(String(val));
  };

  const handleQuickRisk = (val: number) => {
    setRiskPercent(String(val));
  };

  if (loadingInitial) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest animate-pulse">
          Loading Sizing Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-12 max-w-6xl mx-auto w-full items-stretch py-2">
      {/* Left Column: Form Parameters */}
      <div className="md:col-span-6 space-y-6">
        <Card className="bg-card/25 border-border/40 backdrop-blur-md h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
                Position Calculator
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-black px-1.5 h-5">
                Beta
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Calculate your optimal position size based on risk parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Instrument Selection */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Instrument
              </Label>
              <SymbolCombobox
                value={symbol}
                onChange={setSymbol}
                options={symbolOptions}
                placeholder="Select Symbol..."
              />
              {selectedInstrument && (
                <p className="text-[10px] text-muted-foreground">
                  Pip: <span className="font-mono font-bold text-foreground">{selectedInstrument.pip}</span> • Type: <span className="font-bold text-foreground">{selectedInstrument.type}</span>
                </p>
              )}
            </div>

            {/* Direction Selection */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Direction
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDirection("long")}
                  className={cn(
                    "py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs transition-all cursor-pointer h-11",
                    direction === "long"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-sm shadow-emerald-500/5"
                      : "bg-background/20 border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("short")}
                  className={cn(
                    "py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs transition-all cursor-pointer h-11",
                    direction === "short"
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-sm shadow-rose-500/5"
                      : "bg-background/20 border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Short
                </button>
              </div>
            </div>

            {/* Account Selection */}
            {brokerAccounts.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Linked Account
                </Label>
                <Select
                  value={accountSelection}
                  onValueChange={setAccountSelection}
                >
                  <SelectTrigger className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-10">
                    <SelectValue placeholder="Custom Balance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Manual Input (Custom)</SelectItem>
                    {brokerAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.broker_type || acc.account_id} (${acc.balance?.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Balance & Risk Input Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="balance" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Balance
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">$</span>
                  <Input
                    id="balance"
                    type="number"
                    value={balance}
                    disabled={accountSelection !== "custom"}
                    onChange={(e) => setBalance(e.target.value)}
                    className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-11 pl-7 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="riskPercent" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Risk %
                </Label>
                <div className="relative">
                  <Input
                    id="riskPercent"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-11 pr-7 font-mono"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Quick Presets for Balance and Risk */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                  Quick Balance
                </Label>
                <div className="flex flex-wrap gap-1">
                  {[5000, 10000, 25000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickBalance(val)}
                      className={cn(
                        "px-1.5 py-1 text-[9px] font-black uppercase rounded-md border transition-all cursor-pointer",
                        parseFloat(balance) === val && accountSelection === "custom"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background/20 border-border/30 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ${val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                  Risk Level
                </Label>
                <div className="flex flex-wrap gap-1">
                  {[0.5, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickRisk(val)}
                      className={cn(
                        "px-2 py-1 text-[9px] font-black uppercase rounded-md border transition-all cursor-pointer",
                        parseFloat(riskPercent) === val
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background/20 border-border/30 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Entry Price (NO DEFAULT FILL VALUE - USER TYPE MANUALLY) */}
            <div className="space-y-1.5 border-t border-border/20 pt-3">
              <Label htmlFor="entry" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Entry
              </Label>
              <Input
                id="entry"
                type="number"
                step="any"
                placeholder="Enter Entry Price..."
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-11 font-mono w-full"
              />
            </div>

            {/* Stop Loss (Type & Value - NO DEFAULT FILL VALUE) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="stopLoss" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Stop-Loss (in pips/points)
                </Label>
                <div className="flex bg-neutral-900/40 p-0.5 rounded-lg border border-border/30 h-7 w-24">
                  <button
                    type="button"
                    onClick={() => setStopLossType("price")}
                    className={cn(
                      "flex-1 text-[9px] font-bold uppercase transition-all rounded-md cursor-pointer",
                      stopLossType === "price"
                        ? "bg-primary text-primary-foreground font-black shadow-xs"
                        : "text-muted-foreground"
                    )}
                  >
                    Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setStopLossType("pips")}
                    className={cn(
                      "flex-1 text-[9px] font-bold uppercase transition-all rounded-md cursor-pointer",
                      stopLossType === "pips"
                        ? "bg-primary text-primary-foreground font-black shadow-xs"
                        : "text-muted-foreground"
                    )}
                  >
                    Pips
                  </button>
                </div>
              </div>
              <div className="relative flex items-center w-full">
                <Input
                  id="stopLoss"
                  type="number"
                  step="any"
                  placeholder="Enter stop-loss"
                  value={stopLossValue}
                  onChange={(e) => setStopLossValue(e.target.value)}
                  className={cn(
                    "bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-11 font-mono w-full",
                    stopLossType === "pips" ? "pr-10" : "pr-3"
                  )}
                />
                {stopLossType === "pips" && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1">
                          <Info className="w-4 h-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-card border-border/40 backdrop-blur-md text-foreground">
                        <DialogHeader>
                          <DialogTitle className="text-sm font-black uppercase tracking-wider text-primary">Position Sizing Information</DialogTitle>
                          <DialogDescription className="text-xs text-muted-foreground">
                            Learn how to read stop-loss values on TradingView.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-2 text-center">
                          <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
                            {instruments.find(i => i.symbol === symbol)?.label || symbol}
                          </h3>
                          <div className="rounded-xl overflow-hidden border border-border/40 bg-neutral-900/50 flex items-center justify-center p-2">
                            <img
                              src={getGuideImage(instruments.find(i => i.symbol === symbol))}
                              alt={`${symbol} Guide`}
                              className="max-h-60 object-contain rounded-lg"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed text-left">
                            Use the **Long/Short Position** tool in TradingView. The number highlighted in the label is your Stop-Loss value in pips/points.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              {calculationResult && (
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  = {calculationResult.stopLossPips?.toFixed(1)} pips
                </p>
              )}
            </div>

            {/* Take Profit (Type & Value) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="takeProfit" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Take Profit <span className="text-[9px] font-normal text-muted-foreground lowercase">(optional)</span>
                </Label>
                <div className="flex bg-neutral-900/40 p-0.5 rounded-lg border border-border/30 h-7 w-32">
                  <button
                    type="button"
                    onClick={() => setTakeProfitType("price")}
                    className={cn(
                      "flex-1 text-[9px] font-bold uppercase transition-all rounded-md cursor-pointer",
                      takeProfitType === "price"
                        ? "bg-primary text-primary-foreground font-black shadow-xs"
                        : "text-muted-foreground"
                    )}
                  >
                    Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setTakeProfitType("pips")}
                    className={cn(
                      "flex-1 text-[9px] font-bold uppercase transition-all rounded-md cursor-pointer",
                      takeProfitType === "pips"
                        ? "bg-primary text-primary-foreground font-black shadow-xs"
                        : "text-muted-foreground"
                    )}
                  >
                    Pips
                  </button>
                  <button
                    type="button"
                    onClick={() => setTakeProfitType("rr")}
                    className={cn(
                      "flex-1 text-[9px] font-bold uppercase transition-all rounded-md cursor-pointer",
                      takeProfitType === "rr"
                        ? "bg-primary text-primary-foreground font-black shadow-xs"
                        : "text-muted-foreground"
                    )}
                  >
                    R:R
                  </button>
                </div>
              </div>
              <Input
                id="takeProfit"
                type="number"
                step="any"
                placeholder="Optional"
                value={takeProfitValue}
                onChange={(e) => setTakeProfitValue(e.target.value)}
                className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-11 font-mono w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Outcomes & Analytics */}
      <div className="md:col-span-6 space-y-6 flex flex-col">
        <Card className="bg-card/25 border-border/40 backdrop-blur-md flex-1 flex flex-col justify-between relative overflow-hidden">
          {calculating && (
            <div className="absolute inset-0 bg-background/30 backdrop-blur-xs flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          <div className="p-6 space-y-6 flex-1 flex flex-col">
            {calcError && (
              <div className="border border-rose-500/25 bg-rose-500/5 rounded-2xl p-4 flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-rose-500">Validation Notification</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {calcError}
                  </p>
                </div>
              </div>
            )}

            {calculationResult && !calcError ? (
              <div className="space-y-6 flex-1 flex flex-col">
                {/* 1. POSITION SIZE CARD (Direct standard lots only) */}
                <div className="bg-background/15 border border-border/30 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                      Position Size
                    </span>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-neutral-800/50 flex items-center justify-center rounded-lg border border-border/30 transition-all cursor-pointer bg-neutral-900/40"
                      title="Copy Lot Size"
                    >
                      {copied ? (
                        <Check className="h-4.5 w-4.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                  <div className="text-4xl font-black text-foreground font-mono tracking-tight mt-1 flex items-baseline gap-2">
                    {calculationResult.positionSizeStandard?.toFixed(2)}{" "}
                    <span className="text-sm font-semibold text-muted-foreground uppercase">lots</span>
                  </div>
                </div>

                {/* 2. RISK EXPOSURE BAR GAUGE */}
                <div className="bg-background/15 border border-border/30 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Risk Exposure
                    </span>
                    <Badge variant="outline" className="border-primary/20 text-primary text-[9px] uppercase font-black">
                      Standard
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-foreground">
                      {calculationResult.riskPercent}%
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold font-mono">
                      ({formatCurrency(calculationResult.riskAmount)})
                    </span>
                  </div>
                  {/* Visual progress bar 0% to 5% */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          calculationResult.riskPercent > 3
                            ? "bg-rose-500"
                            : calculationResult.riskPercent > 1.5
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min((calculationResult.riskPercent / 5) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                      <span>0%</span>
                      <span>1%</span>
                      <span>2%</span>
                      <span>3%</span>
                      <span>4%</span>
                      <span>5%</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-snug">
                    Standard professional risk management levels.
                  </p>
                </div>

                {/* 3. TRADE PREVIEW SECTION */}
                <div className="bg-background/15 border border-border/30 rounded-2xl p-5 flex-1 flex flex-col justify-between min-h-[160px]">
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Trade Preview
                    </span>
                    <Badge
                      className={cn(
                        "text-[9px] uppercase font-black px-2 py-0.5 rounded-full",
                        direction === "long"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      )}
                    >
                      {direction === "long" ? "↓ Long" : "↓ Short"}
                    </Badge>
                  </div>

                  {/* Vertical Connection Visual */}
                  <div className="py-4 flex-1 flex flex-col justify-center pl-4">
                    {direction === "long" ? (
                      <div className="space-y-4 relative">
                        {/* Vertical line connector */}
                        <div className="absolute left-[7px] top-[10px] bottom-[10px] w-[2px] border-l-2 border-dashed border-border/40" />

                        {/* Take Profit if defined */}
                        {calculationResult.takeProfitPrice !== null && (
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-xs shrink-0" />
                            <div className="text-xs">
                              <span className="text-[9px] text-muted-foreground uppercase block font-bold">Take Profit</span>
                              <span className="font-mono font-black text-foreground">{calculationResult.takeProfitPrice?.toFixed(getDecimalsForSpec(selectedInstrument))}</span>
                            </div>
                          </div>
                        )}

                        {/* Entry Price */}
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-background shadow-xs shrink-0" />
                          <div className="text-xs">
                            <span className="text-[9px] text-muted-foreground uppercase block font-bold">Entry</span>
                            <span className="font-mono font-black text-foreground">{calculationResult.entryPrice?.toFixed(getDecimalsForSpec(selectedInstrument))}</span>
                          </div>
                        </div>

                        {/* Stop Loss */}
                        <div className="flex items-center gap-3 relative z-10 justify-between pr-4 w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-background shadow-xs shrink-0" />
                            <div className="text-xs">
                              <span className="text-[9px] text-rose-500/80 uppercase block font-bold">Stop Loss</span>
                              <span className="font-mono font-black text-foreground">{calculationResult.stopLossPrice?.toFixed(getDecimalsForSpec(selectedInstrument))}</span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-rose-500 font-bold shrink-0">
                            -{calculationResult.stopLossPips?.toFixed(1)} pips
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 relative">
                        {/* Vertical line connector */}
                        <div className="absolute left-[7px] top-[10px] bottom-[10px] w-[2px] border-l-2 border-dashed border-border/40" />

                        {/* Stop Loss (highest for Short) */}
                        <div className="flex items-center gap-3 relative z-10 justify-between pr-4 w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-background shadow-xs shrink-0" />
                            <div className="text-xs">
                              <span className="text-[9px] text-rose-500/80 uppercase block font-bold">Stop Loss</span>
                              <span className="font-mono font-black text-foreground">{calculationResult.stopLossPrice?.toFixed(getDecimalsForSpec(selectedInstrument))}</span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-rose-500 font-bold shrink-0">
                            -{calculationResult.stopLossPips?.toFixed(1)} pips
                          </span>
                        </div>

                        {/* Entry Price */}
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-background shadow-xs shrink-0" />
                          <div className="text-xs">
                            <span className="text-[9px] text-muted-foreground uppercase block font-bold">Entry</span>
                            <span className="font-mono font-black text-foreground">{calculationResult.entryPrice?.toFixed(getDecimalsForSpec(selectedInstrument))}</span>
                          </div>
                        </div>

                        {/* Take Profit if defined */}
                        {calculationResult.takeProfitPrice !== null && (
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-xs shrink-0" />
                            <div className="text-xs">
                              <span className="text-[9px] text-muted-foreground uppercase block font-bold">Take Profit</span>
                              <span className="font-mono font-black text-foreground">{calculationResult.takeProfitPrice?.toFixed(getDecimalsForSpec(selectedInstrument))}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. BOTTOM DUAL METRIC CARDS */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="bg-background/15 border border-border/30 rounded-2xl p-4.5 space-y-1">
                    <div className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                      Risk Amount
                    </div>
                    <div className="text-xl font-black text-foreground font-mono">
                      {formatCurrency(calculationResult.riskAmount)}
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      {calculationResult.riskPercent}% of balance
                    </p>
                  </div>

                  <div className="bg-background/15 border border-border/30 rounded-2xl p-4.5 space-y-1">
                    <div className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                      Pip Value
                    </div>
                    <div className="text-xl font-black text-foreground font-mono">
                      {formatCurrency(calculationResult.pipValue)}
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      per lot per pip
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              !calcError && (
                <div className="h-full min-h-[300px] border border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-accent/5 p-6 text-center select-none my-auto">
                  <Info className="w-8 h-8 mb-2.5 opacity-20 text-primary animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Awaiting Input
                  </h4>
                  <p className="text-[10px] text-muted-foreground max-w-64 mt-1 leading-relaxed">
                    Provide Entry Price & SL to calculate sizing outcomes.
                  </p>
                </div>
              )
            )}
          </div>

          <div className="border-t border-border/20 p-4 bg-muted/10 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-semibold">
              Calculations apply standard asset-specific sizing rules. Commission, swap fees, and broker spreads are excluded.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
