"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  Search,
  BookOpen,
  MessageSquare,
  Shield,
  Radio,
  Calculator,
  Percent,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const SUPPORT_EMAIL = "tradetrackerpro.in@gmail.com";

const FAQS = [
  {
    category: "Live Market & Streaming",
    question: "How do I host or join a Live Market stream?",
    answer:
      "Navigate to the 'Live Market Stream' tab in your sidebar. If a stream is live, click on the stream card to join immediately as a viewer. If you are an assigned Host or Co-Host, click 'Start Live Meeting' to enable your microphone, camera, or screen share.",
  },
  {
    category: "Live Market & Streaming",
    question: "How does Screen Share Audio work in Live Market?",
    answer:
      "When clicking 'Share Screen' as a Host or Co-Host, your browser will prompt you to pick a screen or tab. Make sure to enable the 'Share tab audio' or 'Share system audio' toggle in the browser dialog. Your voice and screen sound will broadcast simultaneously.",
  },
  {
    category: "Live Market & Streaming",
    question: "Who can assign Co-Hosts?",
    answer:
      "Only the designated Room Host or System Administrator can search registered traders and grant or revoke Co-Host permissions using the 'Assign Co-Host' modal inside the Live Market stage.",
  },
  {
    category: "Account & Verification",
    question: "Why is my account status 'Pending'?",
    answer:
      "New trader accounts undergo referral verification. Once our administration team verifies your broker registration, your account status will automatically switch to 'Approved' and you will gain full access to all platform features.",
  },
  {
    category: "Trading & Journaling",
    question: "How do I log trades and attach chart screenshots?",
    answer:
      "Inside your Dashboard Console, click on any broker account to open your workspace. Go to the 'Add Trade' tab to enter entry/exit prices, stop loss, take profit, tags, and upload chart screenshots directly to your trading ledger.",
  },
  {
    category: "Calculators & Tools",
    question: "How does the Prop Consistency Calculator work?",
    answer:
      "The Consistency Calculator analyzes your highest single-day profit relative to your total net P&L to evaluate if your trading meets prop firm consistency rules (e.g. 30% or 40% max single-day profit cap).",
  },
];

const KNOWLEDGE_CATEGORIES = [
  {
    icon: Radio,
    title: "Live Market & WebRTC",
    desc: "Host broadcasts, co-host roles, screen sharing, low-latency audio & chat.",
  },
  {
    icon: BookOpen,
    title: "Trade Journaling",
    desc: "Logging entries, attaching chart screenshots, managing MT5/Exness accounts.",
  },
  {
    icon: Calculator,
    title: "P&L & Analytics",
    desc: "Profit factor, equity curves, calendar heatmaps, and win-rate metrics.",
  },
  {
    icon: Percent,
    title: "Prop Consistency",
    desc: "Prop firm single-day profit caps, drawdown rules, and risk evaluation.",
  },
  {
    icon: Shield,
    title: "Account & Security",
    desc: "Referral verification, Google OAuth login, password resets & profile settings.",
  },
  {
    icon: Mail,
    title: "Direct Support",
    desc: "Get 24/7 dedicated support directly from our technical team via email.",
  },
];

export default function DashboardHelpPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General Support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    toast.success("Support email copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please enter a subject and message details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `[${selectedCategory}] ${subject.trim()}`,
          message: message.trim(),
          email: session?.user?.email || "",
        }),
      });

      if (res.ok) {
        toast.success("Support ticket sent successfully! We will reply shortly.");
        setSubject("");
        setMessage("");
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to send support ticket");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not send support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      {/* TOP NAVIGATION BAR WITH BACK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="rounded-full px-4 text-xs font-bold gap-2 border-border/60 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-border/60 hidden sm:block" />
          <Badge variant="outline" className="text-[11px] text-primary border-primary/30">
            Official Help & Support Center
          </Badge>
        </div>

        {/* OFFICIAL EMAIL QUICK COPY CARD */}
        <div className="flex items-center gap-2 bg-card/80 border border-border/60 rounded-full px-4 py-1.5 shadow-sm">
          <Mail className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold text-foreground">{SUPPORT_EMAIL}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyEmail}
            className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground ml-1"
            title="Copy email address"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* HERO BANNER & SEARCH */}
      <div className="relative rounded-2xl bg-gradient-to-r from-card via-card/80 to-card/40 border border-border/50 p-6 md:p-10 overflow-hidden shadow-xl">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 24/7 Priority Trader Assistance
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground">
            How can we <span className="text-primary">help you</span> today?
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Search our knowledge base, explore feature documentation, or submit a support ticket directly to our technical team at <strong className="text-foreground">{SUPPORT_EMAIL}</strong>.
          </p>

          {/* SEARCH INPUT */}
          <div className="relative max-w-xl pt-2">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics, live streaming, trade logging, or calculators..."
              className="pl-11 h-12 text-xs bg-background/80 border-border/60 rounded-xl focus-visible:ring-primary shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* KNOWLEDGE BASE CATEGORIES GRID */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Platform Topics & Guides
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KNOWLEDGE_CATEGORIES.map((cat, idx) => (
            <Card
              key={idx}
              className="p-5 bg-card/40 border-border/50 backdrop-blur-sm hover:border-primary/40 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <cat.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-tight text-foreground mb-1 group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cat.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT: FAQS & CONTACT FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* LEFT COLUMN: FAQ ACCORDION (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Frequently Asked Questions
            </h2>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              {filteredFaqs.length} Answers
            </Badge>
          </div>

          <Card className="bg-card/40 border-border/50 backdrop-blur-md overflow-hidden p-2">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border/40 px-4">
                  <AccordionTrigger className="text-xs md:text-sm font-bold uppercase tracking-tight py-4 hover:no-underline hover:text-primary transition-colors text-left">
                    <span className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] px-2 py-0 font-bold uppercase">
                        {faq.category}
                      </Badge>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4 pt-1 border-t border-border/20">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* RIGHT COLUMN: DIRECT SUPPORT CONTACT TICKET FORM (5 COLS) */}
        <div className="lg:col-span-5">
          <Card className="bg-card/60 border-border/60 backdrop-blur-xl sticky top-6 shadow-2xl">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-primary" /> Send Support Ticket
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold">
                  Direct Email
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Your ticket will be delivered directly to <span className="text-foreground font-semibold">{SUPPORT_EMAIL}</span>.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSendTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Support Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="text-xs bg-background/60 border-border/50">
                      <SelectValue placeholder="Select topic category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Support" className="text-xs">General Support & Inquiry</SelectItem>
                      <SelectItem value="Live Market Stream" className="text-xs">Live Market Stream & WebRTC</SelectItem>
                      <SelectItem value="Account Verification" className="text-xs">Account Verification & Referral</SelectItem>
                      <SelectItem value="Trade Journal Sync" className="text-xs">Trade Journal & Broker Sync</SelectItem>
                      <SelectItem value="Calculators" className="text-xs">P&L & Consistency Calculators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subject *
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry..."
                    className="text-xs bg-background/60 border-border/50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Message Details *
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue, account email, or question in detail..."
                    rows={4}
                    className="text-xs bg-background/60 border-border/50"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  Or email directly to <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">{SUPPORT_EMAIL}</a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
