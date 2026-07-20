import Decimal from "decimal.js-light";

export type TradeType = "long" | "short";

function normalizeSymbol(raw: string) {
  return raw.toUpperCase().replace(/\W/g, "");
}

/* =====================================================
   SYMBOL CLASSIFICATION
===================================================== */

function isForex(sym: string) {
  const s = normalizeSymbol(sym);
  if (s.length !== 6) return false;
  const base = s.slice(0, 3);
  const quote = s.slice(3, 6);
  const fiat = new Set([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CHF",
    "AUD",
    "CAD",
    "NZD",
  ]);
  return fiat.has(base) && fiat.has(quote);
}

function isMetals(sym: string) {
  const s = normalizeSymbol(sym);
  return s === "XAUUSD" || s === "XAGUSD";
}

function isOil(sym: string) {
  const s = normalizeSymbol(sym);
  return s === "USOIL" || s === "UKOIL" || s === "WTI";
}

function isIndex(sym: string) {
  const s = normalizeSymbol(sym);
  const indices = [
    "US30",
    "USTECH",
    "NAS100",
    "DE30",
    "GER30",
    "DXY",
    "USDX",
    "SPX500",
    "US500",
    "UK100",
    "JPN225",
    "HKG33",
    "AUS200",
  ];
  return indices.includes(s);
}

function isStock(sym: string) {
  const s = normalizeSymbol(sym);
  const stocks = [
    "AAPL",
    "APPLE",
    "TSLA",
    "MSFT",
    "AMZN",
    "GOOG",
    "NVDA",
    "META",
    "NFLX",
  ];
  // Most US stocks are 3-4 letters. Indices and Metals are handled first.
  return (
    stocks.includes(s) ||
    (s.length >= 3 &&
      s.length <= 5 &&
      !isForex(s) &&
      !isIndex(s) &&
      !isMetals(s) &&
      !isOil(s))
  );
}

/* =====================================================
   CONTRACT SIZES
===================================================== */

function getMetalContractSize(sym: string) {
  const s = normalizeSymbol(sym);
  if (s === "XAUUSD") return new Decimal(100); // 100 oz
  if (s === "XAGUSD") return new Decimal(5000); // 5000 oz
  return null;
}

function getIndexContractSize(sym: string) {
  const s = normalizeSymbol(sym);
  if (s === "DXY" || s === "USDX") return new Decimal(1000);
  if (s === "DE30" || s === "GER30") return new Decimal(25);
  return new Decimal(1); // Default for US30/USTECH often 1 per lot or 10
}

function getStockContractSize() {
  return new Decimal(100); // Standard 1 lot = 100 shares
}

function getOilContractSize() {
  return new Decimal(1000); // 1000 barrels per lot
}

function getForexLotSize() {
  return new Decimal(100000); // standard lot
}

/* =====================================================
   FOREX HELPERS
===================================================== */

function getPipSize(sym: string) {
  const s = normalizeSymbol(sym);
  const quote = s.slice(3, 6);
  if (quote === "JPY") return new Decimal(0.01);
  return new Decimal(0.0001);
}

function getFxPipValueUSD(
  sym: string,
  price: Decimal,
  conversionRate?: Decimal, // required for cross pairs
) {
  const s = normalizeSymbol(sym);
  const base = s.slice(0, 3);
  const quote = s.slice(3, 6);

  const lotUnits = getForexLotSize();
  const pipSize = getPipSize(s);

  // QUOTE = USD (EURUSD)
  if (quote === "USD") {
    return pipSize.mul(lotUnits);
  }

  // BASE = USD (USDJPY)
  if (base === "USD") {
    if (price.lte(0)) return null;
    const pipValueQuote = pipSize.mul(lotUnits);
    return pipValueQuote.div(price);
  }

  // CROSS PAIR (EURGBP etc.)
  if (conversionRate && conversionRate.gt(0)) {
    const pipValueQuote = pipSize.mul(lotUnits);
    return pipValueQuote.mul(conversionRate);
  }

  return null;
}

