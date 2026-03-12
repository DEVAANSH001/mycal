import express from "express";
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from "../controllers/eventTypes.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getEventTypes);
router.post("/", createEventType);
router.put("/:id", updateEventType);
router.delete("/:id", deleteEventType);

export default router;