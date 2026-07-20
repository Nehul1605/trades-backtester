"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  FileText,
  Search,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FAQS = [
  {
    question: "How does the Daily Net P&L Calendar work?",
    answer:
      "The calendar automatically aggregates all your closed trades for each specific date. It sums up the profits and losses to give you a single net result for that day. It refreshes in real-time as you add or sync trades.",
  },
  {
    question: "Can I sync trades from MT4/MT5?",
    answer:
      "Yes, you can use the 'Connect' section to link your broker accounts via TradeLocker or similar integrations. We support most standard brokers.",
  },
  {
    question: "What does Profit Factor mean?",
    answer:
      "Profit Factor is the ratio of your total gross profits divided by your total gross losses. A value above 1.0 means you are profitable.",
  },
  {
    question: "How do I backtest using historical data?",
    answer:
      "Go to the Dashboard and use the Trade Form to enter historical entries and exits. Our system will handle the P&L calculation and add it to your analysis automatically.",
  },
];

export default function HelpPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!subject || !message) {
      toast({
        title: "Missing Fields",
        description: "Please provide a subject and detailed message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        toast({
          title: "Ticket Sent Successfully",
          description:
            "Your message has been delivered. A solution will be provided as soon as possible.",
          className:
            "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      toast({
        title: "Submission Error",
        description: "Could not send ticket. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black tracking-tighter uppercase">
              Support Center
            </h1>
            <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em] max-w-md mx-auto">
              Get help with your trading platform, analytics, and integrations.
            </p>
            <div className="max-w-xl mx-auto relative group mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search for articles, features, or help topics..."
                className="h-14 pl-12 bg-card/40 border-border/50 rounded-2xl font-bold tracking-tight"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Support Channels */}
            <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-black uppercase tracking-widest">
                    Frequently Asked Questions
                  </h2>
                </div>
                <Card className="bg-card/40 backdrop-blur-md border-border/50 overflow-hidden">
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {FAQS.map((faq, i) => (
                        <AccordionItem
                          key={i}
                          value={`item-${i}`}
                          className="border-b border-border/50 px-6"
                        >
                          <AccordionTrigger className="text-sm font-bold uppercase tracking-tight py-6 hover:no-underline hover:text-primary transition-colors">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-6">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 sm:grid-cols-2">
                <Card className="bg-primary/5 border-primary/20 p-6 flex flex-col gap-4 group hover:bg-primary/10 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">
                      Documentation
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                      Read our full platform guide and tutorials.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-fit p-0 h-auto text-[9px] font-black uppercase tracking-widest group-hover:gap-2 transition-all"
                  >
                    View Docs <ArrowRight className="h-3 w-3" />
                  </Button>
                </Card>
                <Card className="bg-card/40 backdrop-blur-md border-border/50 p-6 flex flex-col gap-4 group hover:bg-card/60 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">
                      Community Forum
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                      Connect with other traders for tips and sharing.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-fit p-0 h-auto text-[9px] font-black uppercase tracking-widest group-hover:gap-2 transition-all"
                  >
                    Visit Forum <ArrowRight className="h-3 w-3" />
                  </Button>
                </Card>
              </section>
            </div>

            {/* Contact Support Form */}
            <div className="lg:col-span-1">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Direct Support
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold mt-1">
                    Submit a ticket for technical issues.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitSupport} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">
                        Subject
                      </label>
                      <Input
                        name="subject"
                        placeholder="What do you need help with?"
                        className="bg-background/50 border-border/50 h-11 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">
                        Message
                      </label>
                      <Textarea
                        name="message"
                        placeholder="Please provide details about your issue..."
                        className="bg-background/50 border-border/50 min-h-32 font-bold text-xs"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 text-xs font-black uppercase tracking-widest"
                    >
                      {isSubmitting ? "Sending..." : "Send Ticket"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
