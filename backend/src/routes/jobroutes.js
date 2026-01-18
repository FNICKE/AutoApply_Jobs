// src/routes/jobroutes.js
import express from "express";
import { getJobs, getJobMatches, autoApplyJobs } from "../controllers/jobcontroller.js";

const router = express.Router();

router.get("/", getJobs);  // e.g., /api/jobs?role=mern&q=react&location=Maharashtra
router.get("/matches/:userId", getJobMatches);  // e.g., /api/jobs/matches/1?role=java
router.post("/auto-apply", autoApplyJobs);  // Body: { maxApps: 5, role: "fullstack" }

export default router;