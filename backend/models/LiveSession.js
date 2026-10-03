import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const liveSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General Market Analysis",
    },
    targetAudience: {
      type: String,
      enum: ["TTP", "HQ"],
      default: "TTP",
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coHosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },
    roomName: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [chatMessageSchema],
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const LiveSession = mongoose.model("LiveSession", liveSessionSchema);
export default LiveSession;

