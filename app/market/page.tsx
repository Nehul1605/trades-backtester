"use client"

import React, { useState, useEffect } from "react"
import { 
  TrendingUp, 
  Wifi, 
  Zap, 
  Globe, 
  ArrowRight, 
  Activity,
  BarChart2,
  Lock,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Trophy,
  History,
  Clock
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

const SYMBOL_OPTIONS = [
  { value: "ETHUSD", label: "ETHUSD" },
  { value: "BTCUSD", label: "BTCUSD" },
  { value: "APPLE", label: "APPLE" },
  { value: "XAUUSD", label: "XAUUSD (Gold)" },
  { value: "XAGUSD", label: "XAGUSD (Silver)" },
  { value: "DE30", label: "DE30" },
  { value: "USTECH", label: "USTECH" },
  { value: "US30", label: "US30" },
  { value: "EURUSD", label: "EURUSD" },
  { value: "GBPUSD", label: "GBPUSD" },
  { value: "USDJPY", label: "USDJPY" },
  { value: "DXY", label: "DXY" },
  { value: "USOIL", label: "USOIL" },
]

export default function MarketComingSoon() {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const [mostTraded, setMostTraded] = useState("")
  const [mostLovedSession, setMostLovedSession] = useState("")

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.id || !isOpen) return
      try {
        const res = await fetch(`/api/sync-pnl?userId=${session.user.id}`)
        if (res.ok) {
          const trades = await res.json()
          if (trades.length > 0) {
            // Calculate most traded instrument
            const symbols = trades.map((t: any) => t.symbol?.toUpperCase())
            const counts: any = {}
            let max = 0
            let fav = ""
            symbols.forEach((s: string) => {
              if (!s) return
              counts[s] = (counts[s] || 0) + 1
              if (counts[s] > max) { max = counts[s]; fav = s }
            })
            // Match with SYMBOL_OPTIONS if possible
            const matched = SYMBOL_OPTIONS.find(o => o.value === fav)
            if (matched) setMostTraded(matched.value)

            // Calculate most loved session
            const sessions = trades.map((t: any) => {
              const entryDate = t.entry_date || t.$createdAt
              const hour = new Date(entryDate).getUTCHours()
              if (hour >= 0 && hour < 8) return "asian"
              if (hour >= 8 && hour < 16) return "london"
              return "newyork"
            })
            const sCounts: any = {}
            let sMax = 0
            let sFav = ""
            sessions.forEach((s: string) => {
              sCounts[s] = (sCounts[s] || 0) + 1
              if (sCounts[s] > sMax) { sMax = sCounts[s]; sFav = s }
            })
            setMostLovedSession(sFav)
          }
        }
      } catch (e) {
        console.error("Failed to fetch stats", e)
      }
    }
    fetchStats()
  }, [session, isOpen])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: session?.user?.email || "",
      experience: formData.get("experience"),
      instrument: formData.get("instrument"),
      session: formData.get("session"),
    }

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: `WAITLIST JOINED: Live Market`,
          message: `
            New Waitlist Entry for Live Market!
            
            Name: ${data.name}
            Email: ${data.email}
            Trading Experience: ${data.experience}
            Preferred Instrument: ${data.instrument}
            Preferred Session: ${data.session}
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-150 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-75 h-75 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border/50 mb-8 animate-pulse">
        <Wifi className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Establishing Connection</span>
      </div>

      <div className="text-center max-w-2xl space-y-6">
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic">
          Live <span className="text-primary not-italic">Market</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
          We're engineering an institutional-grade terminal for real-time order flow and multi-asset coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full max-w-4xl">
        {[
          { icon: Zap, title: "Micro-Latency", desc: "Ultra-fast websocket feeds for zero-delay pricing." },
          { icon: Globe, title: "Global Coverage", desc: "Stocks, Crypto, and Forex in a single unified view." },
          { icon: BarChart2, title: "Advanced DOM", desc: "Depth of Market tools to track liquidity pockets." }
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
           <Lock className="w-3 h-3" /> Encrypted Beta Access Only
        </div>
        <div className="flex gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full px-8 font-black uppercase tracking-widest text-xs group">
                  Join Waitlist
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-112.5 bg-card border-border/50 backdrop-blur-xl">
                {isSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                       <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">You're on the list!</h2>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tighter italic">We'll reach out once the terminal is ready for you.</p>
                  </div>
                ) : (
                  <>
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary" />
                        Join <span className="text-primary italic">Live</span> Beta
                      </DialogTitle>
                      <DialogDescription className="text-xs uppercase font-bold text-muted-foreground tracking-widest">
                        Complete your trader profile for priority access
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wl-market-name" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                            <User className="w-3 h-3 text-primary" /> Full Name
                          </Label>
                          <Input id="wl-market-name" name="name" required readOnly value={session?.user?.name || ""} className="bg-muted/30 border-border/50 h-10 text-xs font-bold tracking-tighter opacity-70 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wl-market-email" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                            <Mail className="w-3 h-3 text-primary" /> Email
                          </Label>
                          <Input id="wl-market-email" name="email" type="email" readOnly value={session?.user?.email || ""} className="bg-muted/30 border-border/50 h-10 text-xs font-bold tracking-tighter opacity-70 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wl-market-exp" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wl-market-instrument" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                            <History className="w-3 h-3 text-primary" /> Most Traded Instrument
                          </Label>
                          <Select name="instrument" required key={mostTraded} defaultValue={mostTraded}>
                            <SelectTrigger className="bg-muted/30 border-border/50 h-10 text-xs font-bold tracking-tighter">
                              <SelectValue placeholder="symbol" />
                            </SelectTrigger>
                            <SelectContent>
                              {SYMBOL_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wl-market-session" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                            <Clock className="w-3 h-3 text-primary" /> Most Loved Session
                          </Label>
                          <Select name="session" required key={mostLovedSession} defaultValue={mostLovedSession}>
                            <SelectTrigger className="bg-muted/30 border-border/50 h-10 text-xs font-bold uppercase tracking-tighter">
                              <SelectValue placeholder="session" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asian" className="text-xs font-bold">Asian</SelectItem>
                              <SelectItem value="london" className="text-xs font-bold">London</SelectItem>
                              <SelectItem value="newyork" className="text-xs font-bold">New York</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</> : "Request Beta Access"}
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20" />
    </div>
  )
}
