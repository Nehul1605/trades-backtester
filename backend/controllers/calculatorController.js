import Decimal from "decimal.js-light";

// Master Instrument Specs Database
export const INSTRUMENT_SPECS = [
  { symbol: "ETHUSD", label: "ETHUSD", pip: 0.1, type: "Crypto", category: "Crypto", contractMultiplier: 1, defaultEntry: 1900, defaultSL: 1850 },
  { symbol: "BTCUSD", label: "BTCUSD", pip: 1, type: "Crypto", category: "Crypto", contractMultiplier: 1, defaultEntry: 65500, defaultSL: 65000 },
  { symbol: "APPLE", label: "APPLE", pip: 0.01, type: "Stock", category: "Stock", contractMultiplier: 100, defaultEntry: 220, defaultSL: 215 },
  { symbol: "XAUUSD", label: "XAUUSD (Gold)", pip: 0.01, type: "Metal", category: "Metals", contractMultiplier: 100, defaultEntry: 4200, defaultSL: 4194 },
  { symbol: "XAGUSD", label: "XAGUSD (Silver)", pip: 0.001, type: "Metal", category: "Metals", contractMultiplier: 5000, defaultEntry: 57.0, defaultSL: 56.5 },
  { symbol: "DE30", label: "DE30 (DAX)", pip: 0.1, type: "Index", category: "Indices", contractMultiplier: 27, defaultEntry: 26200, defaultSL: 26100 },
  { symbol: "USTECH", label: "USTECH (Nasdaq)", pip: 0.1, type: "Index", category: "Indices", contractMultiplier: 20, defaultEntry: 29450, defaultSL: 29400 },
  { symbol: "US30", label: "US30 (Dow Jones)", pip: 1, type: "Index", category: "Indices", contractMultiplier: 5, defaultEntry: 53850, defaultSL: 53750 },
  { symbol: "EURUSD", label: "EURUSD", pip: 0.0001, type: "Forex", category: "Forex", contractMultiplier: 100000, defaultEntry: 1.15440, defaultSL: 1.15400, decimals: 5 },
  { symbol: "GBPUSD", label: "GBPUSD", pip: 0.0001, type: "Forex", category: "Forex", contractMultiplier: 100000, defaultEntry: 1.34540, defaultSL: 1.34500, decimals: 5 },
  { symbol: "USDJPY", label: "USDJPY", pip: 0.01, type: "Forex", category: "Forex", contractMultiplier: 100000, defaultEntry: 158.420, defaultSL: 158.320, decimals: 3 },
  { symbol: "DXY", label: "DXY (US Dollar Index)", pip: 0.01, type: "Index", category: "Indices", contractMultiplier: 1000, defaultEntry: 99.960, defaultSL: 99.900, decimals: 3 },
  { symbol: "USOIL", label: "USOIL (WTI Crude)", pip: 0.01, type: "Energy", category: "Commodities", contractMultiplier: 1000, defaultEntry: 77.820, defaultSL: 77.500, decimals: 3 },
];

/**
 * Get available instruments
 */
export const getInstruments = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      instruments: INSTRUMENT_SPECS,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Calculate position size based on user parameters
 */
