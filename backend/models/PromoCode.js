import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    durationDays: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      default: null, // null means unlimited uses
    },
    usesCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null, // optional campaign hard expiry
    },
  },
  {
    timestamps: true,
  }
);

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
export default PromoCode;
