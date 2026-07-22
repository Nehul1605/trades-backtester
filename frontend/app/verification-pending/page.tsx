"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building, Hash, Send, LogOut, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getVerificationStatus, submitVerificationRequest } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationPendingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, update: updateSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

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

      // If already approved, update session and redirect to dashboard
      if (data.status === "approved") {
        await updateSession({ status: "approved", role: data.role });
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to load verification status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.broker || !formData.tradingAccountNumber || !formData.telegramUsername) {
      toast({
        variant: "destructive",
        title: "Required Fields",
        description: "Please fill in all details.",
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
        title: "Request Submitted",
        description: "Your referral verification has been sent to review.",
      });

      // Refetch status to show pending card
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

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest animate-pulse">
          Syncing Credentials...
        </p>
      </div>
    );
  }

  const userStatus = statusData?.status || "pending";
  const hasRequest = !!statusData?.request;
  const remarks = statusData?.request?.remarks || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden trading-grid">
      {/* Absolute Decorative Glow Spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Transparent Premium Logo header */}
        <div className="flex flex-col items-center justify-center mb-8 space-y-3">
          <div className="relative h-12 w-48 overflow-hidden rounded-lg">
            <img
              src="/logo.png"
              className="h-12 w-auto pointer-events-none select-none absolute left-1/2 -translate-x-1/2 top-0"
              alt="TradeTracker Pro Logo"
            />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black text-center pt-2">
            Referral Verification Gate
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* CASE 1: Request Submitted, Awaiting Approval */}
          {hasRequest && userStatus === "pending" && (
            <motion.div
              key="pending-request"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="bg-card/40 border-primary/20 backdrop-blur-md relative overflow-hidden gold-glow-subtle">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-500/80" />
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4 animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-wider">
                    Verification Submitted
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground pt-1">
                    Your details are under active review by our referral admins.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 py-4 text-center">
                  <div className="bg-neutral-900/50 rounded-xl p-4 border border-border/40 text-left space-y-2.5">
                    <div className="flex justify-between text-[11px] font-semibold border-b border-border/20 pb-2">
                      <span className="text-muted-foreground uppercase">Broker</span>
                      <span className="text-foreground uppercase">{statusData?.request?.broker}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold border-b border-border/20 pb-2">
                      <span className="text-muted-foreground uppercase">Trading Account</span>
                      <span className="text-foreground">{statusData?.request?.tradingAccountNumber}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground uppercase">Telegram</span>
                      <span className="text-primary">{statusData?.request?.telegramUsername}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                    Review typically takes less than 24 hours. We will grant instant site access as soon as your referral link status is confirmed.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-2 pb-6">
                  <Button
                    onClick={fetchStatus}
                    className="w-full bg-gold-gradient text-background font-bold text-xs uppercase"
                  >
                    Check Status Now
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="w-full hover:bg-destructive/10 hover:text-destructive font-bold text-xs uppercase transition-all"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* CASE 2: Rejected Request */}
          {userStatus === "rejected" && (
            <motion.div
              key="rejected-request"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="bg-card/40 border-destructive/20 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-destructive" />
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-wider text-destructive">
                    Verification Rejected
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground pt-1">
                    We could not verify your trading account under our referral network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 py-2 text-center text-xs">
                  {remarks && (
                    <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/10 text-destructive/90 text-left mb-3">
                      <strong>Admin Note:</strong> {remarks}
                    </div>
                  )}
                  <p className="text-muted-foreground leading-relaxed">
                    Access to TradeTracker Pro is restricted to users who have joined through our YouTube, Instagram, or Telegram referral links.
                  </p>
                  <p className="text-foreground font-semibold">
                    To resolve this, please resubmit correct details below or contact us.
                  </p>
                </CardContent>

                {/* Resubmission form inside rejected view to make it extremely easy to correct */}
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 border-t border-border/40 mt-4">
                  <div className="space-y-1">
                    <Label htmlFor="broker_rej" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Broker Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="broker_rej"
                        placeholder="e.g. Exness, IC Markets"
                        value={formData.broker}
                        onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                        className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="account_rej" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trading Account ID</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="account_rej"
                        placeholder="e.g. 5098234"
                        value={formData.tradingAccountNumber}
                        onChange={(e) => setFormData({ ...formData, tradingAccountNumber: e.target.value })}
                        className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="telegram_rej" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Telegram Username</Label>
                    <div className="relative">
                      <Send className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="telegram_rej"
                        placeholder="e.g. @tradetracker_user"
                        value={formData.telegramUsername}
                        onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                        className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 text-xs h-9"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gold-gradient text-background font-bold text-xs uppercase"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                    Resubmit for Verification
                  </Button>
                </form>

                <CardFooter className="flex flex-col gap-2 pt-2 pb-6 px-6">
                  <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="w-full hover:bg-destructive/10 hover:text-destructive font-bold text-xs uppercase transition-all"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* CASE 3: First Login / Submit Verification form */}
          {!hasRequest && userStatus === "pending" && (
            <motion.div
              key="submit-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="bg-card/40 border-primary/20 backdrop-blur-md relative overflow-hidden gold-glow-subtle">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
                <CardHeader className="text-center pt-8 pb-4">
                  <CardTitle className="text-xl font-black uppercase tracking-wider">
                    Activate Community Portal
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground pt-1">
                    Submit your trading account details to unlock full access.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4 py-4">
                    <div className="space-y-1">
                      <Label htmlFor="broker" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Broker Name
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                        <Input
                          id="broker"
                          placeholder="e.g. Exness, IC Markets"
                          value={formData.broker}
                          onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                          className="pl-9 bg-muted/30 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
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
                          className="pl-9 bg-muted/30 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
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
                          className="pl-9 bg-muted/30 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-2 pb-6">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gold-gradient text-background font-bold text-xs uppercase"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                      Request Verification
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => signOut({ callbackUrl: "/auth/login" })}
                      className="w-full hover:bg-destructive/10 hover:text-destructive font-bold text-xs uppercase transition-all"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
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
