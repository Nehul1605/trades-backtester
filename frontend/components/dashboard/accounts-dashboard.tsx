"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Briefcase,
  Loader2,
  GripVertical,
  Layers,
  ShieldAlert,
  Archive,
  Trash2,
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  getBrokerAccounts,
  createBrokerAccount,
  topUpAccount,
  reorderBrokerAccounts,
  archiveBrokerAccount,
  restoreBrokerAccount,
  deleteBrokerAccountPermanent,
} from "@/lib/actions";
import SpotlightCard from "@/components/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AccountsDashboardProps {
  userId: string;
}

const BROKER_OPTIONS = ["XM", "Zuperior", "Exness", "Deriv", "IC Markets", "Other"];
const CFD_PROP_FIRMS = ["Funding Pips", "Alpha Capital Group", "The 5%ers", "FundedNext", "FTMO", "Fintokei", "Other"];
const FUTURES_PROP_FIRMS = ["Lucid Trading", "Tradeify", "Apex Trader Funding", "Topstep", "MyFundedFutures", "FundedNext", "Other"];

export function AccountsDashboard({ userId }: AccountsDashboardProps) {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [topUpLoadingId, setTopUpLoadingId] = useState<string | null>(null);

  // Form State
  const [accountCategory, setAccountCategory] = useState<"broker" | "prop_firm">("broker");
  const [marketType, setMarketType] = useState<"cfd" | "futures">("cfd");
  const [selectedFirm, setSelectedFirm] = useState<string>("XM");
  const [customFirmName, setCustomFirmName] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [balance, setBalance] = useState<string>("10000");

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...accounts];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, moved);

    setAccounts(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    reorderBrokerAccounts(updated.map((a) => a.id)).catch((err) => {
      console.error("Failed to save account order:", err);
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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

  const handleCategoryChange = (category: "broker" | "prop_firm") => {
    setAccountCategory(category);
    if (category === "broker") {
      setSelectedFirm("XM");
    } else {
      setSelectedFirm(marketType === "cfd" ? "Funding Pips" : "Lucid Trading");
    }
  };

  const handleMarketTypeChange = (type: "cfd" | "futures") => {
    setMarketType(type);
    if (accountCategory === "prop_firm") {
      setSelectedFirm(type === "cfd" ? "Funding Pips" : "Lucid Trading");
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalFirmName = selectedFirm === "Other" ? customFirmName.trim() : selectedFirm;

    if (!finalFirmName || !accountId || !balance) {
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
        account_category: accountCategory,
        market_type: accountCategory === "prop_firm" ? marketType : "cfd",
        broker_type: finalFirmName,
        custom_firm_name: selectedFirm === "Other" ? customFirmName.trim() : "",
        account_id: accountId,
        balance: Number.parseFloat(balance),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Account Connected",
        description: `Simulated account ${accountId} created successfully!`,
      });

      setAccountId("");
      setBalance("10000");
      setCustomFirmName("");
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

  const handleTopUp = async (accId: string) => {
    setTopUpLoadingId(accId);
    try {
      const result = await topUpAccount(accId);
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Top-Up Successful",
        description: "Added $500.00 to your account balance.",
      });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accId
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

  // Tab & Archive state
  const [tabView, setTabView] = useState<"active" | "archived">("active");
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null);

  const activeAccounts = accounts.filter((a) => a.status !== "archived");
  const archivedAccounts = accounts.filter((a) => a.status === "archived");

  const handleArchive = async (accId: string) => {
    setArchiveLoadingId(accId);
    try {
      const res = await archiveBrokerAccount(accId);
      if (res.error) throw new Error(res.error);
      toast({
        title: "Account Moved to Archive",
        description: "Account moved to archive section. All trades and stats remain saved.",
      });
      await fetchAccounts();
      setTabView("archived");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Archiving Failed",
        description: err.message || "Could not archive account.",
      });
    } finally {
      setArchiveLoadingId(null);
    }
  };

  const handleRestore = async (accId: string) => {
    setArchiveLoadingId(accId);
    try {
      const res = await restoreBrokerAccount(accId);
      if (res.error) throw new Error(res.error);
      toast({
        title: "Account Restored",
        description: "Account restored back to active accounts.",
      });
      await fetchAccounts();
      setTabView("active");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Restore Failed",
        description: err.message || "Could not restore account.",
      });
    } finally {
      setArchiveLoadingId(null);
    }
  };

  const handleDeletePermanent = async (accId: string) => {
    if (!confirm("Are you sure you want to permanently delete this account? All associated records will be lost.")) return;
    setArchiveLoadingId(accId);
    try {
      const res = await deleteBrokerAccountPermanent(accId);
      if (res.error) throw new Error(res.error);
      toast({
        title: "Account Deleted",
        description: "Account permanently removed.",
      });
      fetchAccounts();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "Could not delete account.",
      });
    } finally {
      setArchiveLoadingId(null);
    }
  };

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

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
                {activeAccounts.length}
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

      {/* Account List Header & Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Broker Accounts</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Manage active workspaces, top up funds, or view archived accounts history
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setTabView("active")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer",
                  tabView === "active"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Active ({activeAccounts.length})
              </button>
              <button
                type="button"
                onClick={() => setTabView("archived")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer",
                  tabView === "archived"
                    ? "bg-amber-500 text-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Archive className="w-3.5 h-3.5" />
                Archived ({archivedAccounts.length})
              </button>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gold-gradient text-background hover:opacity-90 transition-all font-bold text-xs uppercase px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Account
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Retrieving accounts...
            </p>
          </div>
        ) : tabView === "active" ? (
          /* Active Accounts Tab */
          activeAccounts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center border border-dashed border-primary/20 rounded-2xl py-16 text-center space-y-4 bg-card/10 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider">No Active Accounts</h3>
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
                {activeAccounts.map((acc, index) => {
                  const displayName = acc.custom_firm_name || acc.broker_type;
                  const isPropFirm = acc.account_category === "prop_firm";

                  return (
                    <motion.div
                      key={acc.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "h-full transition-all duration-200 cursor-grab active:cursor-grabbing",
                        draggedIndex === index && "opacity-40 scale-95 border-dashed border-primary/50",
                        dragOverIndex === index && "ring-2 ring-primary/60 border-primary rounded-xl scale-[1.02] shadow-lg"
                      )}
                    >
                      <SpotlightCard
                        spotlightColor="rgba(197, 168, 128, 0.15)"
                        className="h-full bg-card/30 border-border/50 hover:border-primary/40 transition-all duration-300 relative rounded-xl p-6 flex flex-col justify-between"
                      >
                        {/* Drag & Action Icons in Header */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            title="Delete / Archive Account"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetId = acc.id || acc.$id || acc._id;
                              handleArchive(targetId);
                            }}
                            disabled={archiveLoadingId === (acc.id || acc.$id || acc._id)}
                            className="text-muted-foreground/50 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            {archiveLoadingId === acc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <div className="text-muted-foreground/40 hover:text-primary transition-colors p-1.5 rounded cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </div>

                        <Link href={`/dashboard/${acc.id}`} className="space-y-4 cursor-pointer block hover:opacity-80 transition-opacity pr-12">
                          {/* Top row: Broker/Firm Name & Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Building className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-xs font-black uppercase tracking-wider text-primary truncate">
                                {displayName}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] uppercase font-bold px-1.5 py-0.5 shrink-0",
                                isPropFirm
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-500 border-blue-500/30"
                              )}
                            >
                              {isPropFirm ? `Prop (${(acc.market_type || "cfd").toUpperCase()})` : "Broker"}
                            </Badge>
                          </div>

                          {/* Middle row: MT5 details & Balance */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                              <Hash className="w-3 h-3" />
                              <span>Account ID: {acc.account_id}</span>
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

                        {/* Bottom Actions: Delete & Top Up */}
                        <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetId = acc.id || acc.$id || acc._id;
                              if (confirm("Move this account to Archive? All trades, stats & balance history will remain preserved.")) {
                                handleArchive(targetId);
                              }
                            }}
                            disabled={archiveLoadingId === (acc.id || acc.$id || acc._id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all font-bold text-xs uppercase"
                          >
                            {archiveLoadingId === (acc.id || acc.$id || acc._id) ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="w-3 h-3 mr-1" />
                            )}
                            Delete
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleTopUp(acc.id || acc.$id || acc._id)}
                            disabled={topUpLoadingId === (acc.id || acc.$id || acc._id)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all font-bold text-xs uppercase"
                          >
                            {topUpLoadingId === (acc.id || acc.$id || acc._id) ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                            ) : (
                              <DollarSign className="w-3 h-3 mr-0.5" />
                            )}
                            Top Up (+$500)
                          </Button>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )
        ) : (
          /* Archived Accounts Tab */
          archivedAccounts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center border border-dashed border-amber-500/20 rounded-2xl py-16 text-center space-y-4 bg-amber-500/5 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Archive className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">No Archived Accounts</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  When you delete an account, it moves here so you can still view all its past trades, equity curves, and P&L history.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {archivedAccounts.map((acc, index) => {
                  const displayName = acc.custom_firm_name || acc.broker_type;
                  const isPropFirm = acc.account_category === "prop_firm";

                  return (
                    <motion.div
                      key={acc.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="h-full"
                    >
                      <SpotlightCard
                        spotlightColor="rgba(245, 158, 11, 0.15)"
                        className="h-full bg-card/20 border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 relative rounded-xl p-6 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Header row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Building className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-xs font-black uppercase tracking-wider text-amber-400 truncate">
                                {displayName}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/30"
                            >
                              ARCHIVED
                            </Badge>
                          </div>

                          {/* Account info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                              <Hash className="w-3 h-3" />
                              <span>Account ID: {acc.account_id}</span>
                            </div>
                            <div className="pt-2">
                              <span className="text-2xl font-black tracking-tight text-foreground/80">
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
                        </div>

                        {/* Actions for Archived Account */}
                        <div className="pt-6 border-t border-border/40 mt-4 space-y-2">
                          <Link href={`/dashboard/${acc.id || acc.$id || acc._id}`} className="w-full block">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs font-bold uppercase bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" /> View Full Account
                            </Button>
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestore(acc.id || acc.$id || acc._id)}
                              disabled={archiveLoadingId === (acc.id || acc.$id || acc._id)}
                              className="text-[11px] font-bold uppercase border-border/60 hover:bg-muted"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePermanent(acc.id || acc.$id || acc._id)}
                              disabled={archiveLoadingId === (acc.id || acc.$id || acc._id)}
                              className="text-[11px] font-bold uppercase bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )
        )}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-primary/25 text-foreground max-w-md rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Connect Account</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose your account type and firm details to connect a new trading account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="space-y-4 py-2">
            {/* Step 1: Account Category Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Category
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={accountCategory === "broker" ? "default" : "outline"}
                  className={cn(
                    "h-10 text-xs font-bold transition-all",
                    accountCategory === "broker"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={() => handleCategoryChange("broker")}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Broker Account
                </Button>
                <Button
                  type="button"
                  variant={accountCategory === "prop_firm" ? "default" : "outline"}
                  className={cn(
                    "h-10 text-xs font-bold transition-all",
                    accountCategory === "prop_firm"
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      : "hover:bg-amber-500/10 hover:text-amber-500"
                  )}
                  onClick={() => handleCategoryChange("prop_firm")}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Prop Firm Account
                </Button>
              </div>
            </div>

            {/* Step 2: Prop Firm Sub-Category (CFD vs Futures) */}
            {accountCategory === "prop_firm" && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Prop Firm Market Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={marketType === "cfd" ? "default" : "outline"}
                    className={cn(
                      "h-9 text-xs font-semibold rounded-lg transition-all",
                      marketType === "cfd"
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "hover:bg-muted text-muted-foreground"
                    )}
                    onClick={() => handleMarketTypeChange("cfd")}
                  >
                    CFD
                  </Button>
                  <Button
                    type="button"
                    variant={marketType === "futures" ? "default" : "outline"}
                    className={cn(
                      "h-9 text-xs font-semibold rounded-lg transition-all",
                      marketType === "futures"
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "hover:bg-muted text-muted-foreground"
                    )}
                    onClick={() => handleMarketTypeChange("futures")}
                  >
                    Futures
                  </Button>
                </div>
              </div>
            )}

            {/* Firm Dropdown Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {accountCategory === "broker" ? "Broker Name" : `Prop Firm (${marketType.toUpperCase()})`}
              </Label>
              <select
                value={selectedFirm}
                onChange={(e) => setSelectedFirm(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-primary/20 text-foreground text-sm focus:outline-hidden focus:border-primary/60 transition-all font-medium"
              >
                {accountCategory === "broker"
                  ? BROKER_OPTIONS.map((item) => (
                      <option key={item} value={item} className="bg-card text-foreground">
                        {item}
                      </option>
                    ))
                  : marketType === "cfd"
                  ? CFD_PROP_FIRMS.map((item) => (
                      <option key={item} value={item} className="bg-card text-foreground">
                        {item}
                      </option>
                    ))
                  : FUTURES_PROP_FIRMS.map((item) => (
                      <option key={item} value={item} className="bg-card text-foreground">
                        {item}
                      </option>
                    ))}
              </select>
            </div>

            {/* Custom Firm Name (If "Other" selected) */}
            {selectedFirm === "Other" && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="custom_firm" className="text-xs font-bold uppercase tracking-wider text-primary">
                  Enter {accountCategory === "broker" ? "Broker" : "Prop Firm"} Name
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                  <Input
                    id="custom_firm"
                    placeholder={accountCategory === "broker" ? "e.g. Pepperstone" : "e.g. MyPropFirm"}
                    value={customFirmName}
                    onChange={(e) => setCustomFirmName(e.target.value)}
                    className="pl-9 bg-muted/30 border-primary/40 focus:border-primary text-sm rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Account ID / Number */}
            <div className="space-y-1.5">
              <Label htmlFor="account_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Number / ID
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="account_id"
                  placeholder="e.g. 5092304"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="pl-9 bg-muted/30 border-primary/20 hover:border-primary/45 transition-all text-sm rounded-lg"
                />
              </div>
            </div>

            {/* Initial Balance */}
            <div className="space-y-1.5">
              <Label htmlFor="balance" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Initial Account Balance ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="balance"
                  type="number"
                  placeholder="e.g. 10000"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
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
