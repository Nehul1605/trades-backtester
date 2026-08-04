"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  Coins,
  Shield,
  Plus,
  X,
  Mail,
  User,
  Calendar,
  Calculator,
  Percent,
  Settings,
  HelpCircle,
  TrendingUp,
  Table2,
  RefreshCw,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  Wallet,
  CheckCircle2,
  UserCheck,
  Scale,
  Sparkles,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface BrokerAccount {
  id: string;
  name: string;
  mt5Id: string;
  balance: number;
  lastSynced: string;
  provider: "XM" | "WINPRO FX" | "EXNESS" | "FOREX.COM";
}

const INITIAL_ACCOUNTS: BrokerAccount[] = [
  { id: "xm", name: "XM GLOBAL", mt5Id: "54645454424", balance: 674.00, lastSynced: "20:43", provider: "XM" },
  { id: "winpro", name: "WINPRO FX", mt5Id: "129357", balance: 876.00, lastSynced: "17:35", provider: "WINPRO FX" }
];

export function InteractiveDashboardMockup() {
  // Navigation states
  const [currentNav, setCurrentNav] = useState<
    "Dashboard" | "LiveStream" | "EconomicCalendar" | "PLCalc" | "ConsistencyCalc" | "Settings" | "Help"
  >("Dashboard");

  // Dashboard Data State
  const [accounts, setAccounts] = useState<BrokerAccount[]>(INITIAL_ACCOUNTS);

  // Settings profile state (Guest User default)
  const [profileName, setProfileName] = useState("Guest Trader");
  const [profileEmail, setProfileEmail] = useState("guest@tradetrackerpro.in");

  // Modals
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // Add Account Form
  const [newAccName, setNewAccName] = useState("");
  const [newAccBroker, setNewAccBroker] = useState<"XM" | "WINPRO FX" | "EXNESS" | "FOREX.COM">("EXNESS");
  const [newAccId, setNewAccId] = useState("");
  const [newAccBalance, setNewAccBalance] = useState(1000);

  // ── 1. Interactive P&L Calculator State ──
  const [plSymbol, setPlSymbol] = useState<"XAUUSD" | "EURUSD" | "GBPUSD">("XAUUSD");
  const [plDirection, setPlDirection] = useState<"long" | "short">("long");
  const [plEntryPrice, setPlEntryPrice] = useState("2400");
  const [plExitPrice, setPlExitPrice] = useState("2420");
  const [plQuantity, setPlQuantity] = useState("10");

  // ── 2. Interactive Consistency Calculator State ──
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [targetPercent, setTargetPercent] = useState<number>(8);
  const [targetAmountInput, setTargetAmountInput] = useState<string>("8000");
  const [consistencyPercent, setConsistencyPercent] = useState<number>(33);

  // Sync P&L defaults based on symbol selection
  useEffect(() => {
    if (plSymbol === "XAUUSD") {
      setPlEntryPrice("2400");
      setPlExitPrice("2420");
      setPlQuantity("10");
    } else {
      setPlEntryPrice("1.0900");
      setPlExitPrice("1.1000");
      setPlQuantity("1");
    }
  }, [plSymbol]);

  // Interactive P&L calculation logic
  const plReport = useMemo(() => {
    const entry = parseFloat(plEntryPrice);
    const exit = parseFloat(plExitPrice);
    const qty = parseFloat(plQuantity);

    if (isNaN(entry) || isNaN(exit) || isNaN(qty) || qty <= 0) return null;

    const isLong = plDirection === "long";
    const multiplier = plSymbol === "XAUUSD" ? 100 : 100000;
    
    const pnl = (exit - entry) * qty * multiplier * (isLong ? 1 : -1);
    const positionSize = entry * qty * multiplier;
    const pnlPercent = positionSize > 0 ? (pnl / positionSize) * 100 : 0;
    const targetResult = exit * qty * multiplier;

    return {
      pnl,
      positionSize,
      pnlPercent,
      targetResult
    };
  }, [plSymbol, plDirection, plEntryPrice, plExitPrice, plQuantity]);

  // Interactive Consistency calculation logic
  const targetAmount = useMemo(() => {
    const val = parseFloat(targetAmountInput);
    return isNaN(val) ? 0 : val;
  }, [targetAmountInput]);

  const maxDailyProfit = useMemo(() => {
    return targetAmount * (consistencyPercent / 100);
  }, [targetAmount, consistencyPercent]);

  const minTradingDays = useMemo(() => {
    if (consistencyPercent <= 0) return 1;
    return Math.ceil(100 / consistencyPercent);
  }, [consistencyPercent]);

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

  // Simulated Net Worth Calculation
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  // Handle resets
  const handleResetSandbox = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setCurrentNav("Dashboard");
    setProfileName("Guest Trader");
    setProfileEmail("guest@tradetrackerpro.in");
    setPlSymbol("XAUUSD");
    setPlDirection("long");
    setAccountSize(100000);
    setTargetPercent(8);
    setTargetAmountInput("8000");
    setConsistencyPercent(33);
    toast.success("Guest sandbox environment refreshed!");
  };

  // Top up broker account balance
  const handleTopUp = (accountId: string, amount: number = 500) => {
    setAccounts(
      accounts.map((acc) => {
        if (acc.id === accountId) {
          toast.success(`Deposited +$${amount} to ${acc.name}!`);
          return {
            ...acc,
            balance: acc.balance + amount,
            lastSynced: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
        }
        return acc;
      })
    );
  };

  // Create new broker account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccId.trim()) {
      toast.error("Please insert broker name & account ID.");
      return;
    }
    const newAcc: BrokerAccount = {
      id: `acc-${Date.now()}`,
      name: newAccName.toUpperCase(),
      mt5Id: newAccId,
      balance: newAccBalance,
      lastSynced: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider: newAccBroker
    };
    setAccounts([...accounts, newAcc]);
    setShowAddAccountModal(false);
    setNewAccName("");
    setNewAccId("");
    setNewAccBalance(1000);
    toast.success(`Simulated account ${newAcc.name} connected successfully!`);
  };

  return (
    <div className="relative group">
      {/* Dynamic backdrop shadow gradient glow */}
      <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#d4b795]/10 via-[#d4b795]/5 to-transparent blur-3xl opacity-60 pointer-events-none" />

      {/* Main Sandbox Browser Container */}
      <div className="relative rounded-2xl border border-border/40 bg-[#080809] shadow-2xl flex flex-col h-[650px] md:h-[600px] overflow-hidden transition-all duration-300 text-left font-sans text-foreground">
        
        {/* Title Bar Chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10 bg-[#0f1012] shrink-0 select-none">
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" />
          </div>

          <div className="flex-1 mx-3 md:mx-6 h-5 rounded-md bg-[#080809] flex items-center justify-center max-w-sm border border-border/10">
            <span className="text-[9px] md:text-[10px] text-muted-foreground/60 font-mono flex items-center gap-1 select-all truncate">
              <span className="text-emerald-500">🔒</span>
              tradetrackerpro.in/sandbox/guest
            </span>
          </div>

          <button
            onClick={handleResetSandbox}
            className="text-[9px] text-[#d4b795] bg-[#d4b795]/5 hover:bg-[#d4b795]/10 hover:text-[#e4c7a5] px-2 py-0.5 md:px-2.5 md:py-1 rounded-md border border-[#d4b795]/20 flex items-center gap-1 font-mono transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shrink-0"
            title="Reset Sandbox"
          >
            <RefreshCw className="w-2 h-2 md:w-2.5 md:h-2.5" />
            Reset
          </button>
        </div>

        {/* Dashboard Workspace */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          
          {/* ── Left Sidebar (Collapsible on Mobile) ── */}
          <div className="w-12 md:w-[185px] border-r border-border/10 bg-[#0f1012] flex flex-col shrink-0 overflow-y-auto select-none transition-all duration-300">
            
            {/* User Profile Card (Desktop Only) */}
            <div className="hidden md:flex p-4 border-b border-border/10 flex-col items-center text-center gap-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-[#d4b795] to-amber-500 blur-xs opacity-75" />
                <div className="relative w-11 h-11 rounded-full bg-[#17181b] border border-border/20 flex items-center justify-center text-[#d4b795] font-bold text-sm font-mono shadow-inner">
                  G
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f1012]" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-foreground flex items-center justify-center gap-1">
                  {profileName} 
                  <span className="text-[8px] bg-[#d4b795]/10 text-[#d4b795] px-1 py-0.5 rounded font-mono font-bold scale-90 tracking-wider">DEMO</span>
                </div>
                <div className="text-[9px] text-muted-foreground/60 truncate max-w-[155px] font-mono">
                  {profileEmail}
                </div>
              </div>
            </div>

            {/* Mode switch (Desktop Only) */}
            <div className="hidden md:block px-3 py-2 border-b border-border/10">
              <div className="w-full py-1.5 rounded-lg bg-[#d4b795]/5 border border-[#d4b795]/20 text-center text-[9px] font-bold text-[#d4b795] uppercase tracking-widest flex items-center justify-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Mode: Sandbox Guest
              </div>
            </div>

            {/* Menu Group 1: Core Platform */}
            <div className="p-2 md:p-3 space-y-2">
              <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 block pl-2">
                Core Platform
              </span>
              <div className="space-y-2.5 md:space-y-1 flex flex-col items-center md:items-stretch">
                {[
                  { id: "Dashboard", label: "Dashboard Console", icon: LayoutDashboard },
                  { id: "LiveStream", label: "Live Market Stream", icon: Zap },
                  { id: "EconomicCalendar", label: "Economic Calendar", icon: Calendar }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentNav(item.id as any);
                      }}
                      className={`w-8 h-8 md:w-full md:h-8 md:pl-2.5 rounded-lg flex items-center justify-center md:justify-start gap-2 text-xs transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-[#d4b795]/10 text-[#d4b795] font-semibold border-l-2 border-[#d4b795] shadow-xs"
                          : "text-muted-foreground/75 hover:text-foreground hover:bg-[#151619]"
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 md:w-3.5 md:h-3.5 shrink-0 ${isActive ? "text-[#d4b795]" : "text-muted-foreground/50"}`} />
                      <span className="hidden md:block truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Group 2: Trading Tools */}
            <div className="p-2 md:p-3 space-y-2 pt-0">
              <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 block pl-2">
                Trading Tools
              </span>
              <div className="space-y-2.5 md:space-y-1 flex flex-col items-center md:items-stretch">
                {[
                  { id: "PLCalc", label: "P&L Calculator", icon: Calculator },
                  { id: "ConsistencyCalc", label: "Consistency Calculator", icon: Percent }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentNav(item.id as any);
                      }}
                      className={`w-8 h-8 md:w-full md:h-8 md:pl-2.5 rounded-lg flex items-center justify-center md:justify-start gap-2 text-xs transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-[#d4b795]/10 text-[#d4b795] font-semibold border-l-2 border-[#d4b795] shadow-xs"
                          : "text-muted-foreground/75 hover:text-foreground hover:bg-[#151619]"
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 md:w-3.5 md:h-3.5 shrink-0 ${isActive ? "text-[#d4b795]" : "text-muted-foreground/50"}`} />
                      <span className="hidden md:block truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Group 3: Support */}
            <div className="p-2 md:p-3 space-y-2 pt-0 mt-auto border-t border-border/10 bg-[#0c0d0e]/50">
              <div className="space-y-2.5 md:space-y-1 flex flex-col items-center md:items-stretch">
                {[
                  { id: "Settings", label: "Profile Customizer", icon: Settings },
                  { id: "Help", label: "Help & Support", icon: HelpCircle }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentNav(item.id as any);
                      }}
                      className={`w-8 h-8 md:w-full md:h-8 md:pl-2.5 rounded-lg flex items-center justify-center md:justify-start gap-2 text-xs transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-[#d4b795]/10 text-[#d4b795] font-semibold border-l-2 border-[#d4b795]"
                          : "text-muted-foreground/75 hover:text-foreground hover:bg-[#151619]"
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 md:w-3.5 md:h-3.5 shrink-0 ${isActive ? "text-[#d4b795]" : "text-muted-foreground/50"}`} />
                      <span className="hidden md:block truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── Main Viewport Content Area ── */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#070808] relative">
            
            {/* Nav 1: MAIN DASHBOARD CONSOLE (Accounts Hub Only) */}
            {currentNav === "Dashboard" && (
              <div className="space-y-5 md:space-y-6 animate-in fade-in duration-250">
                
                {/* Hub header */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                      Accounts Hub
                    </h2>
                    <p className="text-[10px] font-mono tracking-widest text-[#d4b795]/70 uppercase">
                      SIMULATED BROKER TERMINALS
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddAccountModal(true)}
                    className="h-8.5 px-4 rounded-xl bg-[#d4b795] hover:bg-[#c4a684] text-black text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-[#d4b795]/10 cursor-pointer w-full sm:w-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-black" /> Add Account
                  </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  
                  {/* Net Worth Card (Gold border and glow) */}
                  <div className="rounded-xl border border-[#d4b795]/20 bg-[#121315]/40 p-3.5 md:p-4 border-t-2 border-t-[#d4b795] flex flex-col justify-between h-24 md:h-28 relative overflow-hidden shadow-md shadow-[#d4b795]/2 group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4b795]/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex justify-between items-center text-muted-foreground/60">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">Simulated Net Worth</span>
                      <Coins className="w-3.5 h-3.5 text-[#d4b795]" />
                    </div>
                    <div className="text-xl md:text-2xl font-bold font-mono text-[#d4b795] mt-1 relative z-10">
                      ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[8px] text-muted-foreground/50 tracking-wide uppercase">Aggregated Balance</span>
                  </div>

                  {/* Active Accounts Card */}
                  <div className="rounded-xl border border-border/20 bg-[#121315]/40 p-3.5 md:p-4 flex flex-col justify-between h-24 md:h-28 shadow-sm">
                    <div className="flex justify-between items-center text-muted-foreground/60">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">Active Terminals</span>
                      <Wallet className="w-3.5 h-3.5 text-muted-foreground/45" />
                    </div>
                    <div className="text-xl md:text-2xl font-bold font-mono text-foreground mt-1">
                      {accounts.length}
                    </div>
                    <span className="text-[8px] text-muted-foreground/50 tracking-wide uppercase">Simulated accounts connected</span>
                  </div>

                  {/* Platform Status Card */}
                  <div className="rounded-xl border border-border/20 bg-[#121315]/40 p-3.5 md:p-4 flex flex-col justify-between h-24 md:h-28 shadow-sm">
                    <div className="flex justify-between items-center text-muted-foreground/60">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">Simulation Core</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                    </div>
                    <div className="text-sm md:text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ONLINE
                    </div>
                    <span className="text-[8px] text-muted-foreground/50 tracking-wide uppercase">MT5 Simulation Active</span>
                  </div>

                </div>

                {/* Section Header: Broker list */}
                <div className="space-y-1 border-b border-border/10 pb-2">
                  <h3 className="text-xs md:text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Broker Terminals Dashboard Reference
                  </h3>
                  <p className="text-[10px] text-muted-foreground/60">Review active simulated broker connections and perform deposits</p>
                </div>

                {/* Account cards grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="rounded-xl border border-border/20 bg-[#101113]/30 p-4 md:p-5 hover:border-[#d4b795]/30 hover:bg-[#131417]/40 hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col gap-3 shadow-sm group/card"
                    >
                      <div className="flex justify-between items-start">
                        {/* Left details */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground group-hover/card:text-[#d4b795] transition-colors">{acc.name}</span>
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1 py-0.5 rounded font-mono font-bold scale-90 uppercase">Terminal</span>
                          </div>
                          <div className="text-[9px] text-muted-foreground/60 font-mono">MT5 ID: {acc.mt5Id}</div>
                        </div>
                      </div>

                      <div className="text-xl md:text-2xl font-bold font-mono text-foreground tracking-tight py-0.5">
                        ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px] font-sans text-muted-foreground/65 font-normal">USD</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/10 pt-2.5">
                        <span className="text-[8px] text-muted-foreground/40 font-mono uppercase">SYNCED: {acc.lastSynced}</span>
                        <button
                          onClick={() => handleTopUp(acc.id, 500)}
                          className="text-[9px] text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all font-semibold active:scale-95 cursor-pointer"
                        >
                          <DollarSign className="w-2.5 h-2.5 text-[#d4b795]" /> Deposit +$500
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Nav 2: LIVE STREAM */}
            {currentNav === "LiveStream" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground/85 uppercase tracking-wider">Live Market stream</h3>
                  <p className="text-[11px] text-muted-foreground">Synchronize with active Gold & Forex streams in real time.</p>
                </div>
                
                <div className="border border-border/20 rounded-xl bg-[#121315]/10 p-6 md:p-10 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden h-[380px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,183,149,0.05),transparent)] animate-pulse" />
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary relative z-10 animate-bounce">
                    <Zap className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h4 className="text-xs md:text-sm font-bold text-foreground">No Live Broadcast in Session</h4>
                    <p className="text-[11px] md:text-xs text-muted-foreground/70 max-w-sm mx-auto leading-relaxed">
                      Admin broadcasts are scheduled daily during London & New York overlaps. Connect your broker account to receive email notifications when sessions begin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav 3: ECONOMIC CALENDAR */}
            {currentNav === "EconomicCalendar" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-foreground/85 uppercase tracking-wider">Economic calendar</h3>
                <div className="border border-border/20 rounded-xl bg-[#121315]/10 p-6 md:p-10 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden h-[380px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,183,149,0.05),transparent)] animate-pulse" />
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#d4b795]/10 flex items-center justify-center text-[#d4b795] relative z-10 animate-pulse">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h4 className="text-xs md:text-sm font-bold text-foreground">Economic Calendar Coming Soon</h4>
                    <p className="text-[11px] md:text-xs text-muted-foreground/70 max-w-sm mx-auto leading-relaxed">
                      We are integrating global economic news feeds directly into your terminal workspace. Stay tuned for real-time impact alerts.
                    </p>
                    <span className="inline-block text-[8px] bg-primary/10 text-primary border border-primary/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider mt-1">Under Development</span>
                  </div>
                </div>
              </div>
            )}

            {/* Nav 4: P&L CALCULATOR */}
            {currentNav === "PLCalc" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-foreground/85 uppercase tracking-wider">P&L Calculator</h3>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  
                  {/* Inputs */}
                  <div className="lg:col-span-6 space-y-3.5 p-4 rounded-xl border border-border/20 bg-[#121315]/20">
                    <span className="text-[9px] text-[#d4b795] font-bold uppercase tracking-wider block border-b border-[#d4b795]/10 pb-1.5">Calculator parameters</span>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-foreground uppercase font-bold">Instrument</label>
                      <select
                        value={plSymbol}
                        onChange={(e) => setPlSymbol(e.target.value as any)}
                        className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground focus:outline-none focus:border-[#d4b795]"
                      >
                        <option value="XAUUSD">XAUUSD (Gold)</option>
                        <option value="EURUSD">EURUSD</option>
                        <option value="GBPUSD">GBPUSD</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-foreground uppercase font-bold">Direction</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPlDirection("long")}
                          className={`py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            plDirection === "long"
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-[#080809] border-border/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <ArrowUpRight className="w-3 h-3" /> Buy (Long)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlDirection("short")}
                          className={`py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            plDirection === "short"
                              ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                              : "bg-[#080809] border-border/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <ArrowDownRight className="w-3 h-3" /> Sell (Short)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground uppercase font-bold">Entry Price</label>
                        <input
                          type="number"
                          value={plEntryPrice}
                          onChange={(e) => setPlEntryPrice(e.target.value)}
                          className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground font-mono focus:outline-none focus:border-[#d4b795]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground uppercase font-bold">Exit Price</label>
                        <input
                          type="number"
                          value={plExitPrice}
                          onChange={(e) => setPlExitPrice(e.target.value)}
                          className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground font-mono focus:outline-none focus:border-[#d4b795]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-foreground uppercase font-bold">Quantity (Lots)</label>
                      <input
                        type="number"
                        value={plQuantity}
                        onChange={(e) => setPlQuantity(e.target.value)}
                        className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground font-mono focus:outline-none focus:border-[#d4b795]"
                      />
                    </div>

                  </div>
                  
                  {/* Output Report */}
                  <div className="lg:col-span-6 p-4 rounded-xl border border-border/20 bg-[#121315]/20 flex flex-col justify-between h-full relative overflow-hidden shadow-inner min-h-[180px]">
                    <span className="text-[9px] text-[#d4b795] uppercase font-bold tracking-widest block border-b border-[#d4b795]/10 pb-1.5">Calculation report</span>
                    
                    {plReport ? (
                      <div className="space-y-3.5 my-auto py-2">
                        <div className="p-3 border rounded-xl bg-[#080809]/40 border-border/10 space-y-1">
                          <span className="text-[8px] text-muted-foreground uppercase">Estimated Profit / Loss</span>
                          <div className={`text-xl md:text-2xl font-bold font-mono ${plReport.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {plReport.pnl >= 0 ? "+" : ""}${plReport.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-mono">
                          <div className="p-2 rounded bg-[#080809]/20 border border-border/5">
                            <span className="text-[8px] text-muted-foreground block uppercase font-sans">Position Value</span>
                            <span className="text-foreground font-bold">${plReport.positionSize.toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded bg-[#080809]/20 border border-border/5">
                            <span className="text-[8px] text-muted-foreground block uppercase font-sans">Percent return</span>
                            <span className={`font-bold ${plReport.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {plReport.pnl >= 0 ? "+" : ""}{plReport.pnlPercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground/40 text-center my-auto">Awaiting parameters...</div>
                    )}

                    <div className="text-[8px] text-muted-foreground/35 leading-tight uppercase font-semibold border-t border-border/10 pt-2 flex gap-1.5">
                      <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Standard contract values computed in USD. Spreads excluded.</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Nav 5: CONSISTENCY CALCULATOR */}
            {currentNav === "ConsistencyCalc" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-foreground/85 uppercase tracking-wider">Consistency Calculator</h3>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  
                  {/* Inputs */}
                  <div className="lg:col-span-6 space-y-3.5 p-4 rounded-xl border border-border/20 bg-[#121315]/20">
                    <span className="text-[9px] text-[#d4b795] font-bold uppercase tracking-wider block border-b border-[#d4b795]/10 pb-1.5">Calculator parameters</span>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-bold">
                        <label>Account Size ($)</label>
                        <span className="font-mono text-[#d4b795]">${accountSize.toLocaleString()}</span>
                      </div>
                      <input
                        type="number"
                        value={accountSize || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAccountSize(val);
                          setTargetAmountInput((val * (targetPercent / 100)).toString());
                        }}
                        className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground font-mono focus:outline-none focus:border-[#d4b795]"
                      />
                      {/* Presets */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[10000, 25000, 50000, 100000, 200000].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleAccountSizeSelect(sz)}
                            className={`px-2 py-0.5 rounded text-[8px] border transition-all cursor-pointer font-bold ${
                              accountSize === sz
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-[#080809] border-border/20 text-muted-foreground"
                            }`}
                          >
                            ${sz / 1000}k
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-bold">
                        <label>Profit Target ($)</label>
                        <span className="font-mono text-[#d4b795]">{targetPercent}% Target</span>
                      </div>
                      <input
                        type="number"
                        value={targetAmountInput}
                        onChange={(e) => handleTargetAmountChange(e.target.value)}
                        className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground font-mono focus:outline-none"
                      />
                      {/* Target Presets */}
                      <div className="flex gap-1 pt-1">
                        {[8, 10, 12, 15].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleTargetPercentSelect(pct)}
                            className={`px-2 py-0.5 rounded text-[8px] border transition-all cursor-pointer font-bold ${
                              targetPercent === pct
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-[#080809] border-border/20 text-muted-foreground"
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-bold">
                        <label>Consistency rule (%)</label>
                        <span className="font-mono text-[#d4b795]">{consistencyPercent}% Rule</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <input
                          type="range"
                          min="10"
                          max="60"
                          value={consistencyPercent}
                          onChange={(e) => setConsistencyPercent(parseInt(e.target.value))}
                          className="flex-1 accent-primary h-1 bg-border/20 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          value={consistencyPercent}
                          onChange={(e) => setConsistencyPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-10 text-center h-6.5 rounded bg-[#080809] border border-border/30 text-[9px] font-bold"
                        />
                      </div>
                    </div>

                  </div>
                  
                  {/* Outputs */}
                  <div className="lg:col-span-6 p-4 rounded-xl border border-border/20 bg-[#121315]/20 flex flex-col justify-between h-full relative overflow-hidden shadow-inner min-h-[160px]">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block border-b border-border/10 pb-1.5">Consistency limits</span>
                    
                    <div className="space-y-3.5 my-auto py-2 text-center font-mono">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">Max Profit In Single Day</span>
                        <div className="text-xl md:text-2xl font-bold text-[#d4b795] mt-1">
                          ${maxDailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="border-t border-border/10 pt-2.5">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">Min Trading Days Required</span>
                        <div className="text-lg md:text-xl font-bold text-foreground mt-1">
                          {minTradingDays} Days
                        </div>
                      </div>
                    </div>

                    <div className="text-[8px] text-muted-foreground/35 leading-tight uppercase font-semibold border-t border-border/10 pt-2 flex gap-1.5">
                      <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Stay compliant with funding regulations (e.g. Funding Pips consistency limit rules).</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Nav 6: SETTINGS */}
            {currentNav === "Settings" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-foreground/85 uppercase tracking-wider">Profile Customizer</h3>
                <div className="p-5 rounded-xl border border-border/20 bg-background/50 space-y-4 shadow-sm">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">Modify Demo Profile Information</span>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-8 px-3 text-xs rounded-lg bg-background border border-border/30 text-foreground focus:outline-none focus:border-[#d4b795] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full h-8 px-3 text-xs rounded-lg bg-background border border-border/30 text-foreground focus:outline-none focus:border-[#d4b795] transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Nav 7: HELP TICKET */}
            {currentNav === "Help" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-foreground/85 uppercase tracking-wider">Help & Support Desk</h3>
                <div className="p-6 border border-border/20 bg-background/40 rounded-xl flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground">Need Technical Assistance?</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      Submit support inquiries directly using our support modal in the footer of the site, or email us at tradetrackerpro.in@gmail.com.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── MODAL 1: ADD ACCOUNT ── */}
      {showAddAccountModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAccount} className="bg-[#0f1012] border border-border/40 rounded-2xl p-5 w-full max-w-xs flex flex-col gap-4 relative animate-in zoom-in-95 duration-250 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowAddAccountModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#d4b795] border-b border-border/10 pb-2">Connect Broker Terminal</h3>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Broker / Account Name</label>
              <input
                type="text"
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                placeholder="EXNESS GLOBAL"
                className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-[#d4b795]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">MT5 Account ID</label>
              <input
                type="text"
                value={newAccId}
                onChange={(e) => setNewAccId(e.target.value)}
                placeholder="54645454"
                className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-[#d4b795] font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Initial Account Deposit ($)</label>
              <input
                type="number"
                value={newAccBalance}
                onChange={(e) => setNewAccBalance(Number(e.target.value))}
                className="w-full h-8.5 px-3 text-xs rounded-lg bg-[#080809] border border-border/30 text-foreground focus:outline-none focus:border-[#d4b795] font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-8.5 mt-1.5 rounded-lg bg-[#d4b795] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#c4a684] active:scale-95 transition-all cursor-pointer shadow-md shadow-[#d4b795]/10"
            >
              Connect MT5 Terminal
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
