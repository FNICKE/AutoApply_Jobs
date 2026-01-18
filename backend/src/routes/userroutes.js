// src/routes/user.routes.js (Updated/Add routes for user endpoints)
import express from "express";
import { getProfile, updateProfile, addSkills } from "../controllers/usercontroller.js";

const router = express.Router();

// Protected routes (add auth middleware if not already)
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/skills", addSkills);

export default router;