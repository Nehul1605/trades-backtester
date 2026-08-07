import express from "express";
import { getInstruments, calculatePositionSize } from "../controllers/calculatorController.js";

const router = express.Router();

router.get("/instruments", getInstruments);
router.post("/position-size", calculatePositionSize);

export default router;
