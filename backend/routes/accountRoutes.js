import express from "express";
import BrokerAccount from "../models/BrokerAccount.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// @desc    Get user's broker accounts
// @route   GET /api/accounts
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const accounts = await BrokerAccount.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(accounts);
  } catch (error) {
    console.error("Fetch accounts error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Get a single broker account
// @route   GET /api/accounts/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const account = await BrokerAccount.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    console.error("Get account error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Create a broker account
// @route   POST /api/accounts
// @access  Private
router.post("/", protect, async (req, res) => {
  const { brokerType, accountId, server, password, balance, equity, currency } =
    req.body;

  try {
    const account = await BrokerAccount.create({
      userId: req.userId,
      brokerType,
      accountId,
      server,
      password,
      balance: balance || 0,
      equity: equity || 0,
      currency: currency || "USD",
    });

    res.status(201).json(account);
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Delete a broker account
// @route   DELETE /api/accounts/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const account = await BrokerAccount.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    await account.deleteOne();
    res.json({ message: "Account removed successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Update a broker account (balance/equity)
// @route   PUT /api/accounts/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const account = await BrokerAccount.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const { balance, equity, status } = req.body;

    if (balance !== undefined) account.balance = balance;
    if (equity !== undefined) account.equity = equity;
    if (status !== undefined) account.status = status;
    account.lastSync = Date.now();

    await account.save();
    res.json(account);
  } catch (error) {
    console.error("Update account error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Top up a broker account by $500
// @route   POST /api/accounts/:id/topup
// @access  Private
router.post("/:id/topup", protect, async (req, res) => {
  try {
    const account = await BrokerAccount.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    account.balance = (account.balance || 0) + 500;
    account.equity = (account.equity || 0) + 500;
    account.lastSync = Date.now();

    await account.save();
    res.json(account);
  } catch (error) {
    console.error("Top up account error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
