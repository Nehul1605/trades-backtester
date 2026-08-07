import mongoose from "mongoose";

const brokerAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountCategory: {
      type: String,
      default: "broker", // "broker" | "prop_firm"
    },
    marketType: {
      type: String,
      default: "cfd", // "cfd" | "futures"
    },
    brokerType: {
      type: String,
      required: true, // XM / Zuperior / Funding Pips / etc
    },
    customFirmName: {
      type: String,
      default: "",
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
    sortOrder: {
      type: Number,
      default: 0,
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
