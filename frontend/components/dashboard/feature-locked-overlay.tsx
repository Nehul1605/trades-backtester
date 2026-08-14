"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FeatureLockedOverlayProps {
  featureName: string;
}

export function FeatureLockedOverlay({ featureName }: FeatureLockedOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            "Trading Resources & PDF Guides",
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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 px-6 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs font-bold uppercase cursor-pointer"
              >
                Join Operator HQ
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border border-primary/20 text-foreground max-w-md rounded-2xl p-6 shadow-2xl backdrop-blur-2xl">
              <DialogHeader className="space-y-2 text-center">
                <DialogTitle className="text-lg font-black uppercase tracking-wider text-primary flex items-center justify-center gap-2">
                  <span>🚀</span> Join Operator HQ
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  Unlock Lifetime Access to TradeTracker Pro
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-5 py-4">
                <p className="text-xs text-muted-foreground leading-relaxed text-center">
                  Follow these 3 simple steps to verify your referral account and get permanent access to all dashboard features.
                </p>

                <div className="space-y-4 text-xs">
                  {/* Step 1 */}
                  <div className="flex gap-3 bg-neutral-900/40 p-3 rounded-xl border border-border/10">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-black">1</span>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground uppercase tracking-wide text-left">Message us on WhatsApp</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                        Click the WhatsApp button below to message our official team. Simply send: <strong className="text-primary italic">"I want to join Operator HQ"</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3 bg-neutral-900/40 p-3 rounded-xl border border-border/10">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-black">2</span>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground uppercase tracking-wide text-left">Follow Verification Steps</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                        Our WhatsApp support team will guide you through a few quick steps to verify your broker account.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3 bg-neutral-900/40 p-3 rounded-xl border border-border/10">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-black">3</span>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground uppercase tracking-wide text-left">Submit Gate Details</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                        After verification, fill in your referral community portal details (affiliate account credentials). Once approved, you get lifetime premium access!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  asChild
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  <a 
                    href="https://wa.me/message/J5NEPQUWM7GQK1?text=I%20want%20to%20join%20Operator%20HQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Chat on WhatsApp Now
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-xs font-bold uppercase hover:bg-muted/10"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
