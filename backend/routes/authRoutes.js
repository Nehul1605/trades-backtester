import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Setup storage for profile avatars
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `avatar_${req.userId}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Images only! (png, jpg, jpeg, gif, webp)"));
    }
  },
});

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
    const isDirectAccessEmail = (e) => ["amit@gmail.com", "naman@gmail..com", "naman@gmail.com"].includes(e?.toLowerCase());
    const isVerificationRequired = process.env.REQUIRE_REFERRAL_VERIFICATION !== "false";
    const initialStatus = (isAdminEmail(email) || isDirectAccessEmail(email) || !isVerificationRequired) ? "approved" : "pending";
    const initialRole = isAdminEmail(email) ? "admin" : (isDirectAccessEmail(email) ? "member" : "user");

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
        image: user.image || "",
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
    const isDirectAccessEmail = (e) => ["amit@gmail.com", "naman@gmail..com", "naman@gmail.com"].includes(e?.toLowerCase());
    if (isAdminEmail(user.email) && (user.role !== "admin" || user.status !== "approved")) {
      user.role = "admin";
      user.status = "approved";
      await user.save();
    } else if (isDirectAccessEmail(user.email) && user.status !== "approved") {
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
        image: user.image || "",
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
    const isDirectAccessEmail = (e) => ["amit@gmail.com", "naman@gmail..com", "naman@gmail.com"].includes(e?.toLowerCase());
    const isVerificationRequired = process.env.REQUIRE_REFERRAL_VERIFICATION !== "false";
    const initialStatus = (isAdminEmail(email) || isDirectAccessEmail(email) || !isVerificationRequired) ? "approved" : "pending";
    const initialRole = isAdminEmail(email) ? "admin" : (isDirectAccessEmail(email) ? "member" : "user");

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
    } else if (isDirectAccessEmail(email) && user.status !== "approved") {
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
      image: user.image || "",
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  const { name, image } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (image !== undefined) user.image = image;

    await user.save();

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role,
      image: user.image || "",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
router.post("/upload-avatar", protect, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

export default router;
