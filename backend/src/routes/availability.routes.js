import express from "express";
import {
  getAvailability,
  setAvailability,
  getDateOverrides,
  addDateOverride,
  deleteDateOverride,
  getBufferTime,
  setBufferTime,
} from "../controllers/availability.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/",                  getAvailability);
router.post("/",                 setAvailability);
router.get("/overrides",         getDateOverrides);
router.post("/overrides",        addDateOverride);
router.delete("/overrides/:id",  deleteDateOverride);
router.get("/buffer-time",       getBufferTime);
router.post("/buffer-time",      setBufferTime);

export default router;