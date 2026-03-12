import express from "express";
import {
  getPublicProfile,
  getPublicEventType,
  getAvailableSlots,
  getAvailableDays,
  createBooking,
} from "../controllers/public.controller.js";

const router = express.Router();

router.get("/:username",                      getPublicProfile);
router.get("/:username/:slug",                getPublicEventType);
router.get("/:username/:slug/available-days", getAvailableDays);
router.get("/:username/:slug/slots",          getAvailableSlots);
router.post("/:username/:slug/book",          createBooking);

export default router;
