"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { computePnlUSD } from "@/lib/pnl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Trade {
  id: string
  symbol: string
  entry_price: number
  exit_price: number | null
  entry_price_text?: string | null
  exit_price_text?: string | null
  quantity: number
  trade_type: string
  entry_date: string
  exit_date: string | null
  status: string
  strategy_name: string | null
  notes: string | null
  screenshot_url: string | null
  pnl: number | null
  pnl_percentage: number | null
  stop_loss?: number | null
  take_profit?: number | null
}

interface TradeListProps {
  trades: Trade[]
}

export function TradeList({ trades }: TradeListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterSymbol, setFilterSymbol] = useState<string>("ALL")

  const symbols = Array.from(new Set(trades.map((t) => t.symbol))).sort()

  const filtered = filterSymbol === "ALL" ? trades : trades.filter((t) => t.symbol === filterSymbol)
  const openTrades = filtered.filter((t) => t.status === "open")
  const closedTrades = filtered.filter((t) => t.status === "closed")

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade?")) return

    setDeletingId(id)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("trades").delete().eq("id", id)
      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error("Failed to delete trade:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 8,
    }).format(value)
  }

  if (trades.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>Your recorded trades will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No trades recorded yet. Add your first trade to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>{filtered.length} trades shown</CardDescription>
          </div>
          <div className="w-56">
            <Select value={filterSymbol} onValueChange={setFilterSymbol}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Filter symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Symbols</SelectItem>
                {symbols.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Open Trades</h4>
            <Badge variant="outline">{openTrades.length}</Badge>
          </div>
          {openTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open trades.</p>
          ) : (
            <div className="space-y-4">
              {openTrades.map((trade) => (
                <div key={trade.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{trade.symbol}</h3>
                        <Badge variant={trade.trade_type === "long" ? "default" : "secondary"}>
                          {trade.trade_type.toUpperCase()}
                        </Badge>
                        <Badge variant={trade.status === "open" ? "outline" : "secondary"}>
                          {trade.status.toUpperCase()}
                        </Badge>
                      </div>
                      {trade.strategy_name && <p className="text-sm text-muted-foreground">{trade.strategy_name}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {trade.screenshot_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {trade.status === "open" && <CloseTradeButton trade={trade} onClosed={() => router.refresh()} />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(trade.id)}
                        disabled={deletingId === trade.id}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-mono font-medium">{trade.entry_price_text ?? trade.entry_price.toString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exit Price</p>
                      <p className="font-mono font-medium">
                        {trade.exit_price_text ?? (trade.exit_price !== null ? trade.exit_price.toString() : "-")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-mono font-medium">{trade.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L</p>
                      {trade.pnl !== null ? (
                        <p className={`font-mono font-medium ${trade.pnl >= 0 ? "text-primary" : "text-destructive"}`}>
                          {formatCurrency(trade.pnl)} ({trade.pnl_percentage?.toFixed(2)}%)
                        </p>
                      ) : (
                        <p className="font-mono font-medium">-</p>
                      )}
                    </div>
                  </div>
                  {(trade.stop_loss ?? null) !== null || (trade.take_profit ?? null) !== null ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {trade.stop_loss !== null && (
                        <div>
                          <p className="text-muted-foreground">Stop Loss</p>
                          <p className="font-mono font-medium">{trade.stop_loss}</p>
                        </div>
                      )}
                      {trade.take_profit !== null && (
                        <div>
                          <p className="text-muted-foreground">Take Profit</p>
                          <p className="font-mono font-medium">{trade.take_profit}</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry Date</p>
                      <p className="font-medium">{formatDate(trade.entry_date)}</p>
                    </div>
                    {trade.exit_date && (
                      <div>
                        <p className="text-muted-foreground">Exit Date</p>
                        <p className="font-medium">{formatDate(trade.exit_date)}</p>
                      </div>
                    )}
                  </div>

                  {trade.notes && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">{trade.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Closed Trades</h4>
            <Badge variant="outline">{closedTrades.length}</Badge>
          </div>
          {closedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No closed trades.</p>
          ) : (
            <div className="space-y-4">
              {closedTrades.map((trade) => (
                <div key={trade.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{trade.symbol}</h3>
                        <Badge variant={trade.trade_type === "long" ? "default" : "secondary"}>
                          {trade.trade_type.toUpperCase()}
                        </Badge>
                        <Badge variant={trade.status === "open" ? "outline" : "secondary"}>
                          {trade.status.toUpperCase()}
                        </Badge>
                      </div>
                      {trade.strategy_name && <p className="text-sm text-muted-foreground">{trade.strategy_name}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {trade.screenshot_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(trade.id)}
                        disabled={deletingId === trade.id}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-mono font-medium">{trade.entry_price_text ?? trade.entry_price.toString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exit Price</p>
                      <p className="font-mono font-medium">
                        {trade.exit_price_text ?? (trade.exit_price !== null ? trade.exit_price.toString() : "-")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-mono font-medium">{trade.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L</p>
                      {trade.pnl !== null ? (
                        <p className={`font-mono font-medium ${trade.pnl >= 0 ? "text-primary" : "text-destructive"}`}>
                          {formatCurrency(trade.pnl)} ({trade.pnl_percentage?.toFixed(2)}%)
                        </p>
                      ) : (
                        <p className="font-mono font-medium">-</p>
                      )}
                    </div>
                  </div>
                  {(trade.stop_loss ?? null) !== null || (trade.take_profit ?? null) !== null ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {trade.stop_loss !== null && (
                        <div>
                          <p className="text-muted-foreground">Stop Loss</p>
                          <p className="font-mono font-medium">{trade.stop_loss}</p>
                        </div>
                      )}
                      {trade.take_profit !== null && (
                        <div>
                          <p className="text-muted-foreground">Take Profit</p>
                          <p className="font-mono font-medium">{trade.take_profit}</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry Date</p>
                      <p className="font-medium">{formatDate(trade.entry_date)}</p>
                    </div>
                    {trade.exit_date && (
                      <div>
                        <p className="text-muted-foreground">Exit Date</p>
                        <p className="font-medium">{formatDate(trade.exit_date)}</p>
                      </div>
                    )}
                  </div>

                  {trade.notes && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">{trade.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CloseTradeButton({ trade, onClosed }: { trade: Trade; onClosed: () => void }) {
  const [open, setOpen] = useState(false)
  const [exitPrice, setExitPrice] = useState<string>("")
  const [exitDate, setExitDate] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  const handleClose = async () => {
    setSaving(true)
    try {
      const { pnl, pnlPct } = computePnlUSD({
        symbol: trade.symbol,
        entryPrice: (trade.entry_price_text ?? trade.entry_price) as any,
        exitPrice: exitPrice,
        quantity: trade.quantity,
        tradeType: (trade.trade_type as "long" | "short") || "long",
      })

      const { error } = await supabase
        .from("trades")
        .update({
          status: "closed",
          exit_price_text: exitPrice,
          exit_price: Number.parseFloat(exitPrice),
          exit_date: exitDate || null,
          pnl,
          pnl_percentage: pnlPct,
        })
        .eq("id", trade.id)

      if (error) throw error
      setOpen(false)
      onClosed()
    } catch (e) {
      console.error("[v0] close-trade error:", e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Close Trade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Trade - {trade.symbol}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="exit_price">Exit Price</Label>
            <Input
              id="exit_price"
              type="number"
              inputMode="decimal"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exit_date">Exit Date</Label>
            <Input
              id="exit_date"
              type="date"
              max={today}
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleClose} disabled={saving || !exitPrice}>
            Confirm Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
