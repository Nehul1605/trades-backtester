"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Percent,
  TrendingUp,
  Scale,
  Calendar,
  Wallet,
  Sparkles,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ConsistencyCalculatorPage() {
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [targetPercent, setTargetPercent] = useState<number>(8); // default 8% target
  const [targetAmountInput, setTargetAmountInput] = useState<string>("8000");
  const [consistencyPercent, setConsistencyPercent] = useState<number>(33); // default 33% (Funding Pips)

  // Use custom target or calculate from account size
  const targetAmount = useMemo(() => {
    const val = parseFloat(targetAmountInput);
    return isNaN(val) ? 0 : val;
  }, [targetAmountInput]);

  // Max profit allowed on a single day
  const maxDailyProfit = useMemo(() => {
    return targetAmount * (consistencyPercent / 100);
  }, [targetAmount, consistencyPercent]);

  // Minimum trading days if trader makes max allowed daily profit
  const minTradingDays = useMemo(() => {
    if (consistencyPercent <= 0) return 1;
    return Math.ceil(100 / consistencyPercent);
  }, [consistencyPercent]);

  // Quick account size presets
  const sizePresets = [10000, 25000, 50000, 100000, 200000];

  const handleAccountSizeSelect = (size: number) => {
    setAccountSize(size);
    const calculatedTarget = size * (targetPercent / 100);
    setTargetAmountInput(calculatedTarget.toString());
  };

  const handleTargetPercentSelect = (pct: number) => {
    setTargetPercent(pct);
    const calculatedTarget = accountSize * (pct / 100);
    setTargetAmountInput(calculatedTarget.toString());
  };

  const handleTargetAmountChange = (val: string) => {
    setTargetAmountInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && accountSize > 0) {
      setTargetPercent(Number(((num / accountSize) * 100).toFixed(2)));
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <DashboardHeader
        title="Prop Consistency Calculator"
        description="Calculate maximum daily payouts and profit limits to stay compliant with prop firm consistency rules."
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="md:col-span-6 space-y-6">
          <Card className="bg-card/20 border-border/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                Calculator Parameters
              </CardTitle>
              <CardDescription className="text-[10px] uppercase text-muted-foreground">
                Set account parameters to calculate limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Account Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="accountSize" className="text-xs uppercase font-bold text-muted-foreground">
                    Account Size ($)
                  </Label>
                  <span className="text-[11px] font-mono text-primary font-bold">
                    ${accountSize.toLocaleString()}
                  </span>
                </div>
                <Input
                  id="accountSize"
                  type="number"
                  placeholder="100000"
                  value={accountSize || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setAccountSize(val);
                    setTargetAmountInput((val * (targetPercent / 100)).toString());
                  }}
                  className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-10"
                />
                {/* Size Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sizePresets.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleAccountSizeSelect(size)}
                      className={cn(
                        "px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border transition-all cursor-pointer",
                        accountSize === size
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background/20 border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ${(size / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit Target */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="targetAmount" className="text-xs uppercase font-bold text-muted-foreground">
                    Profit Target ($)
                  </Label>
                  <span className="text-[11px] font-mono text-primary font-bold">
                    {targetPercent}% Target
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="8000"
                    value={targetAmountInput}
                    onChange={(e) => handleTargetAmountChange(e.target.value)}
                    className="bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-10 flex-1"
                  />
                </div>
                {/* Target Presets */}
                <div className="flex gap-1.5 pt-1">
                  {[8, 10, 12, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleTargetPercentSelect(pct)}
                      className={cn(
                        "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border transition-all cursor-pointer",
                        targetPercent === pct
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background/20 border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Consistency % */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="consistencyPercent" className="text-xs uppercase font-bold text-muted-foreground">
                    Consistency rule (%)
                  </Label>
                  <span className="text-[11px] font-mono text-primary font-bold">
                    {consistencyPercent}% Rule
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <input
                    id="consistencyPercentRange"
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={consistencyPercent}
                    onChange={(e) => setConsistencyPercent(parseInt(e.target.value))}
                    className="flex-1 accent-primary h-1 bg-border/40 rounded-lg cursor-pointer"
                  />
                  <Input
                    id="consistencyPercent"
                    type="number"
                    value={consistencyPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setConsistencyPercent(Math.min(100, Math.max(0, val)));
                    }}
                    className="w-16 text-center bg-background/40 border-border/40 text-xs font-semibold focus-visible:ring-primary/40 h-8"
                  />
                </div>
                {/* Rule presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { l: "33% (Funding Pips)", v: 33 },
                    { l: "40% (FundedNext)", v: 40 },
                    { l: "50% (Standard)", v: 50 },
                  ].map((preset) => (
                    <button
                      key={preset.l}
                      type="button"
                      onClick={() => setConsistencyPercent(preset.v)}
                      className={cn(
                        "px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border transition-all cursor-pointer",
                        consistencyPercent === preset.v
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background/20 border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {preset.l}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output Report */}
        <div className="md:col-span-6 space-y-6">
          <Card className="bg-card/20 border-border/40 backdrop-blur-md h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Consistency Report
              </CardTitle>
              <CardDescription className="text-[10px] uppercase text-muted-foreground">
                Live compliance thresholds based on consistency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 pt-2">
              {/* Max daily allowed */}
              <div className="bg-neutral-900/30 border border-border/20 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-15">
                  <Percent className="w-16 h-16 text-primary" />
                </div>
                <div className="text-[10px] uppercase tracking-wider font-black text-muted-foreground">
                  Maximum Profit Allowed in a Single Day
                </div>
                <div className="text-3xl font-black text-gold-gradient font-mono">
                  ${maxDailyProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  Earning more than this on a single day violates the consistency threshold, requiring you to make more total profit or have the excess gains ignored.
                </p>
              </div>

              {/* Grid with min trading days / limits */}
              <div className="grid gap-4 grid-cols-2">
                <div className="bg-background/20 border border-border/30 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Min Trading Days
                  </div>
                  <div className="text-xl font-black text-foreground font-mono">
                    {minTradingDays} Days
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    Minimum days to hit target at max daily limit
                  </p>
                </div>

                <div className="bg-background/20 border border-border/30 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                    Target Percentage
                  </div>
                  <div className="text-xl font-black text-foreground font-mono">
                    {targetPercent}%
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    Total required profit percent of accounts
                  </p>
                </div>
              </div>

              {/* Live breakdown of days if trading at limit */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Target Allocation Simulation
                </h4>
                <div className="space-y-2">
                  {Array.from({ length: Math.min(4, minTradingDays) }).map((_, idx) => {
                    const share = idx === minTradingDays - 1 && minTradingDays > 1
                      ? 100 - (minTradingDays - 1) * consistencyPercent
                      : consistencyPercent;
                    const value = targetAmount * (share / 100);
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs font-semibold bg-neutral-900/10 border border-border/20 rounded-lg p-2.5">
                        <span className="text-muted-foreground uppercase text-[10px]">
                          Trading Day {idx + 1} Max Cap
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-foreground">${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-primary/80">({share.toFixed(0)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                  {minTradingDays > 4 && (
                    <div className="text-[10px] text-center text-muted-foreground uppercase font-black pt-1">
                      + {minTradingDays - 4} additional days required at simulated cap
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <div className="border-t border-border/20 p-4 bg-muted/10 flex items-start gap-2.5 rounded-b-2xl">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-semibold">
                <span className="text-rose-500 font-bold">Important compliance note:</span> keep your daily maximum trade profits balanced. If you exceed the maximum daily profit cap shown above, you must scale your trades on subsequent days to rebuild average consistency guidelines.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
