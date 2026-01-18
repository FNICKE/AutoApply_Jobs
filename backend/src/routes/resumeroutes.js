// src/routes/resumeroutes.js (No middleware: Public routes; token handled in controllers)
import express from 'express';
import { uploadResume, uploadAndParseResume, getResumeData, deleteResume } from "../controllers/resumecontroller.js";

const router = express.Router();

// POST /api/resumes/upload - Upload and parse resume (token via header)
router.post('/upload', uploadResume, uploadAndParseResume);

// GET /api/resumes - Get resume data (token via query or header)
router.get('/', getResumeData);

// DELETE /api/resumes - Delete resume (token via header)
router.delete('/', deleteResume);

export default router;