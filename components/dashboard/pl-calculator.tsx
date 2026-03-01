"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, TrendingDown, Info, Search } from "lucide-react";
import SymbolCombobox, {
  type SymbolOption,
} from "@/components/inputs/symbol-combobox";

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
  const [symbol, setSymbol] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  
  const [result, setResult] = useState<{
    pnl: number;
    pnlPercent: number;
    riskReward?: number;
  } | null>(null);

  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(quantity);

    if (!isNaN(entry) && !isNaN(exit) && !isNaN(qty)) {
      let pnl = 0;
      if (direction === "long") {
        pnl = (exit - entry) * qty;
      } else {
        pnl = (entry - exit) * qty;
      }

      const pnlPercent = (pnl / (entry * qty)) * 100;
      setResult({ pnl, pnlPercent });
    } else {
      setResult(null);
    }
  }, [direction, entryPrice, exitPrice, quantity]);

  return (
    <Card className="w-full max-w-2xl mx-auto border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>P&L Calculator</CardTitle>
            <CardDescription aria-description="Calculate potential profits and losses across different assets">
              Estimate your potential trade outcome
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Instrument</Label>
            <SymbolCombobox
              value={symbol}
              onChange={setSymbol}
              options={SYMBOL_OPTIONS}
              placeholder="Search instrument..."
            />
          </div>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as "long" | "short")}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long (Buy)</SelectItem>
                <SelectItem value="short">Short (Sell)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry">Entry Price</Label>
            <Input
              id="entry"
              type="number"
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exit">Exit Price</Label>
            <Input
              id="exit"
              type="number"
              placeholder="0.00"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input
              id="qty"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        {result ? (
          <div className={`p-6 rounded-xl border-2 transition-all ${
            result.pnl >= 0 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-500"
          }`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Estimated P&L</p>
                <h3 className="text-3xl font-bold font-mono">
                  {result.pnl >= 0 ? "+" : ""}{result.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Percentage</p>
                <div className="flex items-center justify-end gap-1 text-xl font-bold">
                  {result.pnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {result.pnlPercent.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-current/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase opacity-60">Position Size</p>
                <p className="font-semibold">${(parseFloat(entryPrice) * parseFloat(quantity)).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase opacity-60">Target Result</p>
                <p className="font-semibold">${(parseFloat(exitPrice) * parseFloat(quantity)).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-accent/20">
            <Info className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm italic">Enter values above to calculate results</p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-[11px]">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
          <p>
            Note: This is a raw calculation. Fees, slippage, and spread are not included in the estimation. 
            For Forex, pip value calculations will be added in the next update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
