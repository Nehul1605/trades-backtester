import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Generate Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const isAdminEmail = (e) => ["nehulgoyal18@gmail.com", "nehul2004@gmail.com"].includes(e?.toLowerCase());
    const isVerificationRequired = process.env.REQUIRE_REFERRAL_VERIFICATION !== "false";
    const initialStatus = (isAdminEmail(email) || !isVerificationRequired) ? "approved" : "pending";
    const initialRole = isAdminEmail(email) ? "admin" : "user";

    const user = await User.create({
      name,
      email,
      password_hash,
      provider: "credentials",
      status: initialStatus,
      role: initialRole,
    });

    if (user) {
      res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        status: user.status,
        role: user.role,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.provider === "google" && !user.password_hash) {
      return res.status(400).json({
        error: "This account uses Google Login. Please sign in with Google.",
      });
    }

    const isAdminEmail = (e) => ["nehulgoyal18@gmail.com", "nehul2004@gmail.com"].includes(e?.toLowerCase());
    if (isAdminEmail(user.email) && (user.role !== "admin" || user.status !== "approved")) {
      user.role = "admin";
      user.status = "approved";
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        status: user.status,
        role: user.role,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    OAuth/Google Auto-Register or Log In
// @route   POST /api/auth/google
// @access  Public
router.post("/google", async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email });

    const isAdminEmail = (e) => ["nehulgoyal18@gmail.com", "nehul2004@gmail.com"].includes(e?.toLowerCase());
    const isVerificationRequired = process.env.REQUIRE_REFERRAL_VERIFICATION !== "false";
    const initialStatus = (isAdminEmail(email) || !isVerificationRequired) ? "approved" : "pending";
    const initialRole = isAdminEmail(email) ? "admin" : "user";

    if (!user) {
      user = await User.create({
        email,
        name: name || email.split("@")[0],
        password_hash: null,
        provider: "google",
        status: initialStatus,
        role: initialRole,
      });
    } else if (isAdminEmail(email) && (user.role !== "admin" || user.status !== "approved")) {
      user.role = "admin";
      user.status = "approved";
      await user.save();
    }

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      status: user.status,
      role: user.role,
    });
  } catch (error) {
    console.error("Google auth backend error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password_hash");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
