"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { cn, getLocalDateString, loadImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  pnl: number | null;
  quantity: number;
  entry_date: string;
  status: string;
  commission?: number | null;
}

interface AnalyticsPeriodChartProps {
  closedTrades: Trade[];
  initialBalance: number;
}

type PeriodType = "7d" | "30d" | "90d" | "1y";
type TabType = "pnl" | "orders" | "volume" | "equity";

export function AnalyticsPeriodChart({
  closedTrades,
  initialBalance,
}: AnalyticsPeriodChartProps) {
  const [period, setPeriod] = useState<PeriodType>("7d");
  const activeTab: TabType = "pnl";

  // Process data based on active period
  const processedData = useMemo(() => {
    if (closedTrades.length === 0) return [];

    // Get the latest trade date to anchor the date range (to prevent blank graphs for demo datasets)
    const latestTradeDate = new Date(
      closedTrades[closedTrades.length - 1].entry_date
    );
    const endDate = new Date(latestTradeDate);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    if (period === "7d") {
      startDate.setDate(startDate.getDate() - 6);
    } else if (period === "30d") {
      startDate.setDate(startDate.getDate() - 29);
    } else if (period === "90d") {
      startDate.setDate(startDate.getDate() - 89);
    } else if (period === "1y") {
      startDate.setDate(startDate.getDate() - 364);
    }
    startDate.setHours(0, 0, 0, 0);

    // Generate date intervals
    const dataPoints: {
      date: Date;
      label: string;
      rawDateStr: string;
      pnl: number;
      orders: number;
      volume: number;
      equity: number;
    }[] = [];

    if (period === "1y") {
      // Group by Month (12 months)
      for (let i = 0; i < 12; i++) {
        const d = new Date(endDate);
        d.setMonth(d.getMonth() - (11 - i));
        const monthLabel = d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        dataPoints.push({
          date: new Date(d),
          label: monthLabel,
          rawDateStr: monthLabel,
          pnl: 0,
          orders: 0,
          volume: 0,
          equity: initialBalance,
        });
      }
    } else if (period === "90d") {
      // Group by Week (every 7 days, ~13 weeks)
      const numWeeks = Math.ceil(90 / 7);
      for (let i = 0; i < numWeeks; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i * 7);
        const weekLabel = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        dataPoints.push({
          date: new Date(d),
          label: weekLabel,
          rawDateStr: getLocalDateString(d),
          pnl: 0,
          orders: 0,
          volume: 0,
          equity: initialBalance,
        });
      }
    } else {
      // Group by Day (7, 30 days)
      const totalDays = period === "7d" ? 7 : 30;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayLabel = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        dataPoints.push({
          date: new Date(d),
          label: dayLabel,
          rawDateStr: getLocalDateString(d),
          pnl: 0,
          orders: 0,
          volume: 0,
          equity: initialBalance,
        });
      }
    }

    // Aggregate trades into periods
    closedTrades.forEach((t) => {
      const tradeDate = new Date(t.entry_date);
      if (tradeDate.getTime() < startDate.getTime() && period !== "1y") return;

      const pnlVal = (t.pnl || 0) - (t.commission || 0);
      const volVal = t.quantity || 0;

      if (period === "1y") {
        const tMonth = tradeDate.getMonth();
        const tYear = tradeDate.getFullYear();
        const pt = dataPoints.find(
          (p) => p.date.getMonth() === tMonth && p.date.getFullYear() === tYear
        );
        if (pt) {
          pt.pnl += pnlVal;
          pt.orders += 1;
          pt.volume += volVal;
        }
      } else if (period === "90d") {
        // Find the week interval where tradeDate falls.
        // Find the last dataPoint whose date is <= tradeDate
        let matchedPt = null;
        for (let i = dataPoints.length - 1; i >= 0; i--) {
          const ptDate = new Date(dataPoints[i].date);
          ptDate.setHours(0, 0, 0, 0);
          if (tradeDate.getTime() >= ptDate.getTime()) {
            matchedPt = dataPoints[i];
            break;
          }
        }
        if (matchedPt) {
          matchedPt.pnl += pnlVal;
          matchedPt.orders += 1;
          matchedPt.volume += volVal;
        }
      } else {
        // Daily aggregation (7d and 30d)
        const tDateStr = getLocalDateString(tradeDate);
        const pt = dataPoints.find((p) => p.rawDateStr === tDateStr);
        if (pt) {
          pt.pnl += pnlVal;
          pt.orders += 1;
          pt.volume += volVal;
        }
      }
    });

    // Compute cumulative equity
    let cumulative = initialBalance;
    const pnlBeforeStart = closedTrades
      .filter((t) => new Date(t.entry_date).getTime() < startDate.getTime())
      .reduce((sum, t) => sum + ((t.pnl || 0) - (t.commission || 0)), 0);

    cumulative += pnlBeforeStart;

    dataPoints.forEach((pt) => {
      cumulative += pt.pnl;
      pt.equity = Number(cumulative.toFixed(2));
      pt.pnl = Number(pt.pnl.toFixed(2));
      pt.volume = Number(pt.volume.toFixed(2));
    });

    return dataPoints;
  }, [closedTrades, period, initialBalance]);

  // Determine standard colors and labels for chart types
  const tabConfig = {
    pnl: {
      label: "Net Profit",
      color: "#10b981",
      desc: "Daily profit and loss distribution",
    },
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-950/95 border border-border/60 rounded-xl p-3 shadow-xl space-y-1 select-none text-[11px]">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            {data.label}
          </p>
          <p className={cn("font-bold text-xs", data.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
            Net Profit: {data.pnl >= 0 ? "+" : ""}${data.pnl.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleExportChartPDF = async () => {
    if (processedData.length === 0) return;

    const doc = new jsPDF();
    const watermarkText = "TRADETRACKER PRO";

    // 1. Draw solid dark background banner at the top (mimicking actual site dark theme)
    doc.setFillColor(9, 9, 11); // zinc-950
    doc.rect(0, 0, 210, 36, "F");

    // 2. Calculate Logo dimensions to avoid squishing
    let logoWidth = 10;
    let logoHeight = 10;
    try {
      const logoImg = await loadImage("/logo.png");
      const originalWidth = logoImg.naturalWidth || logoImg.width;
      const originalHeight = logoImg.naturalHeight || logoImg.height;
      logoWidth = (originalWidth / originalHeight) * logoHeight;
      // Add logo inside the dark banner
      doc.addImage(logoImg, "PNG", 14, 13, logoWidth, logoHeight);
    } catch (err) {
      console.error("Failed to load logo image, using fallback:", err);
      doc.setFillColor(197, 168, 128); // gold accent
      doc.rect(14, 14, 8, 8, "F");
    }

    const textStartX = 14 + logoWidth + 3;

    // Header Title (Gold color to match dark theme gold)
    doc.setTextColor(197, 168, 128); // gold: #c5a880
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("TRADETRACKER PRO", textStartX, 21);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(226, 232, 240); // slate-200
    doc.text(`ANALYTICS PERFORMANCE REPORT (${period.toUpperCase()})`, textStartX, 26.5);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 142, 21);
    doc.text(`Data Points: ${processedData.length}`, 142, 26.5);

    const headers = ["Period / Date", "Net Profit ($)"];
    const rows = processedData.map((d) => [
      d.label,
      d.pnl ? `${d.pnl >= 0 ? "+" : ""}$${d.pnl.toFixed(2)}` : "$0.00"
    ]);

    autoTable(doc, {
      startY: 42,
      head: [headers],
      body: rows,
      theme: "striped",
      styles: {
        fontSize: 7.5,
        cellPadding: 1.5,
        valign: "middle",
        textColor: [51, 65, 85] // slate-700
      },
      headStyles: {
        fillColor: [176, 143, 98], // TradeTracker Pro gold theme
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: "bold",
        halign: "center"
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { fontStyle: "bold", halign: "right" }
      },
      alternateRowStyles: {
        fillColor: [250, 248, 245] // very soft gold/white tint
      },
      margin: { top: 42, bottom: 20 },
      willDrawPage: (data) => {
        // Fallback grid watermark under the table (very light gray) in case transparent overlay is unsupported
        doc.setTextColor(250, 250, 250);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        for (let y = 60; y < 280; y += 45) {
          for (let x = 15; x < 200; x += 65) {
            doc.text(watermarkText, x, y, { angle: 25 });
          }
        }
      },
      didDrawPage: (data) => {
        // Add footer page numbers
        const str = "Page " + doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(str, 196 - doc.getTextWidth(str), 287);

        // Professional translucent overlay grid watermark on top of the table/text
        try {
          const gState = new (doc as any).GState({ opacity: 0.045 });
          doc.saveGraphicsState();
          doc.setGState(gState);
          doc.setTextColor(0, 0, 0); // black with 4.5% opacity overlay
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");

          for (let y = 60; y < 280; y += 45) {
            for (let x = 15; x < 200; x += 65) {
              doc.text(watermarkText, x, y, { angle: 25 });
            }
          }
          doc.restoreGraphicsState();
        } catch (e) {
          console.error("Translucent watermark overlay failed:", e);
        }
      }
    });

    doc.save(`performance_chart_${period}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (closedTrades.length === 0) {
    return (
      <Card className="bg-card/20 border border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Account Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No closed trades registered to visualize metrics.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/20 border border-border/40">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/20 pb-4">
        <div>
          <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">
            Performance Analytics
          </CardTitle>
          <CardDescription className="text-[11px] uppercase text-muted-foreground mt-0.5">
            {tabConfig[activeTab].desc}
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto select-none">
          {/* Export Chart Data Button */}
          {processedData.length > 0 && (
            <Button
              onClick={handleExportChartPDF}
              variant="outline"
              size="sm"
              className="h-8 px-3 bg-accent/20 border-primary/20 text-primary hover:border-primary/50 hover:bg-accent/40 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Chart PDF
            </Button>
          )}

          {/* Period Selector */}
          <div className="flex bg-accent/20 border border-border/40 rounded-lg p-0.5">
            {[
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "90d", label: "90D" },
              { id: "1y", label: "1Y" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPeriod(item.id as PeriodType)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-black uppercase rounded-md tracking-wider transition-all cursor-pointer",
                  period === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
            <span className="text-muted-foreground">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-muted-foreground">Loss</span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={9}
                tickLine={false}
                interval={period === "30d" ? 1 : 0}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={9}
                tickLine={false}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
              />
              <Tooltip
                content={<CustomChartTooltip />}
                cursor={false}
              />
              <Bar
                dataKey="pnl"
                maxBarSize={28}
                radius={[4, 4, 0, 0]}
                fill={tabConfig.pnl.color}
                fillOpacity={0.8}
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
