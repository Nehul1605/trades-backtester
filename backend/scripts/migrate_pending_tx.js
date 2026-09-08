import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Transaction from "../models/Transaction.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const pendingCountBefore = await Transaction.countDocuments({ status: "PENDING" });
  console.log(`Found ${pendingCountBefore} PENDING transactions.`);

  if (pendingCountBefore > 0) {
    const result = await Transaction.updateMany(
      { status: "PENDING" },
      { $set: { status: "FAILED" } }
    );
    console.log(`Updated ${result.modifiedCount} transactions to FAILED.`);
  }

  const allTx = await Transaction.find().select("orderId amount currency status planType createdAt");
  console.log("All transactions count:", allTx.length);

  await mongoose.disconnect();
}

run().catch(console.error);
