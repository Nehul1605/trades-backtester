import express from "express";
import Trade from "../models/Trade.js";
import BrokerAccount from "../models/BrokerAccount.js";
import protect from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// File upload setup using Multer
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
      `${req.userId}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// @desc    Get all trades for the logged in user
// @route   GET /api/trades
// @access  Private
router.get("/", protect, async (req, res) => {
  const { symbol, brokerAccountId, status } = req.query;
  const filter = { userId: req.userId };

  if (symbol && symbol !== "ALL") {
    filter.symbol = symbol;
  }

  if (brokerAccountId && brokerAccountId !== "ALL") {
    // Handle 'null' string passed from select filter
    if (brokerAccountId === "none" || brokerAccountId === "null") {
      filter.brokerAccountId = null;
    } else {
      filter.brokerAccountId = brokerAccountId;
    }
  }

  if (status) {
    filter.status = status;
  }

  try {
    const trades = await Trade.find(filter).sort({ entryDate: -1, createdAt: -1 });
    
    // Map _id to $id to make frontend migration seamless (frontend expects doc.$id or doc.id)
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
    console.error("Fetch trades error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Create a trade
// @route   POST /api/trades
// @access  Private
router.post("/", protect, async (req, res) => {
  const {
    symbol,
    entryPrice,
    exitPrice,
    entryPriceText,
    exitPriceText,
    quantity,
    tradeType,
    entryDate,
    exitDate,
    status,
    strategyName,
    notes,
    screenshotUrl,
    pnl,
    pnlPercentage,
    stopLoss,
    takeProfit,
    brokerAccountId,
  } = req.body;

  try {
    const trade = await Trade.create({
      userId: req.userId,
      symbol,
      entryPrice,
      exitPrice: exitPrice ?? null,
      entryPriceText: entryPriceText ?? "",
      exitPriceText: exitPriceText ?? "",
      quantity,
      tradeType,
      entryDate,
      exitDate: exitDate ?? null,
      status: status || "open",
      strategyName: strategyName ?? "",
      notes: notes ?? "",
      screenshotUrl: screenshotUrl ?? null,
      pnl: pnl ?? null,
      pnlPercentage: pnlPercentage ?? null,
      stopLoss: stopLoss ?? null,
      takeProfit: takeProfit ?? null,
      brokerAccountId: brokerAccountId || null,
    });

    // If a broker account is linked and trade has P&L, update the account balance
    if (brokerAccountId && pnl) {
      const account = await BrokerAccount.findById(brokerAccountId);
      if (account) {
        account.balance = (account.balance || 0) + Number(pnl);
        account.equity = (account.equity || 0) + Number(pnl);
        await account.save();
      }
    }

    res.status(201).json(trade);
  } catch (error) {
    console.error("Create trade error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Upload trade screenshot
// @route   POST /api/trades/upload
// @access  Private
router.post("/upload", protect, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }
    
    // Construct local public URL for the screenshot
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// @desc    Update a trade
// @route   PUT /api/trades/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, userId: req.userId });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    const originalPnl = trade.pnl || 0;
    const originalAccountId = trade.brokerAccountId;

    // Fields that can be updated
    const updateFields = [
      "symbol",
      "entryPrice",
      "exitPrice",
      "entryPriceText",
      "exitPriceText",
      "quantity",
      "tradeType",
      "entryDate",
      "exitDate",
      "status",
      "strategyName",
      "notes",
      "screenshotUrl",
      "pnl",
      "pnlPercentage",
      "stopLoss",
      "takeProfit",
      "brokerAccountId",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        trade[field] = req.body[field];
      }
    });

    const updatedTrade = await trade.save();

    // Adjust broker balance if P&L or account has changed
    const newPnl = updatedTrade.pnl || 0;
    const newAccountId = updatedTrade.brokerAccountId;

    if (originalAccountId && originalAccountId.toString() === newAccountId?.toString()) {
      const pnlDiff = newPnl - originalPnl;
      if (pnlDiff !== 0) {
        const account = await BrokerAccount.findById(originalAccountId);
        if (account) {
          account.balance = (account.balance || 0) + pnlDiff;
          account.equity = (account.equity || 0) + pnlDiff;
          await account.save();
        }
      }
    } else {
      // Account changed: subtract from original account, add to new account
      if (originalAccountId) {
        const origAccount = await BrokerAccount.findById(originalAccountId);
        if (origAccount) {
          origAccount.balance = (origAccount.balance || 0) - originalPnl;
          origAccount.equity = (origAccount.equity || 0) - originalPnl;
          await origAccount.save();
        }
      }
      if (newAccountId) {
        const newAccount = await BrokerAccount.findById(newAccountId);
        if (newAccount) {
          newAccount.balance = (newAccount.balance || 0) + newPnl;
          newAccount.equity = (newAccount.equity || 0) + newPnl;
          await newAccount.save();
        }
      }
    }

    res.json(updatedTrade);
  } catch (error) {
    console.error("Update trade error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Delete a trade
// @route   DELETE /api/trades/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, userId: req.userId });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Adjust broker account balance on trade deletion
    if (trade.brokerAccountId && trade.pnl) {
      const account = await BrokerAccount.findById(trade.brokerAccountId);
      if (account) {
        account.balance = (account.balance || 0) - trade.pnl;
        account.equity = (account.equity || 0) - trade.pnl;
        await account.save();
      }
    }

    await trade.deleteOne();
    res.json({ message: "Trade removed successfully" });
  } catch (error) {
    console.error("Delete trade error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
