// src/routes/applicationroutes.js
import express from "express";
import { getApplications, applyJob, updateStatus } from "../controllers/applicationcontroller.js";

const router = express.Router();

router.get("/", getApplications);
router.post("/apply", applyJob);
router.put("/:appId/status", updateStatus);

export default router;