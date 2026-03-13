import { db } from "../database/db.js";
import { users, eventTypes, availability, bookings, dateOverrides } from "../database/schema.js";
import { eq, and } from "drizzle-orm";
import { sendBookerConfirmation, sendHostNotification } from "../lib/emails.js";

const generateJitsiLink = (bookerName) => {
  const cleanName = (bookerName || 'guest').replace(/[^a-zA-Z0-9]/g, '');
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return `https://meet.jit.si/cal-clone-${cleanName}-${uniqueId}`;
};

// GET /api/public/:username
// Returns user profile + all active event types
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) return res.status(404).json({ message: "User not found" });

    const userEventTypes = await db
      .select()
      .from(eventTypes)
      .where(and(eq(eventTypes.userId, user.id), eq(eventTypes.isActive, true)));

    res.json({
      user: { name: user.name, username: user.username, timezone: user.timezone },
      eventTypes: userEventTypes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/public/:username/:slug
// Returns event type info + user info for public booking page
export const getPublicEventType = async (req, res) => {
  try {
    const { username, slug } = req.params;

    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find event type by slug + userId
    const [eventType] = await db
      .select()
      .from(eventTypes)
      .where(
        and(
          eq(eventTypes.slug, slug),
          eq(eventTypes.userId, user.id),
          eq(eventTypes.isActive, true)
        )
      );

    if (!eventType) {
      return res.status(404).json({ message: "Event type not found" });
    }

    res.json({
      user: {
        name:     user.name,
        username: user.username,
        timezone: user.timezone,
      },
      eventType,
      eventType: {
        ...eventType,
        customQuestions: eventType.customQuestions ? JSON.parse(eventType.customQuestions) : [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/public/:username/:slug/slots?date=2026-03-15&tz=America/New_York
// Returns available time slots for a specific date
export const getAvailableSlots = async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { date, tz } = req.query; // tz = visitor's timezone

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) return res.status(404).json({ message: "User not found" });
    const hostTz = user.timezone || "UTC";
    const visitorTz = tz || hostTz; // fall back to host timezone if visitor doesn't send one

    // Get event type
    const [eventType] = await db
      .select()
      .from(eventTypes)
      .where(
        and(
          eq(eventTypes.slug, slug),
          eq(eventTypes.userId, user.id)
        )
      );

    if (!eventType) return res.status(404).json({ message: "Event not found" });

    // Check date override first
    const [override] = await db
      .select()
      .from(dateOverrides)
      .where(
        and(
          eq(dateOverrides.userId, user.id),
          eq(dateOverrides.date, date)
        )
      );

    // If date is blocked return empty slots
    if (override?.isBlocked) {
      return res.json({ slots: [] });
    }

    // Get day of week (1=Mon, 7=Sun)
    const dayOfWeek = new Date(date + "T00:00:00").getDay(); // 0=Sun, 6=Sat
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // convert to 1=Mon, 7=Sun

    // Collect time windows: either from override or from all availability rows for the day
    let timeWindows = []; // [{startTime, endTime}]

    if (override && !override.isBlocked) {
      timeWindows = [{ startTime: override.startTime, endTime: override.endTime }];
    } else {
      const dayRows = await db
        .select()
        .from(availability)
        .where(
          and(
            eq(availability.userId, user.id),
            eq(availability.dayOfWeek, adjustedDay)
          )
        );

      if (!dayRows.length) {
        return res.json({ slots: [] }); // not available this day
      }

      // Sort by start time so slots are ordered correctly
      dayRows.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      timeWindows = dayRows.map(r => ({ startTime: r.startTime, endTime: r.endTime }));
    }

    // Generate all slots from all time windows (host's local times)
    const duration   = eventType.duration;
    const bufferTime = eventType.bufferTime || 0;
    const allHostSlots = timeWindows.flatMap(w => generateSlots(w.startTime, w.endTime, duration, bufferTime));

    // Get existing bookings for this date
    const existingBookings = await db
      .select({ startTime: bookings.startTime, endTime: bookings.endTime })
      .from(bookings)
      .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
      .where(
        and(
          eq(eventTypes.userId, user.id),
          eq(bookings.date, date),
          eq(bookings.status, "upcoming")
        )
      );

    // Get "now" in BOTH visitor's and host's timezone to prune past slots
    const now = new Date();
    // The date the visitor considers today
    const todayInVisitorTz = now.toLocaleDateString("en-CA", { timeZone: visitorTz });
    // Current time in host timezone (slots are in host's local time)
    const nowInHostTz = now.toLocaleTimeString("en-GB", {
      timeZone: hostTz,
      hour: "2-digit",
      minute: "2-digit",
    });
    const currentHostMins = timeToMinutes(nowInHostTz);

    // The date in host's timezone (to check if we're slicing today's past slots)
    const todayInHostTz = now.toLocaleDateString("en-CA", { timeZone: hostTz });

    const validSlots = allHostSlots.filter((slotTime) => {
      // If the selected date is before today in the VISITOR's timezone, skip all slots
      if (date < todayInVisitorTz) return false;
      // If it's today in host's timezone, prune host-side past times
      if (date === todayInHostTz && timeToMinutes(slotTime) <= currentHostMins) return false;
      return true;
    });

    // Map slots with availability status
    const durationMins = eventType.duration;
    const slotsWithAvailability = validSlots.map((slotTime) => {
      const slotStart = timeToMinutes(slotTime);
      const slotEnd = slotStart + durationMins;

      // Now convert this host-timezone slot time into the visitor's local time for display
      // We build a full datetime in the host's timezone, then read it in the visitor's timezone
      const [slotH, slotM] = slotTime.split(":").map(Number);
      const slotDate = new Date(`${date}T${slotTime}:00`);

      // Use Intl to format the slot time as seen from the visitor's timezone
      const visitorTime = slotDate.toLocaleTimeString("en-GB", {
        timeZone: hostTz, // slots are in host time; we just want consistent HH:MM
        hour: "2-digit",
        minute: "2-digit",
      });

      // Check if this slot overlaps with any existing booking
      const hasConflict = existingBookings.some((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd);
      });

      return { time: slotTime, available: !hasConflict };
    });

    res.json({ slots: slotsWithAvailability, hostTimezone: hostTz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper — generates time slots
function generateSlots(startTime, endTime, duration, bufferTime) {
  const slots  = [];
  let current  = timeToMinutes(startTime);
  const end    = timeToMinutes(endTime);

  while (current + duration <= end) {
    slots.push(minutesToTime(current));
    current += duration + bufferTime;
  }

  return slots;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// GET /api/public/:username/:slug/available-days?month=2026-03
// Returns array of day numbers that have availability in the given month
export const getAvailableDays = async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { month } = req.query; // "2026-03"
    if (!month) return res.status(400).json({ message: "month is required" });

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return res.status(404).json({ message: "User not found" });

    const [eventType_] = await db
      .select()
      .from(eventTypes)
      .where(and(eq(eventTypes.slug, slug), eq(eventTypes.userId, user.id)));
    if (!eventType_) return res.status(404).json({ message: "Event not found" });

    // Get all availability rules (day-of-week based)
    const availabilityRules = await db
      .select()
      .from(availability)
      .where(eq(availability.userId, user.id));
    const availableDaysOfWeek = new Set(availabilityRules.map(r => r.dayOfWeek)); // 1=Mon, 7=Sun

    const [year, monthNum] = month.split("-").map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    // Get date overrides for this user, filter to this month
    const allOverrides = await db.select().from(dateOverrides).where(eq(dateOverrides.userId, user.id));
    const overrideMap = {};
    allOverrides.forEach(o => { if (o.date.startsWith(month)) overrideMap[o.date] = o; });

    const availableDaysList = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const override = overrideMap[dateStr];
      if (override?.isBlocked) continue;
      if (override && !override.isBlocked) { availableDaysList.push(day); continue; }

      const jsDay = new Date(dateStr).getDay(); // 0=Sun, 6=Sat
      const adjustedDay = jsDay === 0 ? 7 : jsDay; // 1=Mon, 7=Sun
      if (availableDaysOfWeek.has(adjustedDay)) availableDaysList.push(day);
    }

    res.json({ availableDays: availableDaysList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/public/:username/:slug/book
// Creates a booking
export const createBooking = async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { bookerName, bookerEmail, date, startTime, note, answers } = req.body;

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get event type
    const [eventType] = await db
      .select()
      .from(eventTypes)
      .where(
        and(
          eq(eventTypes.slug, slug),
          eq(eventTypes.userId, user.id)
        )
      );

    if (!eventType) return res.status(404).json({ message: "Event not found" });

    const endTime = minutesToTime(
      timeToMinutes(startTime) + eventType.duration
    );

    // ── TRANSACTION STARTS HERE ──────────────────────
    const result = await db.transaction(async (tx) => {
      // Step 1 — Lock the eventType row. 
      // We MUST lock a row that ALREADY exists. If we only lock `bookings`, 
      // and there are no bookings yet, the lock does nothing and the race condition remains.
      await tx
        .select()
        .from(eventTypes)
        .where(eq(eventTypes.id, eventType.id))
        .for("update");

      // Step 2 — Check for conflicts INSIDE transaction
      const existingBookings = await tx
        .select({ startTime: bookings.startTime, endTime: bookings.endTime })
        .from(bookings)
        .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
        .where(
          and(
            eq(eventTypes.userId, user.id),
            eq(bookings.date, date),
            eq(bookings.status, "upcoming")
          )
        );

      // Step 3 — Check overlap
      const newStartMins = timeToMinutes(startTime);
      const newEndMins   = newStartMins + eventType.duration;

      const hasConflict = existingBookings.some((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd   = timeToMinutes(b.endTime);
        return Math.max(newStartMins, bStart) < Math.min(newEndMins, bEnd);
      });

      // Step 4 — Abort transaction if conflict
      if (hasConflict) {
        throw new Error("SLOT_TAKEN");
      }

      // Create Jitsi Meet link
      let meetLink = generateJitsiLink(bookerName);

      // Step 5 — Safe to insert now
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          eventTypeId:  eventType.id,
          bookerName,
          bookerEmail,
          date,
          startTime,
          endTime,
          note:     note || null,
          meetLink: meetLink || null,
          status:   "upcoming",
          answers:  answers ? JSON.stringify(answers) : null,
        })
        .returning();

      return { newBooking, meetLink };
    });
    // ── TRANSACTION ENDS — lock released ─────────────

    // Send confirmation emails to both parties (non-blocking)
    const emailPayload = {
      bookerName,
      bookerEmail,
      hostName:   user.name,
      hostEmail:  user.email,
      eventTitle: eventType.title,
      date,
      startTime,
      endTime,
      note:     note || null,
      meetLink: result.meetLink || null,
    };

    Promise.all([
      sendBookerConfirmation(emailPayload),
      sendHostNotification(emailPayload),
    ]).catch((err) => console.error("[email] Failed to send booking emails:", err));

    res.status(201).json({
      booking: result.newBooking,
      meetLink: result.meetLink,
      eventType: {
        title:    eventType.title,
        duration: eventType.duration,
      },
      host: {
        name:     user.name,
        timezone: user.timezone,
      },
    });

  } catch (err) {
    // Handle slot taken error from inside transaction
    if (err.message === "SLOT_TAKEN") {
      return res.status(409).json({
        message: "This slot was just booked. Please choose another time.",
      });
    }
    
    // Handle all other errors
    res.status(500).json({ message: err.message });
  }
};