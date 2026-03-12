import { db } from "../database/db.js";
import { eventTypes } from "../database/schema.js";
import { eq, and } from "drizzle-orm";

// GET /api/event-types  — list all for logged in user
export const getEventTypes = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(eventTypes)
      .where(eq(eventTypes.userId, req.user.id));

    res.json(result.map(et => ({
      ...et,
      customQuestions: et.customQuestions ? JSON.parse(et.customQuestions) : [],
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/event-types  — create new
export const createEventType = async (req, res) => {
  try {
    const { title, description, duration, slug, bufferTime, customQuestions } = req.body;

    // Check slug is unique
    const existing = await db
      .select()
      .from(eventTypes)
      .where(eq(eventTypes.slug, slug));

    if (existing.length > 0) {
      return res.status(400).json({ message: "Slug already taken" });
    }

    const [newEvent] = await db
      .insert(eventTypes)
      .values({
        userId: req.user.id,
        title,
        description,
        duration,
        slug,
        bufferTime:      bufferTime ?? 0,
        customQuestions: Array.isArray(customQuestions) && customQuestions.length
          ? JSON.stringify(customQuestions.filter(q => q.trim()))
          : null,
      })
      .returning();

    res.status(201).json({
      ...newEvent,
      customQuestions: newEvent.customQuestions ? JSON.parse(newEvent.customQuestions) : [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/event-types/:id  — edit
export const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, slug, isActive, bufferTime, customQuestions } = req.body;

    // Make sure this event belongs to the logged in user
    const [existing] = await db
      .select()
      .from(eventTypes)
      .where(
        and(
          eq(eventTypes.id, parseInt(id)),
          eq(eventTypes.userId, req.user.id)
        )
      );

    if (!existing) {
      return res.status(404).json({ message: "Event type not found" });
    }

    const updateData = { title, description, duration, slug };
    if (isActive !== undefined) updateData.isActive = isActive;
    if (bufferTime !== undefined) updateData.bufferTime = bufferTime;
    if (customQuestions !== undefined) {
      updateData.customQuestions = Array.isArray(customQuestions) && customQuestions.length
        ? JSON.stringify(customQuestions.filter(q => q.trim()))
        : null;
    }

    const [updated] = await db
      .update(eventTypes)
      .set(updateData)
      .where(eq(eventTypes.id, parseInt(id)))
      .returning();

    res.json({
      ...updated,
      customQuestions: updated.customQuestions ? JSON.parse(updated.customQuestions) : [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/event-types/:id  — delete
export const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(eventTypes)
      .where(
        and(
          eq(eventTypes.id, parseInt(id)),
          eq(eventTypes.userId, req.user.id)
        )
      );

    if (!existing) {
      return res.status(404).json({ message: "Event type not found" });
    }

    await db
      .delete(eventTypes)
      .where(eq(eventTypes.id, parseInt(id)));

    res.json({ message: "Event type deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};