import { db } from "../database/db.js";
import { bookings, eventTypes, users } from "../database/schema.js";
import { eq, and, ne } from "drizzle-orm";
import { sendCancellationEmails, sendRescheduleEmails } from "../lib/emails.js";

function timeToMinutes(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minutesToTime(mins) { const h = String(Math.floor(mins / 60)).padStart(2, "0"); const m = String(mins % 60).padStart(2, "0"); return `${h}:${m}`; }

// GET /api/bookings?filter=upcoming or past
export const getBookings = async (req, res) => {
  try {
    const { filter } = req.query; // "upcoming" or "past"
    const today = new Date().toISOString().split("T")[0]; // "2026-03-12"

    // Get all event type ids belonging to this user
    const userEventTypes = await db
      .select()
      .from(eventTypes)
      .where(eq(eventTypes.userId, req.user.id));

    const eventTypeIds = userEventTypes.map((e) => e.id);

    if (eventTypeIds.length === 0) {
      return res.json([]);
    }

    // Get all bookings for those event types
    let allBookings = await db
      .select({
        id:           bookings.id,
        bookerName:   bookings.bookerName,
        bookerEmail:  bookings.bookerEmail,
        date:         bookings.date,
        startTime:    bookings.startTime,
        endTime:      bookings.endTime,
        status:       bookings.status,
        note:          bookings.note,
        meetLink:      bookings.meetLink,
        answers:       bookings.answers,
        createdAt:     bookings.createdAt,
        eventTypeId:   bookings.eventTypeId,
        eventTitle:    eventTypes.title,
        eventDuration: eventTypes.duration,
        eventSlug:     eventTypes.slug,
      })
      .from(bookings)
      .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
      .where(eq(eventTypes.userId, req.user.id));

    const [hostUser] = await db.select().from(users).where(eq(users.id, req.user.id));
    const hostTz = hostUser?.timezone || "UTC";

    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: hostTz });
    const timeStr = now.toLocaleTimeString("en-GB", { timeZone: hostTz, hour: '2-digit', minute: '2-digit' });
    const currentMins = timeToMinutes(timeStr);

    if (filter === "upcoming") {
      allBookings = allBookings.filter(b => 
        b.status === "upcoming" && 
        (b.date > todayStr || (b.date === todayStr && timeToMinutes(b.endTime) > currentMins))
      );
    } else if (filter === "past") {
      allBookings = allBookings.filter(b => 
        (b.status === "completed" || 
         b.date < todayStr || 
         (b.date === todayStr && timeToMinutes(b.endTime) <= currentMins)) 
         && b.status !== "cancelled"
      );
    } else if (filter === "cancelled") {
      allBookings = allBookings.filter(b => b.status === "cancelled");
    }

    allBookings.sort((a, b) => a.date.localeCompare(b.date));
    res.json(allBookings.map(b => ({ ...b, answers: b.answers ? JSON.parse(b.answers) : null })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db
      .select({ booking: bookings, eventType: eventTypes, user: users })
      .from(bookings)
      .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
      .innerJoin(users, eq(eventTypes.userId, users.id))
      .where(and(eq(bookings.id, parseInt(id)), eq(eventTypes.userId, req.user.id)));

    if (!result) return res.status(404).json({ message: "Booking not found" });

    const [updated] = await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    sendCancellationEmails({
      bookerName:  result.booking.bookerName,
      bookerEmail: result.booking.bookerEmail,
      hostName:    result.user.name,
      hostEmail:   result.user.email,
      eventTitle:  result.eventType.title,
      date:        result.booking.date,
      startTime:   result.booking.startTime,
      endTime:     result.booking.endTime,
    }).catch(err => console.error("[email] cancellation:", err));

    res.json({ message: "Booking cancelled", booking: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// PATCH /api/bookings/:id/reschedule
export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime } = req.body;

    if (!date || !startTime) {
      return res.status(400).json({ message: "date and startTime are required" });
    }

    const [result] = await db
      .select({ booking: bookings, eventType: eventTypes, user: users })
      .from(bookings)
      .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
      .innerJoin(users, eq(eventTypes.userId, users.id))
      .where(and(eq(bookings.id, parseInt(id)), eq(eventTypes.userId, req.user.id)));

    if (!result) return res.status(404).json({ message: "Booking not found" });
    if (result.booking.status !== "upcoming") {
      return res.status(400).json({ message: "Only upcoming bookings can be rescheduled" });
    }

    const newEndTime = minutesToTime(timeToMinutes(startTime) + result.eventType.duration);

    // Check double booking across all user's event types
    const existingBookings = await db
      .select({ id: bookings.id, startTime: bookings.startTime, endTime: bookings.endTime })
      .from(bookings)
      .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
      .where(
        and(
          eq(eventTypes.userId, req.user.id),
          eq(bookings.date, date),
          eq(bookings.status, "upcoming"),
          ne(bookings.id, parseInt(id))
        )
      );

    const newStartMins = timeToMinutes(startTime);
    const newEndMins = newStartMins + result.eventType.duration;

    const hasConflict = existingBookings.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return Math.max(newStartMins, bStart) < Math.min(newEndMins, bEnd);
    });

    if (hasConflict) return res.status(409).json({ message: "This slot is already booked" });

    const [updated] = await db
      .update(bookings)
      .set({ date, startTime, endTime: newEndTime })
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    sendRescheduleEmails({
      bookerName:   result.booking.bookerName,
      bookerEmail:  result.booking.bookerEmail,
      hostName:     result.user.name,
      hostEmail:    result.user.email,
      eventTitle:   result.eventType.title,
      oldDate:      result.booking.date,
      oldStartTime: result.booking.startTime,
      newDate:      date,
      newStartTime: startTime,
      newEndTime,
      meetLink:     updated.meetLink || null,
    }).catch(err => console.error("[email] reschedule:", err));

    res.json({ booking: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
