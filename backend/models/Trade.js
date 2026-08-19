import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    exitPrice: {
      type: Number,
      default: null,
    },
    entryPriceText: {
      type: String,
      default: "",
    },
    exitPriceText: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
    },
    tradeType: {
      type: String,
      required: true,
      enum: ["long", "short"],
    },
    entryDate: {
      type: String, // String ISO format format (e.g. YYYY-MM-DD) or ISO String
      required: true,
    },
    exitDate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "closed"],
      default: "open",
    },
    strategyName: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    screenshotUrl: {
      type: String,
      default: null,
    },
    pnl: {
      type: Number,
      default: null,
    },
    pnlPercentage: {
      type: Number,
      default: null,
    },
    stopLoss: {
      type: Number,
      default: null,
    },
    takeProfit: {
      type: Number,
      default: null,
    },
    brokerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrokerAccount",
      default: null,
      index: true,
    },
    externalId: {
      type: String,
      default: null,
    },
    commission: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast user-wise, account-wise, and symbol-wise queries
tradeSchema.index({ userId: 1, entryDate: -1 });
tradeSchema.index({ userId: 1, brokerAccountId: 1, entryDate: -1 });
tradeSchema.index({ userId: 1, symbol: 1 });
tradeSchema.index({ userId: 1, status: 1 });
tradeSchema.index({ brokerAccountId: 1, externalId: 1 });

const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;
