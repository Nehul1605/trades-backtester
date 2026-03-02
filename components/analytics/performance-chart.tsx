"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
<<<<<<< HEAD
  Area,
  AreaChart,
  Bar,
  BarChart,
=======
  Bar,
  BarChart,
  Cell,
>>>>>>> 2b9560df31c5f28bdaff37bdb5950831302aa795
  CartesianGrid,
  Cell,
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
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Daily Net P&L
          </CardTitle>
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
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Daily Net P&L
        </CardTitle>
        <CardDescription>
          Histogram of daily closed trade results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
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
              cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
              labelStyle={{
                color: "#94a3b8",
                fontSize: "10px",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
              formatter={(value: number) => [
                <span style={{ color: value >= 0 ? "#10b981" : "#f43f5e" }}>
                  {value >= 0 ? "+" : ""}${value.toLocaleString()}
                </span>,
                "Daily P&L",
              ]}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
