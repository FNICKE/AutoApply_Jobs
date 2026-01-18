// src/routes/authroutes.js
import express from "express";
import { register, login, logout } from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);  // New logout route

export default router;