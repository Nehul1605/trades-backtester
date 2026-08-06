import express from "express";
import VerificationRequest from "../models/VerificationRequest.js";
import User from "../models/User.js";
import { sendEmail } from "../config/email.js";
import Trade from "../models/Trade.js";
import BrokerAccount from "../models/BrokerAccount.js";
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

// @desc    Search site users (defaults to approved users only)
// @route   GET /api/admin/users/search
// @access  Admin/Owner
router.get("/users/search", protect, protectAdmin, async (req, res) => {
  try {
    const { q, status = "approved" } = req.query;

    let query = {};
    if (status !== "all") {
      query.status = status;
    }

    if (q && q.trim().length > 0) {
      const regex = new RegExp(q.trim(), "i");
      const searchConditions = [{ name: regex }, { email: regex }];
      if (status !== "all") {
        query.$and = [{ status }, { $or: searchConditions }];
      } else {
        query.$or = searchConditions;
      }
    }

    const users = await User.find(query)
      .select("name email role status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Attach verification request info (broker, trading account, telegram) for complete normal user data
    const userIds = users.map((u) => u._id);
    const verifications = await VerificationRequest.find({
      user: { $in: userIds },
    }).lean();

    const verificationMap = new Map();
    verifications.forEach((v) => {
      verificationMap.set(v.user.toString(), v);
    });

    const result = users.map((u) => ({
      ...u,
      verification: verificationMap.get(u._id.toString()) || null,
    }));

    res.json(result);
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
    const request = await VerificationRequest.findById(req.id || req.params.id).populate("user", "name email status");
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "approved";
    await request.save();

    // Update associated user status
    const targetUser = await User.findByIdAndUpdate(request.user._id || request.user, { status: "approved" }, { new: true });

    // Send email to user
    if (targetUser && targetUser.email) {
      try {
        await sendEmail({
          to: targetUser.email,
          subject: "Your Account Verification Request has been Approved!",
          text: `Hi ${targetUser.name || "there"},\n\nWe are pleased to inform you that your broker account verification request has been approved! You now have full access to your trading features.\n\nAccess Dashboard: ${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard\n\nThank you,\nThe TradeTracker Pro Team`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b; line-height: 1.6;">
              <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                <!-- Header Banner -->
                <div style="background-color: #09090b; padding: 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                  <img src="https://www.tradetrackerpro.in/logo.png" alt="TradeTracker Pro Logo" style="height: 35px; vertical-align: middle; margin-right: 8px; display: inline-block;" />
                  <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; vertical-align: middle; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">TRADETRACKER PRO</span>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 30px;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background-color: #ecfdf5; border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                      <span style="font-size: 32px;">🎉</span>
                    </div>
                    <h2 style="color: #10b981; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Verification Approved!</h2>
                  </div>
                  
                  <p style="font-size: 15px; margin-top: 0;">Hi <strong>${targetUser.name || "Trader"}</strong>,</p>
                  <p style="font-size: 14.5px; color: #475569;">We are pleased to inform you that your broker account verification request has been successfully reviewed and <strong>Approved</strong>! Your referral status is active.</p>
                  
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9;">
                    <h3 style="color: #c5a880; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 12px;">What you can do now:</h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #334155; line-height: 1.8;">
                      <li>📊 Sync and view custom MT4/MT5 accounts.</li>
                      <li>📈 Maintain a clean trading ledger with detailed entry/exit logs.</li>
                      <li>🧠 Gain deep performance analytics and strategy win-rates.</li>
                      <li>📁 Export high-quality PDF performance statements with watermarks.</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard" style="background-color: #c5a880; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(197, 168, 128, 0.4), 0 2px 4px -1px rgba(197, 168, 128, 0.2);">Access Dashboard</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 11px; color: #64748b; margin: 0;">This is an automated notification from TradeTracker Pro. Please do not reply directly to this email.</p>
                  <p style="font-size: 11px; color: #64748b; margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} TradeTracker Pro. All rights reserved.</p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("Failed to send approval mail:", mailErr);
      }
    }

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
    const request = await VerificationRequest.findById(req.id || req.params.id).populate("user", "name email status");
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "rejected";
    request.remarks = remarks || "Could not verify referral status.";
    await request.save();

    // Update associated user status
    const targetUser = await User.findByIdAndUpdate(request.user._id || request.user, { status: "rejected" }, { new: true });

    // Send email to user
    if (targetUser && targetUser.email) {
      try {
        await sendEmail({
          to: targetUser.email,
          subject: "Update on Your Account Verification Request",
          text: `Hi ${targetUser.name || "there"},\n\nYour broker account verification request was rejected.\n\nReason: ${remarks || "Could not verify referral status."}\n\nPlease log in and fill out the verification request form again.\n\nFill Form Again: ${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/verification-pending\n\nThank you,\nThe TradeTracker Pro Team`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b; line-height: 1.6;">
              <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                <!-- Header Banner -->
                <div style="background-color: #09090b; padding: 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                  <img src="https://www.tradetrackerpro.in/logo.png" alt="TradeTracker Pro Logo" style="height: 35px; vertical-align: middle; margin-right: 8px; display: inline-block;" />
                  <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; vertical-align: middle; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">TRADETRACKER PRO</span>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 30px;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background-color: #fef2f2; border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                      <span style="font-size: 32px;">⚠️</span>
                    </div>
                    <h2 style="color: #ef4444; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Verification Update</h2>
                  </div>
                  
                  <p style="font-size: 15px; margin-top: 0;">Hi <strong>${targetUser.name || "Trader"}</strong>,</p>
                  <p style="font-size: 14.5px; color: #475569;">Your broker account verification request has been reviewed and was <strong>Rejected</strong> due to the following reason:</p>
                  
                  <div style="background-color: #fff1f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 6px;">
                    <strong style="color: #9f1239; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Rejection:</strong>
                    <p style="color: #b91c1c; font-size: 14.5px; margin: 6px 0 0 0; font-weight: 600;">${remarks || "Could not verify referral status."}</p>
                  </div>
                  
                  <p style="font-size: 14px; color: #475569;">No worries! This is usually due to a typo or incorrect ID. Please check your credentials and fill out the verification request form again.</p>
                  
                  <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/verification-pending" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4), 0 2px 4px -1px rgba(239, 68, 68, 0.2);">Fill Form Again</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 11px; color: #64748b; margin: 0;">This is an automated notification from TradeTracker Pro. Please do not reply directly to this email.</p>
                  <p style="font-size: 11px; color: #64748b; margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} TradeTracker Pro. All rights reserved.</p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("Failed to send rejection mail:", mailErr);
      }
    }

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
    const validRoles = ["user", "broadcaster", "admin", "member"];

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

// @desc    Get all registered users with filters, sorting, and pagination
// @route   GET /api/admin/users
// @access  Admin/Owner
router.get("/users", protect, protectAdmin, async (req, res) => {
  try {
    const {
      search,
      status,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Search query (matches name or email)
    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    // Status filter (defaults to approved for site users who have site access)
    const effectiveStatus = status || "approved";
    if (effectiveStatus !== "all") {
      query.status = effectiveStatus;
    }

    // Role filter
    if (role && role !== "all") {
      query.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting field configuration
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password_hash")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      totalUsers,
    });
  } catch (error) {
    console.error("Get all users admin error:", error);
    res.status(500).json({ error: "Failed to fetch users list" });
  }
});

// @desc    Directly update a user's verification/site status
// @route   PATCH /api/admin/users/:id/status
// @access  Admin/Owner
router.patch("/users/:id/status", protect, protectAdmin, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ["pending", "approved", "rejected"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (status === "rejected" && (!reason || !reason.trim())) {
      return res.status(400).json({ error: "Rejection reason is required." });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    targetUser.status = status;
    if (status === "rejected") {
      targetUser.statusRemarks = reason;
    } else {
      targetUser.statusRemarks = "";
    }
    await targetUser.save();

    // Send email to user
    if (targetUser.email) {
      try {
        if (status === "approved") {
          await sendEmail({
            to: targetUser.email,
            subject: "Your Account Verification Status: APPROVED!",
            text: `Hi ${targetUser.name || "there"},\n\nYour account verification status has been updated to approved. You now have full access.\n\nAccess Dashboard: ${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard\n\nThank you,\nThe TradeTracker Pro Team`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b; line-height: 1.6;">
                <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                  <!-- Header Banner -->
                  <div style="background-color: #09090b; padding: 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                    <img src="https://www.tradetrackerpro.in/logo.png" alt="TradeTracker Pro Logo" style="height: 35px; vertical-align: middle; margin-right: 8px; display: inline-block;" />
                    <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; vertical-align: middle; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">TRADETRACKER PRO</span>
                  </div>
                  
                  <!-- Body Content -->
                  <div style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; background-color: #ecfdf5; border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                        <span style="font-size: 32px;">🎉</span>
                      </div>
                      <h2 style="color: #10b981; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Account Approved!</h2>
                    </div>
                    
                    <p style="font-size: 15px; margin-top: 0;">Hi <strong>${targetUser.name || "Trader"}</strong>,</p>
                    <p style="font-size: 14.5px; color: #475569;">We are pleased to inform you that your account verification status has been reviewed and <strong>Approved</strong>! You now have full access to all trading journal and calculation features.</p>
                    
                    <div style="text-align: center; margin: 30px 0 10px 0;">
                      <a href="${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/dashboard" style="background-color: #c5a880; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(197, 168, 128, 0.4), 0 2px 4px -1px rgba(197, 168, 128, 0.2);">Go to Dashboard</a>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #64748b; margin: 0;">This is an automated notification from TradeTracker Pro. Please do not reply directly to this email.</p>
                    <p style="font-size: 11px; color: #64748b; margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} TradeTracker Pro. All rights reserved.</p>
                  </div>
                </div>
              </div>
            `,
          });
        } else if (status === "rejected") {
          await sendEmail({
            to: targetUser.email,
            subject: "Your Account Verification Status: REJECTED",
            text: `Hi ${targetUser.name || "there"},\n\nYour account verification request was rejected.\n\nReason: ${reason}\n\nPlease log in and fill out the verification request form again.\n\nFill Form Again: ${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/verification-pending\n\nThank you,\nThe TradeTracker Pro Team`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b; line-height: 1.6;">
                <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                  <!-- Header Banner -->
                  <div style="background-color: #09090b; padding: 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                    <img src="https://www.tradetrackerpro.in/logo.png" alt="TradeTracker Pro Logo" style="height: 35px; vertical-align: middle; margin-right: 8px; display: inline-block;" />
                    <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; vertical-align: middle; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">TRADETRACKER PRO</span>
                  </div>
                  
                  <!-- Body Content -->
                  <div style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; background-color: #fef2f2; border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                        <span style="font-size: 32px;">⚠️</span>
                      </div>
                      <h2 style="color: #ef4444; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Verification Rejected</h2>
                    </div>
                    
                    <p style="font-size: 15px; margin-top: 0;">Hi <strong>${targetUser.name || "Trader"}</strong>,</p>
                    <p style="font-size: 14.5px; color: #475569;">Your account verification request was reviewed and has been <strong>Rejected</strong>.</p>
                    
                    <div style="background-color: #fff1f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 6px;">
                      <strong style="color: #9f1239; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Rejection:</strong>
                      <p style="color: #b91c1c; font-size: 14.5px; margin: 6px 0 0 0; font-weight: 600;">${reason}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #475569;">Please log in and submit the verification request form again with valid details.</p>
                    
                    <div style="text-align: center; margin: 30px 0 10px 0;">
                      <a href="${process.env.FRONTEND_URL || "https://www.tradetrackerpro.in"}/verification-pending" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4), 0 2px 4px -1px rgba(239, 68, 68, 0.2);">Fill Form Again</a>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #64748b; margin: 0;">This is an automated notification from TradeTracker Pro. Please do not reply directly to this email.</p>
                    <p style="font-size: 11px; color: #64748b; margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} TradeTracker Pro. All rights reserved.</p>
                  </div>
                </div>
              </div>
            `,
          });
        }
      } catch (mailErr) {
        console.error("Failed to send status update email:", mailErr);
      }
    }

    res.json({
      message: `User ${targetUser.email} status updated to "${status}"`,
      user: {
        _id: targetUser._id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        status: targetUser.status,
        statusRemarks: targetUser.statusRemarks,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// @desc    Get user trades for admin inspection
// @route   GET /api/admin/users/:id/trades
// @access  Admin/Owner
router.get("/users/:id/trades", protect, protectAdmin, async (req, res) => {
  try {
    const { symbol, brokerAccountId, status } = req.query;
    const filter = { userId: req.params.id };

    if (symbol && symbol !== "ALL") {
      filter.symbol = symbol;
    }

    if (brokerAccountId && brokerAccountId !== "ALL") {
      if (brokerAccountId === "none" || brokerAccountId === "null") {
        filter.brokerAccountId = null;
      } else {
        filter.brokerAccountId = brokerAccountId;
      }
    }

    if (status) {
      filter.status = status;
    }

    const trades = await Trade.find(filter)
      .sort({ entryDate: -1, createdAt: -1 });

    const mappedTrades = trades.map((t) => {
      const obj = t.toObject();
      obj.$id = obj._id.toString();
      obj.id = obj._id.toString();
      if (obj.brokerAccountId) {
        obj.broker_account_id = obj.brokerAccountId.toString();
      }
      return obj;
    });

    res.json(mappedTrades);
  } catch (error) {
    console.error("Get user trades admin error:", error);
    res.status(500).json({ error: "Failed to fetch user trades" });
  }
});

// @desc    Get user broker accounts for admin inspection
// @route   GET /api/admin/users/:id/accounts
// @access  Admin/Owner
router.get("/users/:id/accounts", protect, protectAdmin, async (req, res) => {
  try {
    const accounts = await BrokerAccount.find({ userId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    console.error("Get user accounts admin error:", error);
    res.status(500).json({ error: "Failed to fetch user accounts" });
  }
});

export default router;
