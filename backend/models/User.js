import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    password_hash: {
      type: String,
      default: null, // Allow null for OAuth logins
    },
    provider: {
      type: String,
      required: true,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    statusRemarks: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "broadcaster", "member"],
      default: "user",
    },
    image: {
      type: String,
      default: "",
    },
    isPromoUser: {
      type: Boolean,
      default: false,
    },
    promoCode: {
      type: String,
      default: "",
    },
    promoActivatedAt: {
      type: Date,
      default: null,
    },
    promoExpiresAt: {
      type: Date,
      default: null,
    },
    trialWarningEmailSent: {
      type: Boolean,
      default: false,
    },
    trialEndedEmailSent: {
      type: Boolean,
      default: false,
    },
    isPremiumUser: {
      type: Boolean,
      default: false,
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
