// src/controllers/resumecontroller.js (Full updated code: Fixed pdf-parse dynamic import with specific path 'pdf-parse/lib/pdf-parse.js' and correct default access to resolve "pdfParse is not a function"; enhanced DB handling for 'resumes' table with proper INSERT/ON DUPLICATE KEY (assumes UNIQUE on user_id - add via SQL if missing); improved logging and error messages; ensured compatibility with provided table structure)
import path from 'path';
import multer from 'multer';
import fs from 'fs/promises';
import db from "../config/db.js";
import jwt from 'jsonwebtoken';
import { Groq } from 'groq-sdk';
import { autoApplyJobs } from './jobcontroller.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files!'), false);
  }
});

let groqClient = null;
const initGroq = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

export const uploadResume = upload.single('resume');

const getUserId = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET).id;
    } catch (err) {
      console.error('Token invalid:', err);
    }
  }
  return req.query.userId || null;
};

// FIX: Dynamic import with specific path for pdf-parse (resolves ESM/CJS "not a function" issue)
const parsePdfText = async (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Invalid PDF buffer: empty or not a buffer');
  }
  try {
    // Specific path and default access for CJS compatibility in ESM
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default;  // Access default export
    if (typeof pdfParse !== 'function') {
      throw new Error('pdfParse module did not export a function - check installation');
    }
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('PDF parse import/execution error:', err);
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error('pdf-parse package missing. Run: npm install pdf-parse');
    }
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
};

const calculateATSScore = (text) => {
  const keywords = ['react', 'node', 'javascript', 'sql', 'aws', 'java', 'spring', 'html', 'css', 'mongodb', 'python', 'git', 'docker', 'fullstack', 'frontend', 'backend'];
  const matches = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase())).length;
  return Math.min(matches * 10, 100);
};

const aiParseResume = async (text) => {
  const client = initGroq();
  if (!client) throw new Error('Groq API key not configured');
  const prompt = `
    Parse this resume for job applications. Extract in JSON:
    {
      "role": "Detected role (e.g., Fullstack Developer, prioritize fullstack/frontend/backend/web/java/software)",
      "experience_years": number (total relevant dev experience),
      "education": "Highest degree (e.g., B.Tech Computer Science)",
      "current_company": "Current employer",
      "parsed_skills": ["Top 10 skills, e.g., React, Node.js, Java, SQL, AWS"] (focus on dev tools for interviews)
    }
    Text: ${text.substring(0, 4000)}
  `;
  const completion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama3-8b-8192',
    temperature: 0.1,
  });
  const jsonStr = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(jsonStr);
};

export const uploadAndParseResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF resume uploaded' });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'User ID required (token or ?userId=)' });
    const { originalname } = req.file;
    const uploadsDir = process.env.UPLOADS_PATH || './uploads';
    const uploadPath = path.join(uploadsDir, `${userId}_${Date.now()}_${originalname}`);

    await fs.mkdir(uploadsDir, { recursive: true });

    if (!req.file.buffer) throw new Error('No file buffer received');

    await fs.writeFile(uploadPath, req.file.buffer);
    const text = await parsePdfText(req.file.buffer);  // Fixed import
    const parsedData = await aiParseResume(text);
    const atsScore = calculateATSScore(text);

    // Use 'resumes' table: INSERT/UPDATE with ON DUPLICATE KEY (assumes UNIQUE on user_id for latest resume)
    const [resumeResult] = await db.query(
      `INSERT INTO resumes (user_id, resume_path, ats_score) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE resume_path = VALUES(resume_path), ats_score = VALUES(ats_score), uploaded_at = CURRENT_TIMESTAMP`,
      [userId, uploadPath, atsScore]
    );

    // UPDATE users for parsed fields (keep hybrid: resumes for file/score, users for parsed)
    const [userResult] = await db.query(
      `UPDATE users
       SET parsed_text = ?, parsed_skills = ?, role = ?, experience_years = ?, education = ?, current_company = ?, ats_score = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [text, JSON.stringify(parsedData.parsed_skills || []), parsedData.role || null, parsedData.experience_years || 0, parsedData.education || null, parsedData.current_company || null, atsScore, userId]
    );

    if (userResult.affectedRows === 0) return res.status(404).json({ message: 'User not found' });

    // Add parsed skills to skills table
    for (const skill of (parsedData.parsed_skills || [])) {
      await db.query(
        "INSERT INTO skills (user_id, skill_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP", 
        [userId, skill]
      );
    }

    // Auto-trigger small apply (5 jobs)
    const mockReq = { user: { id: userId }, body: { maxApps: 5, role: parsedData.role || 'fullstack' } };
    const mockRes = { json: () => {} };
    await autoApplyJobs(mockReq, mockRes);

    res.json({
      message: 'Resume parsed! Skills/education/experience extracted. ATS: ' + atsScore + '. Auto-applied to 5 matches.',
      filePath: uploadPath,
      ats_score: atsScore,
      parsed: parsedData,
      resume_id: resumeResult.insertId || null
    });
  } catch (error) {
    console.error('Resume upload/parse error (full stack):', error);
    res.status(500).json({ message: 'Failed to process resume', error: error.message });
  }
};

export const getResumeData = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'User ID required (token or ?userId=)' });

    // Fetch latest from resumes
    const [resumes] = await db.query(
      "SELECT id, resume_path, ats_score, uploaded_at FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1",
      [userId]
    );

    if (resumes.length === 0) return res.status(404).json({ message: 'Resume data not found' });

    // Fetch parsed from users
    const [users] = await db.query(
      "SELECT parsed_text, parsed_skills, role, experience_years, education, current_company FROM users WHERE id = ?",
      [userId]
    );

    // Fetch skills
    const [skills] = await db.query("SELECT skill_name FROM skills WHERE user_id = ?", [userId]);

    res.json({
      ...resumes[0],
      ...(users[0] || {}),
      skills: skills.map(s => s.skill_name),
      parsed_skills: JSON.parse(users[0]?.parsed_skills || '[]')
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Failed to fetch resume data' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'User ID required (token or ?userId=)' });

    // Get latest resume from resumes
    const [resumes] = await db.query("SELECT id, resume_path FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1", [userId]);
    if (resumes[0]) {
      // Delete file
      if (resumes[0].resume_path) {
        await fs.unlink(resumes[0].resume_path).catch(err => console.warn('File delete warning:', err));
      }
      // Delete record
      await db.query("DELETE FROM resumes WHERE id = ?", [resumes[0].id]);
    }

    // Clear parsed in users
    await db.query(
      "UPDATE users SET parsed_text = NULL, parsed_skills = NULL, role = NULL, experience_years = NULL, education = NULL, current_company = NULL, ats_score = NULL WHERE id = ?",
      [userId]
    );
    
    // Clear skills (adjust if keeping manual)
    await db.query("DELETE FROM skills WHERE user_id = ?", [userId]);

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
};