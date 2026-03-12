import { db } from "./database/db.js";
import { users, eventTypes, availability } from "./database/schema.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  console.log("🌱 Seeding database...");

  // Create test user
  const hashedPassword = await bcrypt.hash("demo123", 10);

  const [user] = await db
    .insert(users)
    .values({
      name: "Demo User",
      email: "devaanshdubey2211@gmail.com",
      password: hashedPassword,
      username: "demo",
      timezone: "Asia/Kolkata",
    })
    .returning();

  console.log("✅ Test user created:", user.email);

  // Seed event types
  await db.insert(eventTypes).values([
    {
      userId: user.id,
      title: "15 Min Quick Call",
      description: "A quick 15 minute introductory call",
      duration: 15,
      slug: "15-min-quick-call",
    },
    {
      userId: user.id,
      title: "30 Min Meeting",
      description: "A standard 30 minute meeting",
      duration: 30,
      slug: "30-min-meeting",
    },
    {
      userId: user.id,
      title: "60 Min Consultation",
      description: "A deep dive 1 hour consultation session",
      duration: 60,
      slug: "60-min-consultation",
    },
  ]);

  console.log("✅ Event types seeded");

  // Seed availability (Mon-Fri, 9am-5pm)
  const weekdays = [1, 2, 3, 4, 5]; // Mon to Fri
  await db.insert(availability).values(
    weekdays.map((day) => ({
      userId: user.id,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      timezone: "Asia/Kolkata",
    }))
  );

  console.log("✅ Availability seeded");
  console.log("\n🎉 Done! Test credentials:");
  console.log("   Email:    devaanshdubey2211@gmail.com");
  console.log("   Password: demo123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});