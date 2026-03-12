import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", [
  "upcoming",
  "cancelled",
  "completed",
]);

export const users = pgTable("users", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),
  email:     text("email").notNull().unique(),
  password:  text("password").notNull(),
  username:  text("username").notNull().unique(),
  timezone:  text("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventTypes = pgTable("event_types", {
  id:          serial("id").primaryKey(),
  userId:      integer("user_id").references(() => users.id).notNull(),
  title:       text("title").notNull(),
  description: text("description"),
  duration:    integer("duration").notNull(),
  slug:        text("slug").notNull().unique(),
  isActive:    boolean("is_active").default(true),
  bufferTime:      integer("buffer_time").default(0),
  customQuestions: text("custom_questions"),
  createdAt:       timestamp("created_at").defaultNow(),
});

export const availability = pgTable("availability", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").references(() => users.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Mon, 7=Sun
  startTime: text("start_time").notNull(),     // "09:00"
  endTime:   text("end_time").notNull(),       // "17:00"
  timezone:  text("timezone").default("UTC"),
});

// ← bonus: date overrides
export const dateOverrides = pgTable("date_overrides", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").references(() => users.id).notNull(),
  date:      text("date").notNull(),           // "2026-03-15"
  isBlocked: boolean("is_blocked").default(false),
  startTime: text("start_time"),               // null if blocked
  endTime:   text("end_time"),                 // null if blocked
});

export const bookings = pgTable("bookings", {
  id:          serial("id").primaryKey(),
  eventTypeId: integer("event_type_id").references(() => eventTypes.id).notNull(),
  bookerName:  text("booker_name").notNull(),
  bookerEmail: text("booker_email").notNull(),
  date:        text("date").notNull(),
  startTime:   text("start_time").notNull(),
  endTime:     text("end_time").notNull(),
  status:      bookingStatusEnum("status").default("upcoming"),
  note:        text("note"),
  meetLink:      text("meet_link"),
  googleEventId: text("google_event_id"),
  answers:       text("answers"),
  createdAt:     timestamp("created_at").defaultNow(),
});