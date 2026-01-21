"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SpotlightCard from '../SpotlightCard';

interface Trade {
  id: string
  strategy_name: string | null
  pnl: number | null
  status: string
}

interface StrategyBreakdownProps {
  trades: Trade[]
}

export function StrategyBreakdown({ trades }: StrategyBreakdownProps) {
  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null && t.strategy_name)

  // Group trades by strategy
  const strategyMap = new Map<string, { count: number; totalPnL: number; wins: number }>()

  closedTrades.forEach((trade) => {
    const strategy = trade.strategy_name || "Unknown"
    const existing = strategyMap.get(strategy) || { count: 0, totalPnL: 0, wins: 0 }

    strategyMap.set(strategy, {
      count: existing.count + 1,
      totalPnL: existing.totalPnL + (trade.pnl || 0),
      wins: existing.wins + ((trade.pnl || 0) > 0 ? 1 : 0),
    })
  })

  const strategies = Array.from(strategyMap.entries())
    .map(([name, data]) => ({
      name,
      ...data,
      winRate: (data.wins / data.count) * 100,
    }))
    .sort((a, b) => b.totalPnL - a.totalPnL)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  if (strategies.length === 0) {
    return (
      <SpotlightCard className="custom-spotlight-card dark:bg-[#04090e] bg-[#fdfdfd] shadow-sm text-card-foreground" spotlightColor="rgba(0, 229, 255, 0.2)">
        <CardHeader>
          <CardTitle>Strategy Breakdown</CardTitle>
          <CardDescription>Performance by trading strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No strategies to display
          </div>
        </CardContent>
      </SpotlightCard>
    )
  }

  return (

    <SpotlightCard className="custom-spotlight-card dark:bg-[#04090e] bg-[#fdfdfd] shadow-sm text-card-foreground" spotlightColor="rgba(0, 229, 255, 0.2)">
      <CardHeader>

        <CardTitle>Strategy Breakdown</CardTitle>
        <CardDescription>Performance by trading strategy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.name}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{strategy.name}</h4>
                  <Badge variant="outline">{strategy.count} trades</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Win Rate: {strategy.winRate.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${strategy.totalPnL >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatCurrency(strategy.totalPnL)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </SpotlightCard>
  )
}
