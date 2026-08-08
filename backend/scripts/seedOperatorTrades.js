import mongoose from "mongoose";
import dotenv from "dotenv";
import OperatorTrade from "../models/OperatorTrade.js";
import User from "../models/User.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Find an admin or first user
    let user = await User.findOne({ role: "admin" });
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      console.error("No user found in DB to attach createdBy");
      process.exit(1);
    }

    const sampleTrades = [
      // September 2026 Trade
      {
        createdBy: user._id,
        symbol: "XAUUSD",
        direction: "long",
        entryPrice: 2510.0,
        exitPrice: 2535.0,
        stopLoss: 2495.0,
        takeProfit: 2535.0,
        status: "tp_hit",
        pnlPips: 250,
        notes: "September NFP liquidity sweep long setup hit TP.",
        createdAt: new Date("2026-09-05T10:00:00Z"),
      },
      // August 2026 Trades
      {
        createdBy: user._id,
        symbol: "XAUUSD",
        direction: "long",
        entryPrice: 2420.0,
        exitPrice: 2445.0,
        stopLoss: 2405.0,
        takeProfit: 2445.0,
        status: "tp_hit",
        pnlPips: 250,
        notes: "Gold CPI release expansion long.",
        createdAt: new Date("2026-08-05T14:30:00Z"),
      },
      {
        createdBy: user._id,
        symbol: "EURUSD",
        direction: "short",
        entryPrice: 1.0920,
        exitPrice: 1.0850,
        stopLoss: 1.0960,
        takeProfit: 1.0850,
        status: "tp_hit",
        pnlPips: 70,
        notes: "EURUSD H4 breaker block short.",
        createdAt: new Date("2026-08-02T09:15:00Z"),
      },
      // July 2026 Trades
      {
        createdBy: user._id,
        symbol: "XAUUSD",
        direction: "short",
        entryPrice: 2380.0,
        exitPrice: 2360.0,
        stopLoss: 2395.0,
        takeProfit: 2360.0,
        status: "tp_hit",
        pnlPips: 200,
        notes: "July FOMC pullback short execution.",
        createdAt: new Date("2026-07-20T18:00:00Z"),
      },
      {
        createdBy: user._id,
        symbol: "EURUSD",
        direction: "long",
        entryPrice: 1.0810,
        exitPrice: 1.0770,
        stopLoss: 1.0770,
        takeProfit: 1.0890,
        status: "sl_hit",
        pnlPips: -40,
        notes: "Euro liquidity grab attempt hit SL.",
        createdAt: new Date("2026-07-10T11:00:00Z"),
      },
    ];

    await OperatorTrade.deleteMany({ notes: { $regex: /September|August|July/i } });
    const inserted = await OperatorTrade.insertMany(sampleTrades);
    console.log(`Successfully seeded ${inserted.length} sample Operator HQ signal trades!`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
