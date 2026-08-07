"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  Calculator,
  Percent,
  Layers,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export function PositionCalculator() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full py-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Position Size Calculator
            </h1>
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase px-2.5 py-0.5">
              Coming Soon
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Advanced risk-to-reward lot size calculator for CFD trading
          </p>
        </div>
      </div>

      {/* Main Coming Soon Card */}
      <Card className="bg-card/40 border-amber-500/30 shadow-xl backdrop-blur-md relative overflow-hidden text-center p-8 sm:p-12">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-gradient" />
        
        <div className="max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-md">
            <Scale className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Under Active Development • Launching Soon
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-foreground">
              Position Calculator Is On Its Way
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We are finalizing the position size engine to bring you instant lot size calculations, stop-loss distance mapping, and automatic risk exposure warnings across all Forex &amp; Gold pairs.
            </p>
          </div>

          {/* Features Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Exact Lot Sizing</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Compute standard, mini, and micro lots based on your exact account risk %.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dynamic Pip Values</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Supports EURUSD, GBPUSD, USDJPY, XAUUSD Gold, Indices, and Crypto.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Risk Warnings</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Real-time indicator bar preventing accidental over-leveraging on trades.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="bg-gold-gradient text-background font-bold text-xs uppercase px-5"
            >
              <Link href="/pl-calculator">
                <Calculator className="w-4 h-4 mr-2" /> Try P&amp;L Calculator Now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border/60 text-xs font-bold uppercase"
            >
              <Link href="/consistency-calculator">
                <Percent className="w-4 h-4 mr-2" /> Check Consistency Calculator
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
