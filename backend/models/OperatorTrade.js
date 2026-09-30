import mongoose from "mongoose";

const operatorTradeSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      default: "XAUUSD",
    },
    direction: {
      type: String,
      enum: ["long", "short"],
      required: true,
      default: "long",
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    exitPrice: {
      type: Number,
      default: null,
    },
    stopLoss: {
      type: Number,
      required: true,
    },
    takeProfit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting_for_trigger", "triggered", "open", "tp_hit", "sl_hit", "closed", "breakeven"],
      default: "waiting_for_trigger",
    },
    pnlPips: {
      type: Number,
      default: 0,
    },
    tradeCategory: {
      type: String,
      enum: ["operator_hq", "rdx_gold"],
      default: "operator_hq",
    },
    level1Price: {
      type: Number,
      default: null,
    },
    level2Price: {
      type: Number,
      default: null,
    },
    tp1: {
      type: Number,
      default: null,
    },
    tp2: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for query performance & LIFO ordering
operatorTradeSchema.index({ createdAt: -1, _id: -1 });
operatorTradeSchema.index({ symbol: 1, status: 1 });

const OperatorTrade = mongoose.model("OperatorTrade", operatorTradeSchema);
export default OperatorTrade;
