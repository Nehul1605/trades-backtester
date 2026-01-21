import Decimal from "decimal.js-light"

export type TradeType = "long" | "short"

function normalizeSymbol(raw: string) {
  return raw.toUpperCase().replace(/\W/g, "")
}

function isForex(sym: string) {
  const s = normalizeSymbol(sym)
  if (s.length !== 6) return false
  const base = s.slice(0, 3)
  const quote = s.slice(3, 6)
  const fiat = new Set(["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"])
  return fiat.has(base) && fiat.has(quote)
}

function isMetals(sym: string) {
  const s = normalizeSymbol(sym)
  return s === "XAUUSD" || s === "XAGUSD"
}

// pip size detection for FX (BabyPips convention)
function getPipSize(sym: string) {
  const s = normalizeSymbol(sym)
  const quote = s.slice(3, 6)
  if (quote === "JPY") return new Decimal(0.01)
  return new Decimal(0.0001)
}

// USD pip value per 1 lot for common cases.
// - If quote is USD → $10 per pip per standard lot (100k)
// - If USD is base (e.g., USDJPY) → pip value in JPY = pipSize * 100000; convert to USD via price
// - If neither side is USD, we cannot convert reliably without a cross rate; we return null to fallback
function getFxPipValueUSD(sym: string, price: Decimal) {
  const s = normalizeSymbol(sym)
  const base = s.slice(0, 3)
  const quote = s.slice(3, 6)
  const lotUnits = new Decimal(100000) // standard lot

  const pipSize = getPipSize(s)

  if (quote === "USD") {
    // e.g., EURUSD, GBPUSD
    return pipSize.mul(lotUnits) // 0.0001 * 100000 = 10 USD
  }

  if (base === "USD") {
    // e.g., USDJPY. Pip value = pipSize * 100000 (JPY) then convert to USD by dividing by price (USD/JPY)
    const pipValueQuote = pipSize.mul(lotUnits) // in JPY
    if (price.lte(0)) return null
    return pipValueQuote.div(price) // USD
  }

  // cross pairs need a second conversion rate we don't have
  return null
}

// Metals common retail contracts
// XAUUSD: 1 lot = 100 oz, PnL = (exit - entry) * 100 * lots
// XAGUSD: 1 lot = 5000 oz, PnL = (exit - entry) * 5000 * lots
function getMetalContractSize(sym: string) {
  const s = normalizeSymbol(sym)
  if (s === "XAUUSD") return new Decimal(100)
  if (s === "XAGUSD") return new Decimal(5000)
  return null
}

export function computePnlUSD(params: {
  symbol: string
  entryPrice: number | string
  exitPrice: number | string
  quantity: number | string // interpret as lots for FX/Metals, units for others
  tradeType: TradeType
}): { pnl: number; pnlPct: number } {
  const symbol = normalizeSymbol(params.symbol)
  const entry = new Decimal(params.entryPrice)
  const exit = new Decimal(params.exitPrice)
  const qty = new Decimal(params.quantity)

  // Directional difference
  const diff = params.tradeType === "long" ? exit.minus(entry) : entry.minus(exit)

  // Metals
  if (isMetals(symbol)) {
    const contract = getMetalContractSize(symbol)
    if (contract) {
      const pnl = diff.mul(contract).mul(qty) // USD
      const pnlPct = entry.eq(0) ? new Decimal(0) : diff.div(entry).mul(100)
      return { pnl: Number(pnl), pnlPct: Number(pnlPct) }
    }
  }

  // Forex
  if (isForex(symbol)) {
    // Use mid price for conversion where needed
    const mid = entry.plus(exit).div(2)
    const pipSize = getPipSize(symbol)
    const pipValueUSD = getFxPipValueUSD(symbol, mid)

    if (pipValueUSD) {
      // pips moved
      const pips = diff.div(pipSize)
      const pnl = pips.mul(pipValueUSD).mul(qty) // USD
      const pnlPct = entry.eq(0) ? new Decimal(0) : diff.div(entry).mul(100)
      return { pnl: Number(pnl), pnlPct: Number(pnlPct) }
    } else {
      // Fallback: value in quote currency unknown → compute in quote currency units and return numeric
      // This yields a non-USD value; but still exact diff * (lot units)
      const lotUnits = new Decimal(100000)
      const pnlQuote = diff.mul(lotUnits).mul(qty) // quote currency
      const pnlPct = entry.eq(0) ? new Decimal(0) : diff.div(entry).mul(100)
      return { pnl: Number(pnlQuote), pnlPct: Number(pnlPct) }
    }
  }

  // Stocks/Crypto/Other → treat quantity as units
  const pnl = diff.mul(qty)
  const pnlPct = entry.eq(0) ? new Decimal(0) : diff.div(entry).mul(100)
  return { pnl: Number(pnl), pnlPct: Number(pnlPct) }
}
