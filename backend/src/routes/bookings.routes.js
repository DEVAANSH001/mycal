import express from "express";
import { getBookings, cancelBooking, rescheduleBooking } from "../controllers/bookings.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/",              getBookings);
router.patch("/:id/cancel",  cancelBooking);
router.patch("/:id/reschedule", rescheduleBooking);

export default router;