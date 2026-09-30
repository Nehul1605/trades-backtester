import OperatorTrade from "../models/OperatorTrade.js";
import User from "../models/User.js";

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
    const rawTrades = await OperatorTrade.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1, _id: -1 });

    // Explicitly sort in memory by createdAt descending, tie-breaking by _id descending (LIFO)
    const trades = [...rawTrades].sort((a, b) => {
      const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return String(b._id).localeCompare(String(a._id));
    });

    // Helper to calculate stats for a list of trades
    const calculateStats = (tradeList) => {
      const totalSignals = tradeList.length;
      const openSignals = tradeList.filter((t) => t.status === "open" || t.status === "triggered").length;
      const waitingCount = tradeList.filter((t) => t.status === "waiting_for_trigger").length;
      const triggeredCount = tradeList.filter((t) => t.status === "triggered").length;
      const winCount = tradeList.filter((t) => t.status === "tp_hit" || (t.status === "closed" && t.pnlPips > 0)).length;
      const lossCount = tradeList.filter((t) => t.status === "sl_hit" || (t.status === "closed" && t.pnlPips < 0)).length;
      const closedCount = winCount + lossCount;
      const accuracyPercent = closedCount > 0 ? Number(((winCount / closedCount) * 100).toFixed(1)) : 0;
      const totalPips = Number(tradeList.reduce((sum, t) => sum + (t.pnlPips || 0), 0).toFixed(1));

      return {
        totalSignals,
        openSignals,
        waitingCount,
        triggeredCount,
        winCount,
        lossCount,
        closedCount,
        accuracyPercent,
        totalPips,
      };
    };

    const overallStats = calculateStats(trades);

    const operatorHqTrades = trades.filter((t) => !t.tradeCategory || t.tradeCategory === "operator_hq");
    const rdxGoldTrades = trades.filter((t) => t.tradeCategory === "rdx_gold");

    const operatorHqStats = calculateStats(operatorHqTrades);
    const rdxGoldStats = calculateStats(rdxGoldTrades);

    // Group trades by Month (e.g., "August 2026", "July 2026")
    const monthGroups = {};

    trades.forEach((trade) => {
      const date = new Date(trade.createdAt || Date.now());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // e.g. "2026-08"
      const monthName = date.toLocaleString("en-US", { month: "long", year: "numeric" }); // e.g. "August 2026"

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {
          monthKey,
          monthName,
          trades: [],
        };
      }
      monthGroups[monthKey].trades.push(trade);
    });

    // Always include all 2026 months starting from August 2026 (August, September, October, November, December)
    const startYear = 2026;
    for (let m = 7; m < 12; m++) {
      const tempDate = new Date(startYear, m, 1);
      const monthKey = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}`;
      const monthName = tempDate.toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {
          monthKey,
          monthName,
          trades: [],
        };
      }
    }

    // Ensure current running month is always present
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentMonthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!monthGroups[currentMonthKey]) {
      monthGroups[currentMonthKey] = {
        monthKey: currentMonthKey,
        monthName: currentMonthName,
        trades: [],
      };
    }

    const monthlyData = Object.keys(monthGroups)
      .sort((a, b) => a.localeCompare(b)) // Chronological order starting from August 2026
      .map((monthKey) => {
        const group = monthGroups[monthKey];
        const groupTrades = [...group.trades].sort((a, b) => {
          const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (timeDiff !== 0) return timeDiff;
          return String(b._id).localeCompare(String(a._id));
        });
        return {
          monthKey: group.monthKey,
          monthName: group.monthName,
          stats: calculateStats(groupTrades),
          trades: groupTrades,
        };
      });

    return res.status(200).json({
      success: true,
      stats: overallStats,
      operatorHqStats,
      rdxGoldStats,
      monthlyData,
      trades,
      operatorHqTrades,
      rdxGoldTrades,
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
    const user = await User.findById(req.userId);
    if (!user || (user.role !== "admin" && user.role !== "broadcaster")) {
      return res.status(403).json({ success: false, message: "Forbidden: Only admins and broadcasters can post trade signals" });
    }
    const {
      symbol = "XAUUSD",
      direction = "long",
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      status = "open",
      notes,
      createdAt,
      tradeCategory = "operator_hq",
      level1Price,
      level2Price,
      tp1,
      tp2,
    } = req.body;

    // RDX Gold Trades are exclusive to Admin (You)
    if (tradeCategory === "rdx_gold" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only the main Admin can post RDX Gold Trades" });
    }

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

    const tradeData = {
      createdBy: req.userId,
      symbol: symbol.toUpperCase(),
      direction,
      entryPrice: Number(entryPrice),
      exitPrice: exitPrice ? Number(exitPrice) : null,
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      status,
      pnlPips,
      tradeCategory: tradeCategory === "rdx_gold" ? "rdx_gold" : "operator_hq",
      level1Price: level1Price ? Number(level1Price) : null,
      level2Price: level2Price ? Number(level2Price) : null,
      tp1: tp1 ? Number(tp1) : null,
      tp2: tp2 ? Number(tp2) : null,
      notes: notes || "",
    };

    let trade;
    if (createdAt) {
      const inputDate = new Date(createdAt);
      // If user passed a YYYY-MM-DD date without specific time, incorporate current time so intra-day sequence is preserved
      if (typeof createdAt === "string" && createdAt.trim().length === 10) {
        const now = new Date();
        inputDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      }
      tradeData.createdAt = inputDate;
      trade = new OperatorTrade(tradeData);
      await trade.save({ timestamps: false });
    } else {
      trade = await OperatorTrade.create(tradeData);
    }

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
    const user = await User.findById(req.userId);
    if (!user || (user.role !== "admin" && user.role !== "broadcaster")) {
      return res.status(403).json({ success: false, message: "Forbidden: Only admins and broadcasters can update trade signals" });
    }
    const { id } = req.params;
    const { status, exitPrice, stopLoss, takeProfit, notes, level1Price, level2Price, tp1, tp2, tradeCategory } = req.body;

    const trade = await OperatorTrade.findById(id);
    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade signal call not found" });
    }

    // RDX Gold Trades are exclusive to Admin (You)
    if ((trade.tradeCategory === "rdx_gold" || tradeCategory === "rdx_gold") && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only the main Admin can update RDX Gold Trades" });
    }

    if (tradeCategory) trade.tradeCategory = tradeCategory;
    if (status) trade.status = status;
    if (exitPrice !== undefined) trade.exitPrice = exitPrice ? Number(exitPrice) : null;
    if (stopLoss !== undefined) trade.stopLoss = Number(stopLoss);
    if (takeProfit !== undefined) trade.takeProfit = Number(takeProfit);
    if (level1Price !== undefined) trade.level1Price = level1Price ? Number(level1Price) : null;
    if (level2Price !== undefined) trade.level2Price = level2Price ? Number(level2Price) : null;
    if (tp1 !== undefined) trade.tp1 = tp1 ? Number(tp1) : null;
    if (tp2 !== undefined) trade.tp2 = tp2 ? Number(tp2) : null;
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
    const user = await User.findById(req.userId);
    if (!user || (user.role !== "admin" && user.role !== "broadcaster")) {
      return res.status(403).json({ success: false, message: "Forbidden: Only admins and broadcasters can delete trade signals" });
    }
    const { id } = req.params;
    const trade = await OperatorTrade.findById(id);
    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade signal call not found" });
    }

    if (trade.tradeCategory === "rdx_gold" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only the main Admin can delete RDX Gold Trades" });
    }

    await trade.deleteOne();
    return res.status(200).json({ success: true, message: "Signal call removed" });
  } catch (error) {
    console.error("Delete operator trade error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
