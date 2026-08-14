"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Check, 
  CreditCard, 
  Tv, 
  Award, 
  BookOpen, 
  Scale, 
  User, 
  Mail, 
  Phone, 
  Tag, 
  ArrowRight,
  Loader2 
} from "lucide-react";
import { createPaymentOrder, verifyPaymentSignature, getExchangeRate, cancelPaymentOrder } from "@/lib/actions";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PremiumCheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, update: updateSession } = useSession();

  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [showTransitionLoader, setShowTransitionLoader] = useState(false);
  const [rates, setRates] = useState<{ rate: number; monthlyInr: number; annualInr: number } | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      const res = await getExchangeRate();
      if (!res.error && res.rate) {
        setRates({
          rate: res.rate,
          monthlyInr: res.monthlyInr || 955,
          annualInr: res.annualInr || 10314
        });
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "🔥 Feature Announcement",
        description: "Bring the feature of MT5 Account Sync Real-Time!",
        duration: 5000,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSdkLoad = () => {
    setSdkReady(true);
    console.log("Razorpay SDK Loaded successfully.");
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast({
        variant: "destructive",
        title: "Phone Required",
        description: "Please enter your phone number to proceed to payment.",
      });
      return;
    }

    if (!window.Razorpay) {
      toast({
        variant: "destructive",
        title: "Payment Gateway Offline",
        description: "Razorpay SDK is loading. Please wait a moment and try again.",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await createPaymentOrder({
        planType: plan,
        customerName: name,
        customerPhone: phone,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      if (!res.orderId) {
        throw new Error("Invalid order ID returned from server");
      }

      console.log("Initiating Razorpay Checkout Sheet...", res.orderId);

      // 2. Configure Razorpay Standard Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TPZXjx6gRjXTxI",
        amount: res.amount,
        currency: res.currency || "INR",
        name: "TradeTracker Pro",
        description: plan === "annual" ? "Annual Premium Plan" : "Monthly Premium Plan",
        order_id: res.orderId,
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#EAB308", // Gold color theme
        },
        handler: async function (response: any) {
          setLoading(true);
          toast({
            title: "Verifying Payment",
            description: "Processing transaction signature. Please wait...",
          });

          try {
            const verifyRes = await verifyPaymentSignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.error) {
              throw new Error(verifyRes.error);
            }

            toast({
              title: "Payment Successful!",
              description: "Thank you for subscribing to Premium! Access has been unlocked.",
            });

            // Trigger visual progress loading bar from Promo/Free to Premium
            setShowTransitionLoader(true);

            // Update NextAuth local session parameters
            await updateSession({
              status: "approved",
              membershipTag: "PREMIUM",
              isPremiumActive: true,
              isPromoActive: false
            });

            // Smoothly delay redirection to let transition animation complete
            setTimeout(() => {
              router.replace("/dashboard");
            }, 3500);
          } catch (err: any) {
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: err.message || "Could not verify payment signature.",
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment Cancelled",
              description: "You closed the Razorpay payment window.",
            });
            if (res.orderId) {
              cancelPaymentOrder(res.orderId);
            }
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error?.description || "Razorpay transaction failed.",
        });
        if (res.orderId) {
          cancelPaymentOrder(res.orderId);
        }
        setLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment Initiation Failed",
        description: err.message || "An error occurred while creating order.",
      });
      setLoading(false);
    }
  };

  // Pricing values for UI
  const originalPrice = plan === "annual" ? 180 : 15;
  const launchPrice = plan === "annual" ? 108 : 10;
  const discountPercent = plan === "annual" ? 40 : 33;
  const couponCode = plan === "annual" ? "LAUNCH40" : "LAUNCH33";

  // Calculate dynamic INR amount display using fetched rates
  const inrAmount = plan === "annual"
    ? `₹${(rates?.annualInr || 10314).toLocaleString("en-IN")}`
    : `₹${(rates?.monthlyInr || 955).toLocaleString("en-IN")}`;

  if (showTransitionLoader) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl text-foreground select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-md w-full px-6 space-y-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-neutral-950 border border-primary/30 p-4 rounded-full">
              <Sparkles className="h-10 w-10 text-primary animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
              Upgrade <span className="text-primary not-italic">Confirmed</span>
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Transitioning membership tier
            </p>
          </div>

          {/* Badge Transition Animation */}
          <div className="flex items-center justify-center gap-6 py-4">
            <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-widest opacity-60">
              Promo Trial
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground animate-bounce" />
            
            <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary text-primary text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 animate-pulse">
              Premium Member
            </div>
          </div>

          {/* Loading/Progress Bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-border/20">
              <div className="h-full bg-gold-gradient rounded-full animate-[progress_3.2s_ease-in-out_forwards]" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest animate-pulse">
              Unlocking features, synchronizing dashboard...
            </p>
          </div>
        </div>
        
        {/* Custom style for progress animation */}
        <style jsx global>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto min-h-screen select-none relative overflow-hidden">
      {/* Script tag to load Razorpay checkout SDK */}
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={handleSdkLoad} 
        strategy="lazyOnload"
      />

      {/* Spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col border-b border-border/40 pb-5">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic flex items-center gap-2">
          Premium <span className="text-primary not-italic">Subscriptions</span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
          Gain full permanent access to live market sessions, operator trading signals, and institutional tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Benefits & Plan Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plan Selector */}
          <div className="p-1 bg-neutral-950/70 border border-border/20 rounded-2xl flex gap-2">
            <button
              type="button"
              onClick={() => setPlan("monthly")}
              className={`flex-1 py-4 px-4 rounded-xl font-bold uppercase text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                plan === "monthly"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-900/40"
              }`}
            >
              <span>Monthly Access</span>
              <span className="text-[10px] opacity-80">$10/month</span>
            </button>
            <button
              type="button"
              onClick={() => setPlan("annual")}
              className={`flex-1 py-4 px-4 rounded-xl font-bold uppercase text-xs flex flex-col items-center gap-1 transition-all cursor-pointer relative overflow-hidden ${
                plan === "annual"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-900/40"
              }`}
            >
              <div className="absolute top-0 right-0 bg-yellow-500 text-neutral-950 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-bl uppercase">
                Best Deal (Save 40%)
              </div>
              <span>Annual Access</span>
              <span className="text-[10px] opacity-80">$108/year</span>
            </button>
          </div>

          {/* Included Features Benefits Card */}
          <Card className="bg-card/30 border-border/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">
                Unlocks Everything Instantly
              </CardTitle>
              <CardDescription className="text-xs">
                Unlock all limited areas immediately without registering partner broker link.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              {[
                { icon: Tv, title: "Live Market Stream", desc: "Co-host and watch charts live." },
                { icon: Award, title: "Operator HQ Signals", desc: "Real-time verified trading feeds." },
                { icon: BookOpen, title: "Trading Resources", desc: "Access premium templates, PDFs, and guides." },
                { icon: Scale, title: "Position Calculator", desc: "Properly unlock precise lot size sizing." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-neutral-900/40 rounded-xl border border-border/20">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wide text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Billing Information & Cashfree Pay */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCheckout}>
            <Card className="bg-card/40 border-primary/20 backdrop-blur-xl relative overflow-hidden shadow-2xl gold-glow-subtle">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
              
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-wider text-foreground">
                  Order Checkout
                </CardTitle>
                <CardDescription className="text-xs">
                  Fill in your details and pay securely via Razorpay Standard Checkout
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Billing Summary Box */}
                <div className="bg-neutral-900/60 rounded-xl p-4 border border-border/30 space-y-3">
                  <div className="flex justify-between text-xs font-bold border-b border-border/20 pb-2">
                    <span className="text-muted-foreground uppercase">Subtotal ({plan})</span>
                    <span className="text-muted-foreground line-through">${originalPrice}.00</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                    <span className="flex items-center gap-1.5 uppercase">
                      <Tag className="w-3.5 h-3.5" /> Coupon Auto-Applied
                    </span>
                    <span>{couponCode} (-{discountPercent}%)</span>
                  </div>

                  <div className="flex justify-between text-sm font-black pt-2">
                    <span className="text-foreground uppercase">Order Total</span>
                    <div className="text-right">
                      <span className="text-primary text-base">${launchPrice}.00</span>
                      <span className="block text-[10px] text-muted-foreground font-medium mt-0.5">Approx. {inrAmount} INR</span>
                    </div>
                  </div>
                </div>

                {/* Billing Information Input Form */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="billing_name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="billing_name"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 text-xs h-9 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="billing_email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="billing_email"
                        type="email"
                        placeholder="trader@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 text-xs h-9 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="billing_phone" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Billing Phone Number (Required)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="billing_phone"
                        type="tel"
                        placeholder="e.g. +91 9999999999"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 text-xs h-9 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-6">
                <Button
                  type="submit"
                  disabled={loading || !sdkReady}
                  className="w-full h-11 bg-gold-gradient text-background font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Pay Securely via Razorpay
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
