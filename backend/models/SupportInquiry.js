import mongoose from "mongoose";

const supportInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      default: "General Support Inquiry",
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "replied", "closed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const SupportInquiry = mongoose.model("SupportInquiry", supportInquirySchema);
export default SupportInquiry;
