"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureLockedOverlayProps {
  featureName: string;
}

export function FeatureLockedOverlay({ featureName }: FeatureLockedOverlayProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-background min-h-[60vh]">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative z-10 text-center space-y-6 p-8 rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl"
      >
        {/* Animated Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary mb-2 shadow-inner">
          <Lock className="w-7 h-7 animate-pulse" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-background font-black"
          >
            !
          </motion.div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
            {featureName} Locked
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
            Available under Full Access
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          This feature is restricted under your **10-Day Promotional Trial**. To gain permanent full access to Live Stream, Operator Signals, Economic Calendar, and advanced calculators, choose one of the options below.
        </p>

        {/* Benefits lists */}
        <div className="bg-neutral-900/60 rounded-xl p-4 border border-border/40 text-left max-w-sm mx-auto space-y-2">
          {[
            "Live Market Stream & Co-Hosting",
            "Operator HQ Real-Time Signal Feed",
            "Institutional Economic Calendar",
            "Unlimited Account Workspaces & Ledgers"
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs font-bold uppercase"
          >
            <Link href="/verification">
              Verify Broker (Free)
            </Link>
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto h-11 px-6 bg-gold-gradient text-background font-bold text-xs uppercase shadow-lg shadow-primary/10"
          >
            <Link href="/premium">
              Upgrade to Premium <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
