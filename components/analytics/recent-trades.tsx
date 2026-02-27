"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Clock,
  ReceiptText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  trade_type: string;
  pnl: number | null;
  pnl_percentage: number | null;
  entry_date: string;
  status: string;
  broker_account_id?: string;
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  entry_price_text?: string | null;
  exit_price_text?: string | null;
  created_at?: string;
}

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const [visibleCount, setVisibleCount] = useState(3);
  const allRecent = trades
    .filter((t) => t.status === "closed" && t.pnl !== null)
    .sort((a, b) => {
      const dateA = new Date(a.exit_date || a.entry_date).getTime();
      const dateB = new Date(b.exit_date || b.entry_date).getTime();
      if (dateB !== dateA) return dateB - dateA;

      // Tie-breaker: creation time
      if (a.created_at && b.created_at) {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return 0;
    });

  const recentTrades = allRecent.slice(0, visibleCount);
  const hasMore = allRecent.length > visibleCount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  };

  const isBrokerSynced = trades.some((t) => t.broker_account_id);

  if (recentTrades.length === 0) {
    return (
      <Card className="border-border/50 bg-card/30">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">
                Recent Activity
              </CardTitle>
            </div>
            <CardDescription className="text-[10px]">
              Your latest closed executions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground text-xs gap-2 border border-dashed border-border/40 rounded-xl bg-secondary/5">
            <ReceiptText className="w-8 h-8 opacity-20" />
            No recent closed positions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Recent Activity
            </CardTitle>
          </div>
          <CardDescription className="text-[10px]">
            Your latest closed executions
          </CardDescription>
        </div>
        {isBrokerSynced && (
          <Badge
            variant="outline"
            className="text-[9px] text-emerald-500 bg-emerald-500/5 border-emerald-500/20 gap-1 px-2 py-0"
          >
            <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
            LIVE
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTrades.map((trade) => (
            <div
              key={trade.id}
              className="group flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/40 hover:bg-background/60 hover:border-border transition-all duration-200"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
                    (trade.pnl || 0) >= 0
                      ? "bg-profit/10 text-profit group-hover:bg-profit/20"
                      : "bg-loss/10 text-loss group-hover:bg-loss/20"
                  }`}
                >
                  {(trade.pnl || 0) >= 0 ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold tracking-tight">
                      {trade.symbol}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 px-1.5 font-bold uppercase border-border/60"
                    >
                      {trade.trade_type}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3 h-3 text-muted-foreground/60" />
                        {formatDate(trade.entry_date)}
                      </span>
                      <span className="text-[11px] text-muted-foreground/40">
                        •
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono font-medium">
                        {trade.quantity} lots
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground/60 font-bold tracking-wider uppercase">
                        Entry @
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono font-medium">
                        {trade.entry_price_text ??
                          (trade.entry_price
                            ? trade.entry_price.toFixed(2)
                            : "—")}
                      </span>
                      <span className="text-[11px] text-muted-foreground/40">
                        •
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-bold tracking-wider uppercase">
                        Exit @
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono font-medium">
                        {trade.exit_price_text ??
                          (trade.exit_price
                            ? trade.exit_price.toFixed(2)
                            : "—")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-mono font-bold ${(trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {(trade.pnl || 0) >= 0 ? "+" : ""}
                  {formatCurrency(trade.pnl || 0)}
                </p>
                <p
                  className={`text-[11px] font-mono font-bold opacity-80 ${(trade.pnl_percentage || 0) >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {trade.pnl_percentage
                    ? `${trade.pnl_percentage >= 0 ? "+" : ""}${trade.pnl_percentage.toFixed(2)}%`
                    : "0.00%"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6 pt-2">
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-[11px] h-9 uppercase font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 border border-dashed border-border/40"
              onClick={() => setVisibleCount((prev) => prev + 3)}
            >
              Load More Activity
              <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          )}
          {visibleCount > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className={`${!hasMore ? "w-full" : "w-24"} text-[11px] h-9 uppercase font-bold text-muted-foreground hover:text-destructive/80 hover:bg-loss/5 border border-dashed border-border/40`}
              onClick={() => setVisibleCount(3)}
            >
              Less
              <ChevronUp className="ml-1 w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
