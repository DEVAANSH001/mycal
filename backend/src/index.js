import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes         from "./routes/auth.routes.js";
import eventTypeRoutes    from "./routes/eventTypes.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import bookingRoutes      from "./routes/bookings.routes.js";
import publicRoutes       from "./routes/public.routes.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "https://mycal-lyart.vercel.app",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/event-types",  eventTypeRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings",     bookingRoutes);
app.use("/api/public",       publicRoutes);       // ← no auth

app.get("/", (req, res) => {
  res.json({ message: "Cal Clone API running ✅" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
