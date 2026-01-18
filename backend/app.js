// src/app.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authroutes.js";
import userRoutes from "./src/routes/userroutes.js";
import jobRoutes from "./src/routes/jobroutes.js";
import applicationRoutes from "./src/routes/applicationroutes.js";
import resumeRoutes from "./src/routes/resumeroutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: '10mb' }));  // For resumes
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use("/uploads", express.static("uploads"));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes (semi-protected for jobs)
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/jobs", (req, res, next) => {
  if (req.method === 'POST') return authenticateToken(req, res, next);
  next();
}, jobRoutes);
app.use("/api/applications", authenticateToken, applicationRoutes);
app.use("/api/resumes", authenticateToken, resumeRoutes);

// Error & 404
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;