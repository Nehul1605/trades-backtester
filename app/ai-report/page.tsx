"use client"

import React, { useState, useEffect } from "react"
import { 
  Sparkles, 
  Brain, 
  Target, 
  ArrowRight, 
  LineChart,
  Lock,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Trophy,
  BarChart3,
  Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function AIInsightsComingSoon() {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: session?.user?.email || "",
      experience: formData.get("experience"),
      focus: formData.get("focus"),
    }

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: `WAITLIST JOINED: AI Insights`,
          message: `
            New Waitlist Entry for AI Insights!
            
            Name: ${data.name}
            Email: ${data.email}
            Trading Experience: ${data.experience}
            AI Focus Interest: ${data.focus}
          `,
        }),
      })

      if (!response.ok) throw new Error("Failed to join waitlist")

      setIsSuccess(true)
      toast.success("Successfully joined the waitlist!")
      
      setTimeout(() => {
        setIsOpen(false)
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />

      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border/50 mb-8 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Training Neural Network</span>
      </div>

      <div className="text-center max-w-2xl space-y-6">
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic">
          AI <span className="text-primary not-italic">Insights</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
          Unlock the power of machine learning to identify patterns, mitigate risk, and optimize your trading edge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full max-w-4xl">
        {[
          { icon: Brain, title: "Pattern Recognition", desc: "Automated identification of complex chart structures." },
          { icon: Target, title: "Edge Analysis", desc: "Statistical validation of your trading setup efficiency." },
          { icon: LineChart, title: "Risk Prediction", desc: "ML-driven drawdown forecasting and risk management." }
        ].map((feature, i) => (
          <Card key={i} className="bg-card/40 border-border/50 backdrop-blur-sm p-6 flex flex-col items-center text-center group hover:border-primary/50 transition-all duration-500">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-tight mb-2">{feature.title}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{feature.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            <Lock className="w-3 h-3" /> Exclusive Early Access List
          </div>
          <div className="flex gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full px-8 font-black uppercase tracking-widest text-xs group">
                  Join Waitlist
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] bg-card border-border/50 backdrop-blur-xl">
                {isSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                       <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Access Requested!</h2>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tighter italic">We'll notify you when the AI engine is ready for deployment.</p>
                  </div>
                ) : (
                  <>
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        Join <span className="text-primary italic">AI</span> Waitlist
                      </DialogTitle>
                      <DialogDescription className="text-xs uppercase font-bold text-muted-foreground tracking-widest">
                        Help us tailor the AI to your trading style
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wl-ai-name" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                            <User className="w-3 h-3 text-primary" /> Full Name
                          </Label>
                          <Input id="wl-ai-name" name="name" required readOnly value={session?.user?.name || ""} className="bg-muted/30 border-border/50 h-10 text-xs font-bold tracking-tighter opacity-70 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wl-ai-email" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                            <Mail className="w-3 h-3 text-primary" /> Email
                          </Label>
                          <Input id="wl-ai-email" name="email" type="email" readOnly value={session?.user?.email || ""} className="bg-muted/30 border-border/50 h-10 text-xs font-bold tracking-tighter opacity-70 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wl-ai-exp" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                          <Trophy className="w-3 h-3 text-primary" /> Experience
                        </Label>
                        <Select name="experience" required>
                          <SelectTrigger className="bg-muted/30 border-border/50 h-10 text-xs font-bold tracking-tighter">
                            <SelectValue placeholder="Experience Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner" className="text-xs font-bold lowercase italic">Beginner (&lt; 1 Year)</SelectItem>
                            <SelectItem value="intermediate" className="text-xs font-bold">Intermediate (1-3 Years)</SelectItem>
                            <SelectItem value="pro" className="text-xs font-bold">Professional (3+ Years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wl-ai-focus" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                          <Lightbulb className="w-3 h-3 text-primary" /> Primary Interest
                        </Label>
                        <Select name="focus" required>
                          <SelectTrigger className="bg-muted/30 border-border/50 h-10 text-xs font-bold tracking-tighter">
                            <SelectValue placeholder="What should AI do for you?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strategy" className="text-xs font-bold">Strategy Optimization</SelectItem>
                            <SelectItem value="psychology" className="text-xs font-bold">Trading Psychology Analysis</SelectItem>
                            <SelectItem value="risk" className="text-xs font-bold">Risk Management Suggestions</SelectItem>
                            <SelectItem value="journaling" className="text-xs font-bold">Automated Journaling Insights</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Secure Early Access"}
                      </Button>
                    </form>
                  </>
                )}
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8 font-black uppercase tracking-widest text-xs">
              <Link href="/dashboard">Back Home</Link>
            </Button>
          </div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20" />
    </div>
  )
}