export const calculatePositionSize = async (req, res) => {
  try {
    const {
      symbol = "DXY",
      direction = "long",
      balance = 100000,
      riskPercent = 1,
      entryPrice,
      stopLossPrice,
      stopLossPips,
      stopLossType = "price",
      takeProfitPrice,
      takeProfitPips,
      takeProfitType = "price",
    } = req.body;

    const numBalance = new Decimal(balance || 0);
    const numRiskPct = new Decimal(riskPercent || 0);
    
    if (numBalance.lte(0) || numRiskPct.lte(0)) {
      return res.status(400).json({ success: false, message: "Balance and risk percentage must be greater than zero" });
    }

    const riskAmount = numBalance.mul(numRiskPct).div(100);

    // Find instrument spec or set fallback
    const symUpper = (symbol || "").toUpperCase();
    const spec = INSTRUMENT_SPECS.find((item) => item.symbol === symUpper) || {
      symbol: symUpper,
      pip: 0.01,
      type: "Custom",
      contractMultiplier: 1,
    };

    const pipSize = new Decimal(spec.pip);
    const entry = new Decimal(entryPrice || spec.defaultEntry || 100);

    if (entry.lte(0)) {
      return res.status(400).json({ success: false, message: "Entry price must be greater than zero" });
    }

    // Determine Stop Loss price and Stop Loss pips
    let slPrice = new Decimal(0);
    let slPips = new Decimal(0);

    if (stopLossType === "pips") {
      slPips = new Decimal(stopLossPips || 0);
      if (slPips.lte(0)) {
        return res.status(400).json({ success: false, message: "Stop loss pips must be positive" });
      }
      const distance = slPips.mul(pipSize);
      slPrice = direction === "long" ? entry.minus(distance) : entry.plus(distance);
    } else {
      const rawSL = new Decimal(stopLossPrice || 0);
      if (rawSL.lte(0)) {
        return res.status(400).json({ success: false, message: "Stop loss price must be positive" });
      }
      const diff = entry.minus(rawSL).abs();
      if (diff.lte(0)) {
        return res.status(400).json({ success: false, message: "Stop loss price must be different from entry price" });
      }
      slPips = diff.div(pipSize);
      slPrice = direction === "long" ? entry.minus(diff) : entry.plus(diff);
    }

    const priceDiff = entry.minus(slPrice).abs();

    // Calculate Lot Size & Pip Value per Lot based on instrument type
    let pipValuePerLot = new Decimal(0);
    let standardLots = new Decimal(0);

    if (spec.type === "Forex") {
      if (spec.symbol === "USDJPY") {
        // USDJPY pip value per standard lot (100k JPY / entry price)
        pipValuePerLot = pipSize.mul(100000).div(entry);
        const lossPerLot = slPips.mul(pipValuePerLot);
        standardLots = riskAmount.div(lossPerLot);
      } else {
        // EURUSD, GBPUSD (USD quote pair) -> $10 per pip per standard lot
        pipValuePerLot = new Decimal(10);
        const lossPerLot = slPips.mul(pipValuePerLot);
        standardLots = riskAmount.div(lossPerLot);
      }
    } else {
      // Commodities, Indices, Stocks, Crypto
      // Contract value loss per 1.0 point = contractMultiplier * priceDiff
      const multiplier = new Decimal(spec.contractMultiplier);
      const lossPerLot = priceDiff.mul(multiplier);
      standardLots = riskAmount.div(lossPerLot);
      pipValuePerLot = pipSize.mul(multiplier);
    }

    const miniLots = standardLots.mul(10);
    const microLots = standardLots.mul(100);

    // Determine Take Profit
    let tpPrice = null;
    let tpPips = null;
    let potentialReward = null;
    let rewardToRiskRatio = null;

    if (takeProfitPrice || takeProfitPips) {
      if (takeProfitType === "pips" && takeProfitPips) {
        tpPips = new Decimal(takeProfitPips);
        const tpDistance = tpPips.mul(pipSize);
        tpPrice = direction === "long" ? entry.plus(tpDistance) : entry.minus(tpDistance);
      } else if (takeProfitType === "rr" && takeProfitPips) {
        // takeProfitPips passed as RR ratio value e.g. 2 for 1:2
        const rr = new Decimal(takeProfitPips);
        tpPips = slPips.mul(rr);
        const tpDistance = tpPips.mul(pipSize);
        tpPrice = direction === "long" ? entry.plus(tpDistance) : entry.minus(tpDistance);
      } else if (takeProfitPrice) {
        tpPrice = new Decimal(takeProfitPrice);
        const tpDiff = direction === "long" ? tpPrice.minus(entry) : entry.minus(tpPrice);
        if (tpDiff.gt(0)) {
          tpPips = tpDiff.div(pipSize);
        }
      }

      if (tpPips && tpPips.gt(0) && slPips.gt(0)) {
        rewardToRiskRatio = Number(tpPips.div(slPips).toFixed(2));
        potentialReward = Number(riskAmount.mul(rewardToRiskRatio).toFixed(2));
      }
    }

    return res.status(200).json({
      success: true,
      calculation: {
        symbol: spec.symbol,
        instrumentType: spec.type,
        pipSize: Number(pipSize.toString()),
        direction,
        balance: Number(numBalance.toFixed(2)),
        riskPercent: Number(numRiskPct.toFixed(2)),
        riskAmount: Number(riskAmount.toFixed(2)),
        entryPrice: Number(entry.toFixed(5)),
        stopLossPrice: Number(slPrice.toFixed(5)),
        stopLossPips: Number(slPips.toFixed(1)),
        takeProfitPrice: tpPrice ? Number(tpPrice.toFixed(5)) : null,
        takeProfitPips: tpPips ? Number(tpPips.toFixed(1)) : null,
        positionSizeStandard: Number(standardLots.toFixed(2)),
        positionSizeMini: Number(miniLots.toFixed(1)),
        positionSizeMicro: Number(microLots.toFixed(0)),
        pipValue: Number(pipValuePerLot.toFixed(2)),
        potentialReward,
        rewardToRiskRatio,
      },
    });
  } catch (error) {
    console.error("Position calculation error:", error);
    return res.status(500).json({ success: false, message: error.message || "Calculation failed" });
  }
};
