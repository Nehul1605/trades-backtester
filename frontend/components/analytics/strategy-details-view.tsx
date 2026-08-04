"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, TrendingUp, TrendingDown, Target, ChevronDown, ChevronUp } from "lucide-react";
import { cn, getLocalDateString, loadImage } from "@/lib/utils";
import { TradeDetailPanel } from "@/components/dashboard/trade-detail-panel";

interface Trade {
  id: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  entry_price_text?: string | null;
  exit_price_text?: string | null;
  quantity: number;
  trade_type: string;
  entry_date: string;
  exit_date: string | null;
  status: string;
  strategy_name: string | null;
  notes: string | null;
  screenshot_url: string | null;
  pnl: number | null;
  pnl_percentage: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  broker_account_id?: string | null;
}

interface StrategyDetailsViewProps {
  account: any;
  trades: Trade[];
  strategyName: string;
}

export function StrategyDetailsView({ account, trades, strategyName }: StrategyDetailsViewProps) {
  const router = useRouter();
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  // 1. Get all closed trades belonging to this strategy
  const strategyClosedTrades = useMemo(() => {
    return trades.filter(
      (t) => t.status === "closed" && t.pnl !== null && t.strategy_name === strategyName
    );
  }, [trades, strategyName]);

  // 2. Compute performance metrics for this strategy
  const metrics = useMemo(() => {
    const total = strategyClosedTrades.length;
    const wins = strategyClosedTrades.filter((t) => (t.pnl || 0) > 0);
    const losses = strategyClosedTrades.filter((t) => (t.pnl || 0) <= 0);
    
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const totalPnL = strategyClosedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalPct = strategyClosedTrades.reduce((sum, t) => sum + (t.pnl_percentage || 0), 0);
    const avgPct = total > 0 ? totalPct / total : 0;

    return { total, winsCount: wins.length, lossesCount: losses.length, winRate, totalPnL, avgPct };
  }, [strategyClosedTrades]);

  // 3. Filter trades by dates for table display & export
  const filteredStrategyTrades = useMemo(() => {
    return strategyClosedTrades.filter((t) => {
      const tradeDateObj = new Date(t.entry_date);
      const tradeDateStr = isNaN(tradeDateObj.getTime()) ? "" : getLocalDateString(tradeDateObj);
      const matchStartDate = !filterStartDate || tradeDateStr >= filterStartDate;
      const matchEndDate = !filterEndDate || tradeDateStr <= filterEndDate;
      return matchStartDate && matchEndDate;
    });
  }, [strategyClosedTrades, filterStartDate, filterEndDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleExportStrategyPDF = async () => {
    if (filteredStrategyTrades.length === 0) return;

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
    doc.text(`STRATEGY LEDGER: ${strategyName.toUpperCase()}`, textStartX, 26.5);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 142, 21);
    doc.text(`Total Trades: ${filteredStrategyTrades.length}`, 142, 26.5);

    const headers = [
      "Asset",
      "Type",
      "Lots",
      "Entry",
      "Exit",
      "SL",
      "TP",
      "Opened",
      "Closed",
      "P&L ($)",
      "P&L (%)"
    ];

    // Format dates to be compact (MM/DD) to avoid truncation / wrapping
    const formatCompactDate = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "—";
        const mon = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${mon}/${day}`;
      } catch (e) {
        return "—";
      }
    };

    const rows = filteredStrategyTrades.map((t) => [
      t.symbol,
      t.trade_type.toUpperCase(),
      t.quantity,
      t.entry_price_text || t.entry_price,
      t.exit_price_text || t.exit_price || "—",
      t.stop_loss || "—",
      t.take_profit || "—",
      formatCompactDate(t.entry_date),
      t.exit_date ? formatCompactDate(t.exit_date) : "—",
      t.pnl ? `${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}` : "0.00",
      t.pnl_percentage ? `${t.pnl_percentage >= 0 ? "+" : ""}${t.pnl_percentage.toFixed(2)}%` : "0.00%"
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
        9: { fontStyle: "bold", halign: "right" },
        10: { fontStyle: "bold", halign: "right" }
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

    const filename = `strategy_${strategyName.replace(/\s+/g, "_").toLowerCase()}_trades_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href={`/dashboard/${account.id}?tab=analytics`}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Link>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground">
              Strategy: <span className="text-gold-gradient">{strategyName}</span>
            </h1>
          </div>
          <p className="text-xs uppercase text-muted-foreground font-semibold">
            Performance Ledger for Account: {account.broker_type.toUpperCase()} ({account.account_id})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {filteredStrategyTrades.length > 0 && (
            <Button
              onClick={handleExportStrategyPDF}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-accent/20 border-primary/20 text-primary hover:border-primary/50 hover:bg-accent/40 text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export PDF Ledger
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Cumulative PnL</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-lg md:text-xl font-mono font-black",
              metrics.totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {metrics.totalPnL >= 0 ? "+" : ""}{formatCurrency(metrics.totalPnL)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Win Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-xl font-mono font-black text-foreground">
              {metrics.winRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Average PnL (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-lg md:text-xl font-mono font-black",
              metrics.avgPct >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {metrics.avgPct >= 0 ? "+" : ""}{metrics.avgPct.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/20 border-border/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-wider">Total Trades</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-xl font-mono font-black text-foreground">
              {metrics.total} <span className="text-[10px] text-muted-foreground font-mono">({metrics.winsCount}W / {metrics.lossesCount}L)</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Content */}
      <Card className="bg-card/20 border border-border/40 rounded-xl overflow-hidden">
        <CardHeader className="border-b border-border/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Strategy Trade History
              </CardTitle>
              <CardDescription className="text-[10px] uppercase text-muted-foreground mt-0.5">
                {filteredStrategyTrades.length} of {metrics.total} closed trades matching criteria
              </CardDescription>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-secondary/50 border border-primary/20 hover:border-primary/40 focus-within:border-primary/50 rounded-lg px-3 h-10 text-xs transition-all">
                <span className="text-[9px] uppercase font-black text-muted-foreground">From</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-foreground font-mono text-xs w-32 [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center gap-2 bg-secondary/50 border border-primary/20 hover:border-primary/40 focus-within:border-primary/50 rounded-lg px-3 h-10 text-xs transition-all">
                <span className="text-[9px] uppercase font-black text-muted-foreground">To</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-foreground font-mono text-xs w-32 [color-scheme:dark]"
                />
              </div>

              {(filterStartDate || filterEndDate) && (
                <Button
                  onClick={() => {
                    setFilterStartDate("");
                    setFilterEndDate("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-10 text-xs uppercase font-black text-muted-foreground hover:text-destructive hover:bg-transparent"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {filteredStrategyTrades.length === 0 ? (
              <div className="py-20 text-center text-sm text-muted-foreground uppercase font-black tracking-wider">
                No trades match the selected date range
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs md:text-sm">
                <thead>
                  <tr className="bg-neutral-900/30 text-[10px] uppercase font-extrabold text-foreground tracking-widest border-b border-border/20">
                    <th className="py-4 px-6">Asset/Symbol</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Lots/Quantity</th>
                    <th className="py-4 px-6">Entry Price</th>
                    <th className="py-4 px-6">Exit Price</th>
                    <th className="py-4 px-6">P&L ($)</th>
                    <th className="py-4 px-6">P&L (%)</th>
                    <th className="py-4 px-6">Closed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10 font-bold text-xs md:text-sm">
                  {filteredStrategyTrades.flatMap((t) => {
                    const isExpanded = expandedTradeId === t.id;
                    return [
                      <tr
                        key={t.id}
                        className="hover:bg-muted/5 transition-colors cursor-pointer"
                        onClick={() => setExpandedTradeId(isExpanded ? null : t.id)}
                      >
                        <td className="py-4 px-6 font-black text-foreground">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span>{t.symbol}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider",
                            t.trade_type === "long" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {t.trade_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-foreground">{t.quantity}</td>
                        <td className="py-4 px-6 font-mono text-foreground">${t.entry_price}</td>
                        <td className="py-4 px-6 font-mono text-foreground">
                          {t.exit_price ? `$${t.exit_price}` : "—"}
                        </td>
                        <td className={cn(
                          "py-4 px-6 font-mono",
                          (t.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {t.pnl !== null ? `${t.pnl >= 0 ? "+" : ""}${formatCurrency(t.pnl)}` : "—"}
                        </td>
                        <td className={cn(
                          "py-4 px-6 font-mono",
                          (t.pnl_percentage || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {t.pnl_percentage !== null ? `${t.pnl_percentage >= 0 ? "+" : ""}${t.pnl_percentage.toFixed(2)}%` : "—"}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground font-mono">
                          {new Date(t.entry_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                      </tr>,
                      isExpanded && (
                        <TradeDetailPanel
                          key={`${t.id}-details`}
                          trade={t}
                          colSpan={8}
                          onUpdate={() => router.refresh()}
                        />
                      )
                    ];
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
