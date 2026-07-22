import express from "express";
import VerificationRequest from "../models/VerificationRequest.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Admin protection middleware
const protectAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Owner only." });
    }
  } catch (error) {
    console.error("protectAdmin error:", error);
    res.status(500).json({ error: "Server authentication error" });
  }
};

// @desc    List all verification requests
// @route   GET /api/admin/verifications
// @access  Admin/Owner
router.get("/verifications", protect, protectAdmin, async (req, res) => {
  try {
    const requests = await VerificationRequest.find()
      .populate("user", "name email status role")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Get verifications error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Search all users for role management
// @route   GET /api/admin/users/search
// @access  Admin/Owner
router.get("/users/search", protect, protectAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      const users = await User.find()
        .select("name email role status")
        .limit(20);
      return res.json(users);
    }

    const regex = new RegExp(q.trim(), "i");
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
    })
      .select("name email role status")
      .limit(30);

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// @desc    Approve verification request
// @route   POST /api/admin/verifications/:id/approve
// @access  Admin/Owner
router.post("/verifications/:id/approve", protect, protectAdmin, async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.id || req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "approved";
    await request.save();

    // Update associated user status
    await User.findByIdAndUpdate(request.user, { status: "approved" });

    res.json({ message: "Request approved successfully", request });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Reject verification request
// @route   POST /api/admin/verifications/:id/reject
// @access  Admin/Owner
router.post("/verifications/:id/reject", protect, protectAdmin, async (req, res) => {
  const { remarks } = req.body;

  try {
    const request = await VerificationRequest.findById(req.id || req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "rejected";
    request.remarks = remarks || "Could not verify referral status.";
    await request.save();

    // Update associated user status
    await User.findByIdAndUpdate(request.user, { status: "rejected" });

    res.json({ message: "Request rejected successfully", request });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Update user role (e.g. set as broadcaster)
// @route   PATCH /api/admin/users/:id/role
// @access  Admin/Owner
router.patch("/users/:id/role", protect, protectAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["user", "broadcaster", "admin"];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      message: `User ${targetUser.email} role updated to "${role}"`,
      user: { _id: targetUser._id, email: targetUser.email, name: targetUser.name, role: targetUser.role },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

export default router;
