import express from "express";
import protect from "../middleware/auth.js";
import {
  getOperatorTrades,
  createOperatorTrade,
  updateOperatorTrade,
  deleteOperatorTrade,
} from "../controllers/operatorController.js";

const router = express.Router();

// GET /api/operator-trades (Open to all logged-in users to view signals & accuracy stats)
router.get("/", getOperatorTrades);

// Admin / Operator actions
router.post("/", protect, createOperatorTrade);
router.put("/:id", protect, updateOperatorTrade);
router.delete("/:id", protect, deleteOperatorTrade);

export default router;
