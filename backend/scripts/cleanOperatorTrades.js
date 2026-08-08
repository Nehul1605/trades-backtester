import mongoose from "mongoose";
import dotenv from "dotenv";
import OperatorTrade from "../models/OperatorTrade.js";

dotenv.config();

async function clean() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for cleaning sample signal data...");

    // Delete all sample trades created during seeding
    const result = await OperatorTrade.deleteMany({
      $or: [
        { notes: { $regex: /September|August|July|Gold CPI|FOMC|NFP|H4 breaker|liquidity grab/i } },
        { createdBy: new mongoose.Types.ObjectId("6a5d92e09a3b0d02a7c3d15b") }
      ]
    });

    console.log(`Cleaned up ${result.deletedCount} sample Operator HQ signal trades.`);
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

clean();
