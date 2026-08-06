import mongoose from "mongoose";

const brokerAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    brokerType: {
      type: String,
      required: true, // exness / mt5 / etc
    },
    accountId: {
      type: String,
      required: true,
    },
    server: {
      type: String,
      required: false,
      default: "demo",
    },
    password: {
      type: String,
      required: false,
      default: "demo",
    },
    status: {
      type: String,
      default: "connected",
    },
    balance: {
      type: Number,
      default: 0,
    },
    equity: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    lastSync: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user account lookups and sorting
brokerAccountSchema.index({ userId: 1, createdAt: -1 });
brokerAccountSchema.index({ userId: 1, accountId: 1 });

const BrokerAccount = mongoose.model("BrokerAccount", brokerAccountSchema);
export default BrokerAccount;
