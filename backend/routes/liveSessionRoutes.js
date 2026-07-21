import express from "express";
import { AccessToken } from "livekit-server-sdk";
import LiveSession from "../models/LiveSession.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Helper: Check if user is Host, CoHost, or Admin
const isHostOrCoHostUser = async (session, userId) => {
  if (!session || !userId) return false;
  const uIdStr = userId.toString();

  // Check if Host
  if (session.host && session.host.toString() === uIdStr) {
    return true;
  }

  // Check if CoHost
  if (session.coHosts && session.coHosts.some((ch) => ch.toString() === uIdStr)) {
    return true;
  }

  // Check if Admin
  const user = await User.findById(userId);
  if (user && user.role === "admin") {
    return true;
  }

  return false;
};

// @route   GET /api/live-sessions
// @desc    Get all active, scheduled, and past live market sessions
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { includeEnded } = req.query;
    const filter = includeEnded === "true" ? {} : { status: { $in: ["scheduled", "live"] } };

    const sessions = await LiveSession.find(filter)
      .populate("host", "name email role")
      .populate("coHosts", "name email role")
      .sort({ status: -1, createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching live sessions:", error);
    res.status(500).json({ error: "Failed to fetch live sessions" });
  }
});


// @route   GET /api/live-sessions/users/search
// @desc    Search users by query for co-host assignment
// @access  Private
router.get("/users/search", protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      const users = await User.find({ status: "approved" })
        .select("name email role")
        .limit(10);
      return res.json(users);
    }

    const regex = new RegExp(q.trim(), "i");
    const users = await User.find({
      status: "approved",
      $or: [{ name: regex }, { email: regex }],
    })
      .select("name email role")
      .limit(15);

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// @route   POST /api/live-sessions
// @desc    Create a new live market session
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, category, scheduledAt } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required for the stream" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roomName = `room-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const session = new LiveSession({
      title: title.trim(),
      description: description ? description.trim() : "",
      category: category || "General Market Analysis",
      host: req.userId,
      coHosts: [],
      status: "scheduled",
      roomName,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    });

    await session.save();
    const populated = await LiveSession.findById(session._id)
      .populate("host", "name email role")
      .populate("coHosts", "name email role");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating live session:", error);
    res.status(500).json({ error: "Failed to create live session" });
  }
});

// @route   GET /api/live-sessions/:id
// @desc    Get single session details
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id)
      .populate("host", "name email role")
      .populate("coHosts", "name email role");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session details" });
  }
});

// @route   POST /api/live-sessions/:id/token
// @desc    Generate LiveKit Access Token with role-based permissions
// @access  Private
router.post("/:id/token", protect, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Live session not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isHostOrCoHost = await isHostOrCoHostUser(session, req.userId);

    const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
    const apiSecret =
      process.env.LIVEKIT_API_SECRET ||
      "secretsecretsecretsecretsecretsecretsecretsecret";

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user._id.toString(),
      name: user.name || user.email,
    });

    // Grant permissions based on role
    at.addGrant({
      room: session.roomName,
      roomJoin: true,
      canPublish: isHostOrCoHost, // Only Host or CoHost can publish mic/camera/screenshare!
      canPublishData: true, // Everyone can send chat messages
      canSubscribe: true, // Everyone can view stream
      roomAdmin: isHostOrCoHost,
    });

    const jwtToken = await at.toJwt();

    res.json({
      token: jwtToken,
      isHostOrCoHost,
      isHost: session.host.toString() === user._id.toString(),
      sessionStatus: session.status,
      roomName: session.roomName,
      livekitUrl: process.env.LIVEKIT_URL || "wss://demo.livekit.cloud",
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    res.status(500).json({ error: "Failed to generate stream token" });
  }
});

// @route   POST /api/live-sessions/:id/start
// @desc    Start session (Host or Co-Host only)
// @access  Private
router.post("/:id/start", protect, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const authorized = await isHostOrCoHostUser(session, req.userId);
    if (!authorized) {
      return res.status(403).json({
        error: "Forbidden: Only Host or Co-Host can start the live meeting",
      });
    }

    session.status = "live";
    session.startedAt = new Date();
    await session.save();

    const updated = await LiveSession.findById(session._id)
      .populate("host", "name email role")
      .populate("coHosts", "name email role");

    res.json(updated);
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({ error: "Failed to start live stream" });
  }
});

// @route   POST /api/live-sessions/:id/end
// @desc    End session (Host or Co-Host only)
// @access  Private
router.post("/:id/end", protect, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const authorized = await isHostOrCoHostUser(session, req.userId);
    if (!authorized) {
      return res.status(403).json({
        error: "Forbidden: Only Host or Co-Host can end the live meeting",
      });
    }

    session.status = "ended";
    session.endedAt = new Date();
    await session.save();

    const updated = await LiveSession.findById(session._id)
      .populate("host", "name email role")
      .populate("coHosts", "name email role");

    res.json(updated);
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Failed to end live stream" });
  }
});

// @route   POST /api/live-sessions/:id/cohosts
// @desc    Assign or remove Co-Host (Host or Admin only)
// @access  Private
router.post("/:id/cohosts", protect, async (req, res) => {
  try {
    const { coHostId, action } = req.body; // action: 'add' or 'remove'
    if (!coHostId || !["add", "remove"].includes(action)) {
      return res
        .status(400)
        .json({ error: "coHostId and valid action ('add'|'remove') required" });
    }

    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const requestingUser = await User.findById(req.userId);
    const isHost = session.host.toString() === req.userId.toString();
    const isAdmin = requestingUser && requestingUser.role === "admin";

    if (!isHost && !isAdmin) {
      return res.status(403).json({
        error: "Forbidden: Only the Room Host or Admin can assign/remove Co-Hosts",
      });
    }

    const coHostUser = await User.findById(coHostId);
    if (!coHostUser) {
      return res.status(404).json({ error: "Target co-host user not found" });
    }

    if (action === "add") {
      if (!session.coHosts.includes(coHostId)) {
        session.coHosts.push(coHostId);
      }
    } else if (action === "remove") {
      session.coHosts = session.coHosts.filter(
        (id) => id.toString() !== coHostId.toString()
      );
    }

    await session.save();

    const updated = await LiveSession.findById(session._id)
      .populate("host", "name email role")
      .populate("coHosts", "name email role");

    res.json(updated);
  } catch (error) {
    console.error("Error updating cohosts:", error);
    res.status(500).json({ error: "Failed to update co-host privileges" });
  }
});

export default router;
