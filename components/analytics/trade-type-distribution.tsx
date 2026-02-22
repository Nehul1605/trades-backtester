"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Trade {
  id: string;
  trade_type: string;
  pnl: number | null;
  status: string;
}

interface TradeTypeDistributionProps {
  trades: Trade[];
}

const COLORS = ["#3b82f6", "#ef4444"];

export function TradeTypeDistribution({ trades }: TradeTypeDistributionProps) {
  const closedTrades = trades.filter(
    (t) => t.status === "closed" && t.pnl !== null,
  );

  const longTrades = closedTrades.filter((t) => t.trade_type === "long");
  const shortTrades = closedTrades.filter((t) => t.trade_type === "short");

  const longPnL = longTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const shortPnL = shortTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  const data = [
    { name: "Long Trades", value: longTrades.length, pnl: longPnL },
    { name: "Short Trades", value: shortTrades.length, pnl: shortPnL },
  ];

  if (closedTrades.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Trade Type Distribution</CardTitle>
          <CardDescription>Long vs Short trade performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No closed trades to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Trade Type Distribution</CardTitle>
        <CardDescription>Long vs Short trade performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#3b82f6"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              position={{ y: 0 }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                padding: "16px",
              }}
              itemStyle={{
                color: "hsl(var(--foreground))",
                fontSize: "14px",
                fontWeight: "600",
              }}
              labelStyle={{
                color: "hsl(var(--muted-foreground))",
                fontSize: "12px",
                textTransform: "uppercase",
                fontWeight: "700",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
              formatter={(value: any, name: string, props: any) => {
                const pnl = props.payload.pnl;
                return [
                  <div key={name} className="flex flex-col gap-2 min-w-[120px]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="text-foreground font-bold">{value} Trades</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2">
                      <span className="text-muted-foreground">Total P&L:</span>
                      <span className={`font-mono font-bold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        ${pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>,
                  null
                ];
              }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Long P&L</p>
            <p
              className={`text-lg font-bold font-mono ${longPnL >= 0 ? "text-profit" : "text-loss"}`}
            >
              ${longPnL.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Short P&L</p>
            <p
              className={`text-lg font-bold font-mono ${shortPnL >= 0 ? "text-profit" : "text-loss"}`}
            >
              ${shortPnL.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
