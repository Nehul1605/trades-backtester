import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    broker: {
      type: String,
      required: true,
      trim: true,
    },
    tradingAccountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    telegramUsername: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const VerificationRequest = mongoose.model(
  "VerificationRequest",
  verificationRequestSchema
);
export default VerificationRequest;
