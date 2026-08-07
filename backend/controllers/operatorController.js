import OperatorTrade from "../models/OperatorTrade.js";

/**
 * Helper to calculate pips gained/lost
 */
function calculatePips(symbol, direction, entryPrice, exitPrice) {
  if (!entryPrice || !exitPrice) return 0;
  const sym = (symbol || "").toUpperCase();
  let pipSize = 0.01;
  if (sym.includes("EUR") || sym.includes("GBP") || sym.includes("AUD") || sym.includes("NZD") || sym.includes("CAD")) {
    pipSize = 0.0001;
  } else if (sym.includes("JPY")) {
    pipSize = 0.01;
  } else if (sym.includes("XAU") || sym.includes("GOLD")) {
    pipSize = 0.1; // 1 pip = 0.1 for Gold or 0.01
  }

  const diff = direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
  return Number((diff / pipSize).toFixed(1));
}

/**
 * Get all Operator HQ trade calls with accuracy analytics
 */
export const getOperatorTrades = async (req, res) => {
  try {
    const trades = await OperatorTrade.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    const totalSignals = trades.length;
    const openSignals = trades.filter((t) => t.status === "open").length;
    const winCount = trades.filter((t) => t.status === "tp_hit" || (t.status === "closed" && t.pnlPips > 0)).length;
    const lossCount = trades.filter((t) => t.status === "sl_hit" || (t.status === "closed" && t.pnlPips < 0)).length;
    const closedCount = winCount + lossCount;

    const accuracyPercent = closedCount > 0 ? Number(((winCount / closedCount) * 100).toFixed(1)) : 0;
    const totalPips = Number(trades.reduce((sum, t) => sum + (t.pnlPips || 0), 0).toFixed(1));

    return res.status(200).json({
      success: true,
      stats: {
        totalSignals,
        openSignals,
        winCount,
        lossCount,
        closedCount,
        accuracyPercent,
        totalPips,
      },
      trades,
    });
  } catch (error) {
    console.error("Get operator trades error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

/**
 * Create a new Operator HQ trade call (Admin/Operator)
 */
export const createOperatorTrade = async (req, res) => {
  try {
    const {
      symbol = "XAUUSD",
      direction = "long",
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      status = "open",
      notes,
    } = req.body;

    if (!entryPrice || !stopLoss || !takeProfit) {
      return res.status(400).json({ success: false, message: "Entry price, Stop Loss, and Take Profit are required" });
    }

    let pnlPips = 0;
    if (exitPrice && exitPrice > 0) {
      pnlPips = calculatePips(symbol, direction, Number(entryPrice), Number(exitPrice));
    } else if (status === "tp_hit") {
      pnlPips = calculatePips(symbol, direction, Number(entryPrice), Number(takeProfit));
    } else if (status === "sl_hit") {
      pnlPips = calculatePips(symbol, direction, Number(entryPrice), Number(stopLoss));
    }

    const trade = await OperatorTrade.create({
      createdBy: req.userId,
      symbol: symbol.toUpperCase(),
      direction,
      entryPrice: Number(entryPrice),
      exitPrice: exitPrice ? Number(exitPrice) : null,
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      status,
      pnlPips,
      notes: notes || "",
    });

    return res.status(201).json({ success: true, trade });
  } catch (error) {
    console.error("Create operator trade error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

/**
 * Update / Close an Operator HQ trade call (Admin/Operator)
 */
export const updateOperatorTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, exitPrice, stopLoss, takeProfit, notes } = req.body;

    const trade = await OperatorTrade.findById(id);
    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade signal call not found" });
    }

    if (status) trade.status = status;
    if (exitPrice !== undefined) trade.exitPrice = exitPrice ? Number(exitPrice) : null;
    if (stopLoss !== undefined) trade.stopLoss = Number(stopLoss);
    if (takeProfit !== undefined) trade.takeProfit = Number(takeProfit);
    if (notes !== undefined) trade.notes = notes;

    // Recalculate pips based on status & exit price
    if (trade.status === "tp_hit") {
      const targetExit = trade.exitPrice || trade.takeProfit;
      trade.pnlPips = calculatePips(trade.symbol, trade.direction, trade.entryPrice, targetExit);
    } else if (trade.status === "sl_hit") {
      const targetExit = trade.exitPrice || trade.stopLoss;
      trade.pnlPips = calculatePips(trade.symbol, trade.direction, trade.entryPrice, targetExit);
    } else if (trade.exitPrice && trade.exitPrice > 0) {
      trade.pnlPips = calculatePips(trade.symbol, trade.direction, trade.entryPrice, trade.exitPrice);
    } else if (trade.status === "breakeven") {
      trade.pnlPips = 0;
    }

    await trade.save();
    return res.status(200).json({ success: true, trade });
  } catch (error) {
    console.error("Update operator trade error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

/**
 * Delete an Operator HQ trade call (Admin/Operator)
 */
export const deleteOperatorTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await OperatorTrade.findById(id);
    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade signal call not found" });
    }

    await trade.deleteOne();
    return res.status(200).json({ success: true, message: "Signal call removed" });
  } catch (error) {
    console.error("Delete operator trade error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
