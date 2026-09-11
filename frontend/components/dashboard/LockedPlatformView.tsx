"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Sparkles,
  Building,
  Hash,
  Send,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  TrendingUp,
  Scale,
  Award,
  Check
} from "lucide-react";
import { getVerificationStatus, submitVerificationRequest, applyPromoCode } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface LockedPlatformViewProps {
  statusData?: any;
}

export function LockedPlatformView({ statusData: initialStatusData }: LockedPlatformViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, update: updateSession } = useSession();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState<any>(initialStatusData);
  const [activeTab, setActiveTab] = useState<"premium" | "broker" | "promo">("premium");
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const [formData, setFormData] = useState({
    broker: "",
    tradingAccountNumber: "",
    telegramUsername: "",
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getVerificationStatus();
      setStatusData(data);

      if (data.status === "approved") {
        await updateSession({
          status: "approved",
          role: data.role,
          isPromoActive: data.isPromoActive,
          isPremiumActive: data.isPremiumActive,
          membershipTag: data.membershipTag
        });
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Failed to load verification status:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasUsedPromo = Boolean(
    statusData?.hasUsedPromo ||
    (statusData?.promoExpiresAt && !statusData?.isPromoActive)
  );

  const hasRequest = Boolean(statusData?.request);
  const requestStatus = statusData?.request?.status || statusData?.status || "pending";
  const remarks = statusData?.request?.remarks || "";

  const handleNavigateToCheckout = (planChoice: "annual" | "monthly") => {
    window.location.href = `/premium?plan=${planChoice}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.broker || !formData.tradingAccountNumber || !formData.telegramUsername) {
      toast({
        variant: "destructive",
        title: "Required Fields",
        description: "Please fill in all broker details.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitVerificationRequest(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Details Submitted",
        description: "Your affiliate broker details have been sent to our admin team for verification.",
      });

      await fetchStatus();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast({
        variant: "destructive",
        title: "Code Required",
        description: "Please enter a valid promotional code.",
      });
      return;
    }

    setPromoLoading(true);
    try {
      const result = await applyPromoCode(promoCode);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Promo Trial Activated!",
        description: result.message || "Your 10-day promotional trial has been activated.",
      });

      await updateSession({
        status: "approved",
        membershipTag: "PROMO TRIAL",
        isPromoActive: true,
        isPremiumActive: false
      });
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: error.message || "Failed to apply promotional code.",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-background">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl relative z-10 space-y-6 my-auto"
      >
        {/* Header Title Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            {hasUsedPromo ? "10-Day Promotional Trial Ended" : "Platform Access Restricted"}
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            {hasUsedPromo ? "Unlock Full Platform Access" : "Activate Your Membership"}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {hasUsedPromo
              ? "All features (Console, Calculators, Operator HQ Signals, Live Market) are locked because your 10-day trial has ended. Select an option below to restore full access."
              : "Welcome to TradeTracker Pro! Choose your preferred activation method to unlock the trading console, signals, and analytics."}
          </p>
        </div>

        {/* Tab Selection Switcher */}
        <div className={`grid ${hasUsedPromo ? "grid-cols-2" : "grid-cols-3"} gap-2 p-1.5 bg-neutral-950/80 rounded-2xl border border-border/40 backdrop-blur-md`}>
          <button
            type="button"
            onClick={() => setActiveTab("premium")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "premium"
                ? "bg-gold-gradient text-background shadow-md shadow-primary/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-neutral-900/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Premium</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("broker")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "broker"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-neutral-900/50"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Partner Broker (Free)</span>
          </button>

          {!hasUsedPromo && (
            <button
              type="button"
              onClick={() => setActiveTab("promo")}
              className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "promo"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-neutral-900/50"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Promo Trial</span>
            </button>
          )}
        </div>

        {/* Dynamic Card Content Area */}
        <AnimatePresence mode="wait">
          {/* TAB 1: Instant Premium Upgrade with BOTH Plans (Monthly & Annual) */}
          {activeTab === "premium" && (
            <motion.div
              key="tab-premium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="bg-card/40 border-primary/30 backdrop-blur-xl relative overflow-hidden shadow-2xl gold-glow-subtle rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase px-2.5 py-0.5">
                      Instant Platform Unlock
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Select Plan Below
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground pt-1">
                    Choose Your Subscription Plan
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Unlock unrestricted access to all proprietary institutional trading tools and signals.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 py-2">
                  {/* Two Plan Selection Cards (Annual vs Monthly) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Plan 1: Annual Plan (Recommended / Best Value) */}
                    <div
                      onClick={() => setSelectedPlan("annual")}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        selectedPlan === "annual"
                          ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
                          : "bg-neutral-900/50 border-border/40 hover:border-primary/40 hover:bg-neutral-900/80"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-foreground">Annual Access</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] font-black px-1.5 py-0.5 uppercase">
                            Save 55%
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-2xl font-black text-primary">$80</span>
                          <span className="text-xs text-muted-foreground">/year</span>
                          <span className="text-[11px] text-muted-foreground line-through ml-auto">$180</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Equivalent to <strong className="text-primary font-bold">~$6.67/mo</strong> · Billed yearly
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-amber-400 font-mono text-[10px]">Code: LAUNCH55</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPlan === "annual" ? "border-primary bg-primary text-background" : "border-muted-foreground/40"
                        }`}>
                          {selectedPlan === "annual" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Plan 2: Monthly Plan */}
                    <div
                      onClick={() => setSelectedPlan("monthly")}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        selectedPlan === "monthly"
                          ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
                          : "bg-neutral-900/50 border-border/40 hover:border-primary/40 hover:bg-neutral-900/80"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-foreground">Monthly Access</span>
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black px-1.5 py-0.5 uppercase">
                            Save 40%
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-2xl font-black text-primary">$8.99</span>
                          <span className="text-xs text-muted-foreground">/month</span>
                          <span className="text-[11px] text-muted-foreground line-through ml-auto">$14.99</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Standard monthly flexibility · Cancel anytime
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-amber-400 font-mono text-[10px]">Code: LAUNCH40</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPlan === "monthly" ? "border-primary bg-primary text-background" : "border-muted-foreground/40"
                        }`}>
                          {selectedPlan === "monthly" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Included Features List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-900/40 p-3.5 rounded-xl border border-border/20">
                    {[
                      "Dashboard Console & Unlimited Ledgers",
                      "Operator HQ Past Trades Data & Accuracy Log",
                      "Live Market Stream & Co-Hosting",
                      "Position, P&L & Consistency Calculators",
                      "Economic News Calendar & Sentiment",
                      "Priority Support & Discord Community"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-6">
                  <a
                    href={`/premium?plan=${selectedPlan}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateToCheckout(selectedPlan);
                    }}
                    className="w-full h-11 bg-gold-gradient text-background font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xl text-center select-none"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>
                      {selectedPlan === "annual"
                        ? "Upgrade to Annual Premium ($80/year · 55% OFF)"
                        : "Upgrade to Monthly Premium ($8.99/month · 40% OFF)"}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0 ml-auto" />
                  </a>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* TAB 2: Partner Broker (Free Lifetime) */}
          {activeTab === "broker" && (
            <motion.div
              key="tab-broker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="bg-card/40 border-primary/20 backdrop-blur-xl relative overflow-hidden shadow-2xl rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/80" />

                {/* Case A: Already submitted and pending review */}
                {hasRequest && requestStatus === "pending" && (
                  <div>
                    <CardHeader className="text-center pt-6 pb-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-2 animate-pulse">
                        <Clock className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-black uppercase tracking-wider">
                        Broker Details Under Review
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Your referral affiliate account details are being verified by our admins.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 py-3">
                      <div className="bg-neutral-900/60 rounded-xl p-4 border border-border/30 text-left space-y-2 text-xs">
                        <div className="flex justify-between border-b border-border/20 pb-1.5 font-semibold">
                          <span className="text-muted-foreground uppercase">Broker</span>
                          <span className="text-foreground uppercase">{statusData?.request?.broker}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/20 pb-1.5 font-semibold">
                          <span className="text-muted-foreground uppercase">Account ID</span>
                          <span className="text-foreground">{statusData?.request?.tradingAccountNumber}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-muted-foreground uppercase">Telegram</span>
                          <span className="text-primary">{statusData?.request?.telegramUsername}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                        Verification usually completes within a few hours. Once confirmed, all platform features will unlock automatically.
                      </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 pb-6">
                      <Button
                        type="button"
                        onClick={fetchStatus}
                        disabled={loading}
                        className="w-full h-10 bg-gold-gradient text-background font-black text-xs uppercase rounded-xl cursor-pointer"
                      >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                        Check Status Now
                      </Button>
                    </CardFooter>
                  </div>
                )}

                {/* Case B: Verification Rejected */}
                {hasRequest && requestStatus === "rejected" && (
                  <form onSubmit={handleSubmit}>
                    <CardHeader className="text-center pt-6 pb-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-black uppercase tracking-wider text-destructive">
                        Verification Rejected
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {remarks ? `Admin Note: ${remarks}` : "Could not verify trading account under our affiliate link. Please submit correct details."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 py-2">
                      <div className="space-y-1">
                        <Label htmlFor="broker_rej" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Broker Name</Label>
                        <Input
                          id="broker_rej"
                          placeholder="e.g. Exness, IC Markets"
                          value={formData.broker}
                          onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                          className="bg-muted/20 border-primary/10 text-xs h-9 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="acc_rej" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trading Account ID</Label>
                        <Input
                          id="acc_rej"
                          placeholder="e.g. 5092304"
                          value={formData.tradingAccountNumber}
                          onChange={(e) => setFormData({ ...formData, tradingAccountNumber: e.target.value })}
                          className="bg-muted/20 border-primary/10 text-xs h-9 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tele_rej" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Telegram Username</Label>
                        <Input
                          id="tele_rej"
                          placeholder="e.g. @tradetracker_user"
                          value={formData.telegramUsername}
                          onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                          className="bg-muted/20 border-primary/10 text-xs h-9 rounded-lg"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pb-6">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-10 bg-gold-gradient text-background font-black text-xs uppercase rounded-xl cursor-pointer"
                      >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                        Resubmit for Verification
                      </Button>
                    </CardFooter>
                  </form>
                )}

                {/* Case C: Fresh submission form */}
                {!hasRequest && (
                  <form onSubmit={handleSubmit}>
                    <CardHeader className="pb-3">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-0.5 w-fit">
                        Free Lifetime Access
                      </Badge>
                      <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground pt-1">
                        Partner Broker Verification
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Trade with our affiliated partner broker to unlock TradeTracker Pro 100% free for life.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3.5 py-2">
                      <div className="space-y-1">
                        <Label htmlFor="broker" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Broker Name
                        </Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                          <Input
                            id="broker"
                            placeholder="e.g. Exness, IC Markets, Vantage"
                            value={formData.broker}
                            onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                            className="pl-9 bg-muted/20 border-primary/10 text-xs h-9 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="tradingAccountNumber" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          MT5/MT4 Trading Account Number
                        </Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                          <Input
                            id="tradingAccountNumber"
                            placeholder="e.g. 5092304"
                            value={formData.tradingAccountNumber}
                            onChange={(e) => setFormData({ ...formData, tradingAccountNumber: e.target.value })}
                            className="pl-9 bg-muted/20 border-primary/10 text-xs h-9 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="telegramUsername" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Telegram Username
                        </Label>
                        <div className="relative">
                          <Send className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                          <Input
                            id="telegramUsername"
                            placeholder="e.g. @tradetracker_user"
                            value={formData.telegramUsername}
                            onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                            className="pl-9 bg-muted/20 border-primary/10 text-xs h-9 rounded-lg"
                          />
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-6">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-11 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/10 hover:opacity-95 rounded-xl cursor-pointer"
                      >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                        Submit Details for Verification
                      </Button>
                    </CardFooter>
                  </form>
                )}
              </Card>
            </motion.div>
          )}

          {/* TAB 3: Promo Trial (For brand new users only) */}
          {activeTab === "promo" && !hasUsedPromo && (
            <motion.div
              key="tab-promo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="bg-card/40 border-primary/20 backdrop-blur-xl relative overflow-hidden shadow-2xl rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/80" />
                <form onSubmit={handlePromoSubmit}>
                  <CardHeader className="pb-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase px-2.5 py-0.5 w-fit">
                      10-Day Free Trial
                    </Badge>
                    <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground pt-1">
                      Enter Promotional Code
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Enter the promo code (e.g. RDX10) to start your 10-day trial of the dashboard console and calculators.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 py-2">
                    <div className="space-y-1">
                      <Label htmlFor="promoCode" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Promo Code
                      </Label>
                      <Input
                        id="promoCode"
                        placeholder="e.g. RDX10"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-muted/20 border-primary/20 text-xs h-10 rounded-lg uppercase tracking-widest font-black"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      💡 <strong>Note:</strong> Promo codes can only be used once per account. After 10 days, access will be locked until upgraded or verified.
                    </p>
                  </CardContent>

                  <CardFooter className="pt-2 pb-6">
                    <Button
                      type="submit"
                      disabled={promoLoading}
                      className="w-full h-11 bg-gold-gradient text-background font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/10 rounded-xl cursor-pointer"
                    >
                      {promoLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                      Activate 10-Day Trial
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
