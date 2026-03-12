import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";
import { eq } from "drizzle-orm";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, username })
      .returning();

    res.status(201).json({
      message: "User created successfully",
      token: generateToken(newUser),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id));

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/demo-login
// Logs in as the first registered user (demo / test user) without a password
export const demoLogin = async (req, res) => {
  try {
    const DEMO_EMAIL = process.env.DEMO_USER_EMAIL;

    let user;
    if (DEMO_EMAIL) {
      // If a specific demo user is configured, use that
      const [found] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));
      user = found;
    }

    if (!user) {
      // Fall back to the first user in the DB
      const [first] = await db.select().from(users).limit(1);
      user = first;
    }

    if (!user) {
      return res.status(404).json({ message: "No demo user found. Please register a user first." });
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};