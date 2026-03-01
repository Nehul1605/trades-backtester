"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  // Aggregate P&L by day
  const dailyPnL = trades
    .filter((t) => t.status === "closed" && t.pnl !== null)
    .reduce((acc: Record<string, number>, trade) => {
      const date = new Date(trade.entry_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[date] = (acc[date] || 0) + (trade.pnl || 0);
      return acc;
    }, {});

  const chartData = Object.entries(dailyPnL)
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length === 0) {
    return (
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Daily Net P&L
          </CardTitle>
          <CardDescription>
            Histogram of daily closed trade results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-75 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
            No closed trades to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
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
              vertical={false}
              strokeDasharray="3 3"
              stroke="#1e293b"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "8px 12px",
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
