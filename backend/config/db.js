import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const seedDirectAccessUsers = async () => {
  try {
    const usersToSeed = [
      { name: "Amit", email: "amit@gmail.com", password: "amit1234" },
      { name: "Naman", email: "naman@gmail..com", password: "naman1234" },
      { name: "Naman Corrected", email: "naman@gmail.com", password: "naman1234" }
    ];

    for (const u of usersToSeed) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(u.password, salt);
        await User.create({
          name: u.name,
          email: u.email,
          password_hash,
          provider: "credentials",
          status: "approved",
          role: "member"
        });
        console.log(`👤 Seeded direct access user: ${u.email}`);
      } else {
        // If user already exists, verify they have the 'approved' status
        if (exists.status !== "approved") {
          exists.status = "approved";
          await exists.save();
          console.log(`👤 Updated direct access user status to approved: ${exists.email}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error seeding direct access users:", error);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    await seedDirectAccessUsers();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log("⚠️  Continuing server execution. Please ensure MongoDB is running.");
  }
};

export default connectDB;
