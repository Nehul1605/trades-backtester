"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import SpotlightCard from '../SpotlightCard';

interface Trade {
  id: string
  symbol: string
  trade_type: string
  pnl: number | null
  pnl_percentage: number | null
  entry_date: string
  status: string
}

interface RecentTradesProps {
  trades: Trade[]
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const recentTrades = trades
    .filter((t) => t.status === "closed" && t.pnl !== null)
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
    .slice(0, 5)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  if (recentTrades.length === 0) {
    return (
      <SpotlightCard className="custom-spotlight-card dark:bg-[#04090e] bg-[#fdfdfd] shadow-sm text-card-foreground" spotlightColor="rgba(0, 229, 255, 0.2)">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your latest closed trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No recent trades to display
          </div>
        </CardContent>
      </SpotlightCard>
    )
  }

  return (
    <SpotlightCard className="custom-spotlight-card dark:bg-[#04090e] bg-[#fdfdfd] shadow-sm text-card-foreground" spotlightColor="rgba(0, 229, 255, 0.2)">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>Your latest closed trades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTrades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${(trade.pnl || 0) >= 0
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-destructive/10 border border-destructive/20"
                    }`}
                >
                  {(trade.pnl || 0) >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{trade.symbol}</p>
                    <Badge variant={trade.trade_type === "long" ? "default" : "secondary"} className="text-xs">
                      {trade.trade_type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trade.entry_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${(trade.pnl || 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatCurrency(trade.pnl || 0)}
                </p>
                <p className="text-xs text-muted-foreground">{trade.pnl_percentage?.toFixed(2)}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </SpotlightCard>

  )
}
