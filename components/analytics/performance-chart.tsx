"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Trade {
  id: string;
  entry_date: string;
  pnl: number | null;
  status: string;
}

interface PerformanceChartProps {
  trades: Trade[];
}

export function PerformanceChart({ trades }: PerformanceChartProps) {
  const closedTrades = trades
    .filter((t) => t.status === "closed" && t.pnl !== null)
    .sort(
      (a, b) =>
        new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime(),
    );

  let cumulativePnL = 0;
  const chartData = closedTrades.map((trade) => {
    cumulativePnL += trade.pnl || 0;
    return {
      date: new Date(trade.entry_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      pnl: cumulativePnL,
    };
  });

  if (chartData.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Cumulative P&L</CardTitle>
          <CardDescription>
            Track your profit and loss over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-75 text-muted-foreground text-sm">
            No closed trades to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Cumulative P&L</CardTitle>
        <CardDescription>Track your profit and loss over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#3b82f6"
              fill="url(#colorPnl)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
