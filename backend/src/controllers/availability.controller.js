import { db } from "../database/db.js";
import { availability, dateOverrides } from "../database/schema.js";
import { eq, and } from "drizzle-orm";

// GET /api/availability
export const getAvailability = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(availability)
      .where(eq(availability.userId, req.user.id));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/availability
// Replaces entire weekly schedule for the user
export const setAvailability = async (req, res) => {
  try {
    const { availability: slots, timezone } = req.body;

    // slots = [
    //   { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    //   { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
    // ]

    // Delete existing availability for this user
    await db
      .delete(availability)
      .where(eq(availability.userId, req.user.id));

    if (slots.length === 0) {
      return res.json({ message: "Availability cleared" });
    }

    // Insert new availability
    const inserted = await db
      .insert(availability)
      .values(
        slots.map((slot) => ({
          userId:    req.user.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime:   slot.endTime,
          timezone:  timezone || "UTC",
        }))
      )
      .returning();

    res.json(inserted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/availability/overrides
export const getDateOverrides = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(dateOverrides)
      .where(eq(dateOverrides.userId, req.user.id));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/availability/overrides
export const addDateOverride = async (req, res) => {
  try {
    const { date, isBlocked, startTime, endTime } = req.body;

    // Remove existing override for same date if any
    await db
      .delete(dateOverrides)
      .where(
        and(
          eq(dateOverrides.userId, req.user.id),
          eq(dateOverrides.date, date)
        )
      );

    const [override] = await db
      .insert(dateOverrides)
      .values({
        userId: req.user.id,
        date,
        isBlocked: isBlocked || false,
        startTime: isBlocked ? null : startTime,
        endTime:   isBlocked ? null : endTime,
      })
      .returning();

    res.status(201).json(override);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// DELETE /api/availability/overrides/:id
export const deleteDateOverride = async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .delete(dateOverrides)
      .where(
        and(
          eq(dateOverrides.id, parseInt(id)),
          eq(dateOverrides.userId, req.user.id)
        )
      );

    res.json({ message: "Override removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/availability/buffer-time
// Returns the current global buffer time for the user (based on their event types)
export const getBufferTime = async (req, res) => {
  try {
    const { eventTypes } = await import("../database/schema.js");
    const result = await db
      .select({ bufferTime: eventTypes.bufferTime })
      .from(eventTypes)
      .where(eq(eventTypes.userId, req.user.id))
      .limit(1);

    const bufferTime = result.length > 0 ? (result[0].bufferTime ?? 0) : 0;
    res.json({ bufferTime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/availability/buffer-time
// Applies a global buffer time to all event types for the user
export const setBufferTime = async (req, res) => {
  try {
    const { eventTypes } = await import("../database/schema.js");
    const { bufferTime } = req.body;
    const mins = parseInt(bufferTime, 10);

    if (isNaN(mins) || mins < 0) {
      return res.status(400).json({ message: "Invalid buffer time" });
    }

    await db
      .update(eventTypes)
      .set({ bufferTime: mins })
      .where(eq(eventTypes.userId, req.user.id));

    res.json({ bufferTime: mins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};