/* =====================================================
   MAIN PNL FUNCTION
===================================================== */

export function computePnlUSD(params: {
  symbol: string;
  entryPrice: number | string;
  exitPrice: number | string;
  quantity: number | string;
  tradeType: TradeType;
  conversionRate?: number | string; // REQUIRED for FX cross pairs
}): { pnl: number; pnlPct: number } {
  try {
    const symbol = normalizeSymbol(params.symbol || "");
    const entry = new Decimal(params.entryPrice || 0);
    const exit = new Decimal(params.exitPrice || 0);
    const qty = new Decimal(params.quantity || 0);
    const conversion = params.conversionRate
      ? new Decimal(params.conversionRate)
      : undefined;

    // If entry or exit price is 0 or invalid, P&L is 0
    if (entry.lte(0) || exit.lte(0) || qty.lte(0)) {
      return { pnl: 0, pnlPct: 0 };
    }

    const diff =
      params.tradeType === "long" ? exit.minus(entry) : entry.minus(exit);

    /* ================= METALS ================= */

    if (isMetals(symbol)) {
      const contract = getMetalContractSize(symbol);
      if (!contract) return { pnl: 0, pnlPct: 0 };

      const pnl = diff.mul(contract).mul(qty);
      const pnlPct = diff.div(entry).mul(100);

      return { pnl: Number(pnl.toFixed(5)), pnlPct: Number(pnlPct.toFixed(8)) };
    }

    /* ================= OIL ================= */

    if (isOil(symbol)) {
      const contract = getOilContractSize();
      const pnl = diff.mul(contract).mul(qty);
      const pnlPct = diff.div(entry).mul(100);

      return { pnl: Number(pnl.toFixed(5)), pnlPct: Number(pnlPct.toFixed(8)) };
    }

    /* ================= INDEXES (DXY etc.) ================= */

    if (isIndex(symbol)) {
      const contract = getIndexContractSize(symbol);
      const pnl = diff.mul(contract).mul(qty);
      const pnlPct = diff.div(entry).mul(100);

      return { pnl: Number(pnl.toFixed(5)), pnlPct: Number(pnlPct.toFixed(8)) };
    }

    /* ================= STOCKS (AAPL etc.) ================= */

    if (isStock(symbol)) {
      const contract = getStockContractSize();
      const pnl = diff.mul(contract).mul(qty);
      const pnlPct = diff.div(entry).mul(100);

      return { pnl: Number(pnl.toFixed(5)), pnlPct: Number(pnlPct.toFixed(8)) };
    }

    /* ================= FOREX ================= */

    if (isForex(symbol)) {
      const mid = entry.plus(exit).div(2);

      const pipValueUSD = getFxPipValueUSD(symbol, mid, conversion);

      if (!pipValueUSD) {
        // Fallback: 10 units per lot per pip (standard for USD-quote pairs like EURUSD)
        const pips = diff.div(getPipSize(symbol));
        const pnl = pips.mul(10).mul(qty);
        const pnlPct = diff.div(entry).mul(100);
        return {
          pnl: Number(pnl.toFixed(5)),
          pnlPct: Number(pnlPct.toFixed(8)),
        };
      }

      const pips = diff.div(getPipSize(symbol));
      const pnl = pips.mul(pipValueUSD).mul(qty);
      const pnlPct = diff.div(entry).mul(100);

      return { pnl: Number(pnl.toFixed(5)), pnlPct: Number(pnlPct.toFixed(8)) };
    }

    /* ================= CRYPTO / FALLBACK ================= */

    const pnl = diff.mul(qty);
    const pnlPct = diff.div(entry).mul(100);

    return { pnl: Number(pnl.toFixed(5)), pnlPct: Number(pnlPct.toFixed(8)) };
  } catch (err) {
    console.error("PnL Calculation error:", err);
    return { pnl: 0, pnlPct: 0 };
  }
}
