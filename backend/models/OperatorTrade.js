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
      enum: ["open", "tp_hit", "sl_hit", "closed", "breakeven"],
      default: "open",
    },
    pnlPips: {
      type: Number,
      default: 0,
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

// Index for query performance
operatorTradeSchema.index({ createdAt: -1 });
operatorTradeSchema.index({ symbol: 1, status: 1 });

const OperatorTrade = mongoose.model("OperatorTrade", operatorTradeSchema);
export default OperatorTrade;
