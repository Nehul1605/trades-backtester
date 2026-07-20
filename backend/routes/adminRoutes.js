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

export default router;
