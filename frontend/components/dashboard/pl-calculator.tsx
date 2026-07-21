"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Scale,
} from "lucide-react";
import SymbolCombobox, {
  type SymbolOption,
} from "@/components/inputs/symbol-combobox";
import { computePnlUSD } from "@/lib/pnl";
import { cn } from "@/lib/utils";

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

export function PLCalculator() {
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [symbol, setSymbol] = useState<string>("XAUUSD");
  const [entryPrice, setEntryPrice] = useState<string>("2400");
  const [exitPrice, setExitPrice] = useState<string>("2420");
  const [quantity, setQuantity] = useState<string>("10");

  const [result, setResult] = useState<{
    pnl: number;
    pnlPercent: number;
  } | null>(null);

  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(quantity);

    if (!isNaN(entry) && !isNaN(exit) && !isNaN(qty) && symbol) {
      const { pnl, pnlPct: pnlPercent } = computePnlUSD({
        symbol,
        entryPrice: entry,
        exitPrice: exit,
        quantity: qty,
        tradeType: direction,
      });

      setResult({ pnl, pnlPercent });
    } else {
      setResult(null);
    }
  }, [direction, entryPrice, exitPrice, quantity, symbol]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const positionSize = useMemoDecimal(entryPrice, quantity);
  const targetResult = useMemoDecimal(exitPrice, quantity);

  function useMemoDecimal(price: string, qty: string) {
    const p = parseFloat(price);
    const q = parseFloat(qty);
    if (isNaN(p) || isNaN(q)) return 0;
    return p * q;
  }

  return (
    <div className="grid gap-6 md:grid-cols-12 max-w-5xl mx-auto w-full items-stretch">
      {/* Left Column: Parameters Card */}
      <div className="md:col-span-6 space-y-6">
        <Card className="bg-card/20 border-border/40 backdrop-blur-md h-full">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Calculator Parameters
            </CardTitle>
            <CardDescription className="text-[10px] uppercase text-muted-foreground">
              Set trade parameters to calculate estimated P&L
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Instrument Selection */}
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">
                Instrument
              </Label>
              <SymbolCombobox
                value={symbol}
                onChange={setSymbol}
                options={SYMBOL_OPTIONS}
                placeholder="Search instrument..."
              />
            </div>

            {/* Direction Selection */}
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">
                Trade Direction
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDirection("long")}
                  className={cn(
                    "py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs transition-all cursor-pointer",
                    direction === "long"
                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-500"
                      : "bg-background/20 border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent/20"
                  )}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Buy (Long)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("short")}
                  className={cn(
                    "py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs transition-all cursor-pointer",
                    direction === "short"
                      ? "bg-rose-500/10 border-rose-500/35 text-rose-500"
                      : "bg-background/20 border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent/20"
                  )}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Sell (Short)
                </button>
              </div>
            </div>

            {/* Parameter Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice" className="text-xs uppercase font-bold text-muted-foreground">
                  Entry Price
                </Label>
                <Input
                  id="entryPrice"
                  type="number"
                  placeholder="0.00"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-10 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitPrice" className="text-xs uppercase font-bold text-muted-foreground">
                  Exit Price
                </Label>
                <Input
                  id="exitPrice"
                  type="number"
                  placeholder="0.00"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-10 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs uppercase font-bold text-muted-foreground">
                Quantity (Lots/Units)
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-10 font-mono"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Report Card */}
      <div className="md:col-span-6 space-y-6">
        <Card className="bg-card/20 border-border/40 backdrop-blur-md h-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Calculation Report
            </CardTitle>
            <CardDescription className="text-[10px] uppercase text-muted-foreground">
              Estimated outcomes based on parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 pt-2">
            {result ? (
              <>
                {/* Estimated P&L Card */}
                <div
                  className={cn(
                    "border rounded-2xl p-5 space-y-2 relative overflow-hidden transition-all duration-300",
                    result.pnl >= 0
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-rose-500/5 border-rose-500/20"
                  )}
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Calculator className="w-16 h-16 text-primary" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-black text-muted-foreground">
                    Estimated P&L
                  </div>
                  <div
                    className={cn(
                      "text-3xl font-black font-mono",
                      result.pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {result.pnl >= 0 ? "+" : ""}${result.pnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    Simulated outcome for a <span className="font-bold uppercase">{direction}</span> trade on <span className="font-bold">{symbol}</span>.
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="bg-background/20 border border-border/30 rounded-xl p-4 space-y-1">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                      Position Size
                    </div>
                    <div className="text-lg font-black text-foreground font-mono">
                      ${positionSize.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      Total value of position at entry
                    </p>
                  </div>

                  <div className="bg-background/20 border border-border/30 rounded-xl p-4 space-y-1">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                      Target Result
                    </div>
                    <div className="text-lg font-black text-foreground font-mono">
                      ${targetResult.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      Total value of position at exit
                    </p>
                  </div>
                </div>

                {/* Percentage breakdown */}
                <div className="flex justify-between items-center text-xs font-semibold bg-neutral-900/10 border border-border/20 rounded-lg p-2.5">
                  <span className="text-muted-foreground uppercase text-[10px]">
                    Percent Return
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold">
                    {result.pnl >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                    )}
                    <span className={result.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      {result.pnl >= 0 ? "+" : ""}{result.pnlPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[250px] border border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-accent/5 p-6 text-center select-none">
                <Info className="w-8 h-8 mb-2.5 opacity-20 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Awaiting Input
                </h4>
                <p className="text-[10px] text-muted-foreground max-w-64 mt-1 leading-relaxed">
                  Enter valid entry price, exit price, and quantity parameters on the left to simulate outcomes.
                </p>
              </div>
            )}
          </CardContent>

          <div className="border-t border-border/20 p-4 bg-muted/10 flex items-start gap-2.5 rounded-b-2xl">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-semibold">
              Note: This calculation uses asset-specific contract sizes and pip values. Commission fees, slippage, swaps, and spreads are not included.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
