"use client";

import { useEffect, useState } from "react";
import { getBrokerAccounts } from "@/lib/appwrite/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Terminal, 
  ArrowRight, 
  Wallet, 
  History, 
  TrendingUp, 
  Settings2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Info
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function IntegrationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnectedExness, setIsConnectedExness] = useState(false);
  const [isConnectedMT5, setIsConnectedMT5] = useState(false);
  const [isExnessOpen, setIsExnessOpen] = useState(false);
  const [isMT5Open, setIsMT5Open] = useState(false);
  const [mt5Data, setMt5Data] = useState({ accountId: "", server: "", password: "", bridgeToken: "" });
  const [exnessData, setExnessData] = useState({ login: "", server: "", password: "", bridgeToken: "" });
  const [accountStats, setAccountStats] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const checkUserAndAccounts = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated" || !session?.user?.id) {
        router.push("/auth/login");
        return;
      }

      // Fetch real account states from DB
      const accounts = await getBrokerAccounts(session.user.id);

      if (accounts && accounts.length > 0) {
        const stats: any = {};
        accounts.forEach((acc: any) => {
          if (acc.broker_type === 'exness') {
            setIsConnectedExness(acc.status === 'connected');
            setExnessData(prev => ({ ...prev, login: acc.account_id, server: acc.server }));
          }
          if (acc.broker_type === 'mt5') {
            setIsConnectedMT5(acc.status === 'connected');
            setMt5Data(prev => ({ ...prev, accountId: acc.account_id, server: acc.server }));
          }
          stats[acc.broker_type] = acc;
        });
        setAccountStats(stats);
      }
    };
    checkUserAndAccounts();
  }, [status, session, router]);

  const handleConnect = async (type: "MT5" | "Exness") => {
    toast({
      title: "Feature Coming Soon",
      description: `Direct ${type} integration is a premium feature currently in development. It will be available in our upcoming Pro Plan.`,
    });
  };

  const handleDisconnect = (type: "MT5" | "Exness") => {
    if (type === "Exness") {
      setIsConnectedExness(false);
      localStorage.removeItem("isConnectedExness");
    } else {
      setIsConnectedMT5(false);
      localStorage.removeItem("isConnectedMT5");
    }
    
    toast({
      title: `${type} Disconnected`,
      description: "Your account data has been unlinked from the dashboard.",
    });
  };

  useEffect(() => {
    // Restore states from local storage for simulation
    if (localStorage.getItem("isConnectedExness") === "true") setIsConnectedExness(true);
    if (localStorage.getItem("isConnectedMT5") === "true") setIsConnectedMT5(true);
  }, []);

  if (status !== "authenticated") return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Broker Integrations</h1>
            <p className="text-muted-foreground max-w-2xl">
              Connect your external accounts to automatically track P&L and order history.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Secure Connection
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* MT5 Connection */}
          <Card className={`border-border/60 shadow-md flex flex-col hover:border-primary/30 transition-all overflow-hidden relative group ${isConnectedMT5 ? "ring-1 ring-primary/50" : ""}`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Terminal className="w-24 h-24 rotate-12" />
             </div>
             
             <CardHeader className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase bg-primary/5 text-primary border-primary/20">Pro Feature</Badge>
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Coming Soon</Badge>
              </div>
              <CardTitle className="text-2xl">MetaTrader 5</CardTitle>
              <CardDescription>
                Direct MT5 server sync with secure investor access.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-1 relative z-10">
              <div className="space-y-3">
                {[
                  { icon: History, label: "Full Order History Sync" },
                  { icon: TrendingUp, label: "Real-time Net P&L Tracking" },
                  { icon: Wallet, label: "Equity & Margin Analysis" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 text-primary/70" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3 mt-4">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed italic">
                  <strong>Coming Soon:</strong> This integration is part of our upcoming Pro Plan. We will use secure investor access to sync your data.
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-6 relative z-10">
              <Button 
                onClick={() => handleConnect("MT5")} 
                className="w-full h-11 group shadow-lg shadow-primary/20 bg-secondary hover:bg-secondary/80 text-foreground border border-border"
              >
                Connect MT5 Account 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>

          {/* Exness Connection */}
          <Card className={`border-border/60 shadow-md flex flex-col hover:border-primary/30 transition-all overflow-hidden relative group opacity-90`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Building2 className="w-24 h-24 rotate-12" />
             </div>

            <CardHeader>
              <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono uppercase bg-primary/5 text-primary border-primary/20">Pro Feature</Badge>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Coming Soon</Badge>
              </div>
              <CardTitle className="text-2xl">Exness</CardTitle>
              <CardDescription>
                 Direct API bridge to your Exness MetaTrader accounts.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-1">
              <div className="space-y-3">
                {[
                  { icon: History, label: "Automated Journal Sync" },
                  { icon: TrendingUp, label: "Net P&L & Volume Stats" },
                  { icon: Wallet, label: "Real-time Balance Tracking" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 text-primary/70" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3 mt-4">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed italic">
                  <strong>Premium Feature:</strong> Linking your Exness account via API token is being optimized for our Pro Plan launch. Stay tuned!
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-6">
              <Button 
                onClick={() => handleConnect("Exness")} 
                className="w-full h-11 group shadow-lg shadow-primary/20 bg-secondary hover:bg-secondary/80 text-foreground border border-border"
              >
                Link Exness Account
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Help section */}
        <div className="mt-12 text-center p-8 border-t border-border/40">
            <h4 className="text-sm font-semibold mb-2">Frequently Asked Questions</h4>
            <div className="max-w-2xl mx-auto grid gap-4 text-xs text-muted-foreground">
              <p>Does this platform have access to my funds? <span className="text-foreground ml-1">No. All integrations use read-only API methods. We cannot place trades or withdraw funds.</span></p>
              <p>How often does history sync? <span className="text-foreground ml-1">Orders are synced every 5 minutes automatically.</span></p>
            </div>
            <p className="mt-8 text-[11px] text-muted-foreground">
                Need more help? <Link href="#" className="underline text-foreground">View Integration Documentation</Link>
            </p>
        </div>
      </main>
    </div>
  );
}
