// src/controllers/authcontroller.js
import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { startAutoSearch, stopAutoSearch } from "../config/interval_map.js";
import { autoApplyJobs } from "./jobcontroller.js";

export const register = async (req, res) => {
  const { full_name, email, password, role, experience_years } = req.body;

  try {
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (full_name, email, password, role, experience_years) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, role || 'software developer', experience_years || 0]
    );

    const [users] = await db.query("SELECT id, full_name, email, role, experience_years, created_at FROM users WHERE id = ?", [result.insertId]);
    const user = users[0];

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.status(201).json({ message: "Registered! Auto-apply ready for dev roles.", token, user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    // Start auto-search: Multi-role, 30/day
    startAutoSearch(user.id, async () => {
      try {
        const mockReq = { user: { id: user.id }, body: { maxApps: 30, role: 'all' } };  // All roles
        const mockRes = { json: (data) => console.log('Auto-apply (multi-role):', data.message) };
        await autoApplyJobs(mockReq, mockRes);
      } catch (err) {
        console.error('Auto-apply interval error:', err);
      }
    });

    res.json({ token, user: safeUser, message: "Logged in! Auto-applying 30/day across dev roles for interviews." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      stopAutoSearch(decoded.id);
    }

    res.json({ message: "Logged out. Auto-search stopped." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};