"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Coins,
  Wallet,
  Building,
  Hash,
  DollarSign,
  TrendingUp,
  CreditCard,
  Briefcase,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getBrokerAccounts,
  createBrokerAccount,
  topUpAccount,
} from "@/lib/appwrite/actions";
import SpotlightCard from "@/components/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AccountsDashboardProps {
  userId: string;
}

export function AccountsDashboard({ userId }: AccountsDashboardProps) {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [topUpLoadingId, setTopUpLoadingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    broker_type: "",
    account_id: "",
    balance: "",
  });

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await getBrokerAccounts(userId);
      setAccounts(data);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.broker_type || !formData.account_id || !formData.balance) {
      toast({
        variant: "destructive",
        title: "Required Fields",
        description: "Please fill in all the details.",
      });
      return;
    }

    setIsSubmitLoading(true);
    try {
      const result = await createBrokerAccount({
        broker_type: formData.broker_type,
        account_id: formData.account_id,
        balance: Number.parseFloat(formData.balance),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Account Connected",
        description: `Simulated account ${formData.account_id} created successfully!`,
      });

      setFormData({ broker_type: "", account_id: "", balance: "" });
      setIsDialogOpen(false);
      fetchAccounts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Unable to connect account.",
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleTopUp = async (accountId: string) => {
    setTopUpLoadingId(accountId);
    try {
      const result = await topUpAccount(accountId);
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Top-Up Successful",
        description: "Added $500.00 to your account balance.",
      });

      // Update state locally for instant speed
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? { ...acc, balance: acc.balance + 500, equity: acc.equity + 500 }
            : acc
        )
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Top-up Failed",
        description: error.message || "Unable to top up account.",
      });
    } finally {
      setTopUpLoadingId(null);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="space-y-8">
      {/* Dynamic Gold Statistics Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-card/30 border-primary/20 backdrop-blur-md relative overflow-hidden gold-glow-subtle">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Simulated Net Worth
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-gold-gradient">
                ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                Aggregated balance of MT5 accounts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-card/30 border-border/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Active Accounts
              </CardTitle>
              <Briefcase className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">
                {accounts.length}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                Simulated accounts connected
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-card/30 border-border/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Platform Status
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-emerald-500">
                ACTIVE
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                MT5 Simulation engine operational
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account List / Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Broker Accounts</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Top up and manage connected simulated MT5 accounts
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gold-gradient text-background hover:opacity-90 transition-all font-bold text-xs uppercase px-4"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Account
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Retrieving accounts...
            </p>
          </div>
        ) : accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center border border-dashed border-primary/20 rounded-2xl py-16 text-center space-y-4 bg-card/10 backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Coins className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider">No Accounts Connected</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Add an MT5 account to begin tracking, journaling, and simulating trades.
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gold-gradient text-background font-bold text-xs uppercase px-5"
            >
              Add Your First Account
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {accounts.map((acc, index) => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <SpotlightCard
                    spotlightColor="rgba(197, 168, 128, 0.15)"
                    className="h-full bg-card/30 border-border/50 hover:border-primary/30 transition-all duration-300 relative rounded-xl p-6 flex flex-col justify-between"
                  >
                    <Link href={`/dashboard/${acc.id}`} className="space-y-4 cursor-pointer block hover:opacity-80 transition-opacity">
                      {/* Top row: Broker & Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-primary" />
                          <span className="text-xs font-black uppercase tracking-wider text-primary">
                            {acc.broker_type}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[9px] uppercase font-bold px-1.5 py-0.5"
                        >
                          Simulated
                        </Badge>
                      </div>

                      {/* Middle row: MT5 details & Balance */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                          <Hash className="w-3 h-3" />
                          <span>MT5 ID: {acc.account_id}</span>
                        </div>
                        <div className="pt-2">
                          <span className="text-2xl font-black tracking-tight text-foreground">
                            ${acc.balance.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider ml-1">
                            {acc.currency}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Bottom Actions: Top Up */}
                    <div className="pt-6 border-t border-border/40 mt-4 flex items-center justify-between gap-3">
                      <div className="text-[9px] text-muted-foreground uppercase font-semibold">
                        Last synced: {new Date(acc.last_sync || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleTopUp(acc.id)}
                        disabled={topUpLoadingId === acc.id}
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all font-bold text-xs uppercase"
                      >
                        {topUpLoadingId === acc.id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                        ) : (
                          <DollarSign className="w-3 h-3 mr-0.5" />
                        )}
                        Top Up (+$500)
                      </Button>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-primary/25 text-foreground max-w-sm rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Connect MT5 Account</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add details below to instantiate a new simulated MT5 broker account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="broker_type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Broker Name
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="broker_type"
                  placeholder="e.g. Exness, IC Markets"
                  value={formData.broker_type}
                  onChange={(e) => setFormData({ ...formData, broker_type: e.target.value })}
                  className="pl-9 bg-muted/30 border-primary/20 hover:border-primary/45 transition-all text-sm rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                MT5 Account Number
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="account_id"
                  placeholder="e.g. 5092304"
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                  className="pl-9 bg-muted/30 border-primary/20 hover:border-primary/45 transition-all text-sm rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="balance" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Initial Account Balance ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="balance"
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="pl-9 bg-muted/30 border-primary/20 hover:border-primary/45 transition-all text-sm rounded-lg"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs uppercase font-bold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitLoading}
                className="bg-gold-gradient text-background font-bold text-xs uppercase px-5 rounded-lg"
              >
                {isSubmitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                Connect Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
