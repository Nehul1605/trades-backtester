import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentSessionId: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    planType: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PAID", "FAILED", "PENDING", "CANCELLED"],
      default: "PENDING",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "",
    },
    txMsg: {
      type: String,
      default: "",
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
