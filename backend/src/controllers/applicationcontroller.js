// src/controllers/applicationcontroller.js (Full updated code: FIXED query to select ONLY existing columns (id, job_id, status, applied_at) to avoid 'Unknown column' error; separate async fetch for job_title/company_name from 'jobs' table with try-catch fallback to 'Untitled Job'/'N/A'; always returns { applications: [{ id, job_id, job_title, company_name, status, applied_at }, ...], total, page, limit }; enhanced logging; ON DUPLICATE in applyJob stores title/company)
import db from "../config/db.js";
import jwt from "jsonwebtoken";

// Reuse getUserId
const getUserId = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET).id;
    } catch (err) {
      console.error('Token invalid:', err);
    }
  }
  return null;
};

export const getApplications = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized - login required' });

    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // FIXED: Select ONLY core existing columns from applications (no job_title/company_name here to avoid error)
    const [applications] = await db.query(
      `SELECT id, job_id, status, applied_at 
       FROM applications 
       WHERE user_id = ? 
       ORDER BY applied_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM applications WHERE user_id = ?', [userId]);

    // Enhanced: Fetch job_title/company_name from jobs table if available (with fallback)
    const safeApps = await Promise.all((applications || []).map(async (app) => {
      let job_title = 'Untitled Job';
      let company_name = 'N/A';
      try {
        const [jobs] = await db.query(
          'SELECT title AS job_title, company_name FROM jobs WHERE id = ?',
          [app.job_id]
        );
        if (jobs.length > 0) {
          job_title = jobs[0].job_title || job_title;
          company_name = jobs[0].company_name || company_name;
        }
      } catch (jobError) {
        console.warn(`Job details fetch failed for job_id ${app.job_id}:`, jobError.message);
      }
      return {
        ...app,
        job_title,
        company_name
      };
    }));

    // Default empty array if none
    res.json({ 
      applications: safeApps, 
      total: countResult[0].total || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get applications error (full stack):', error.stack || error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

export const applyJob = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { job_id } = req.body;
    if (!job_id) return res.status(400).json({ message: 'Job ID required' });

    // Fetch job details (with fallback)
    let job_title = 'Untitled Job';
    let company_name = 'N/A';
    try {
      const [jobs] = await db.query('SELECT title AS job_title, company_name FROM jobs WHERE id = ?', [job_id]);
      if (jobs.length > 0) {
        job_title = jobs[0].job_title || job_title;
        company_name = jobs[0].company_name || company_name;
      }
    } catch (jobError) {
      console.warn('Jobs table query failed (using defaults):', jobError.message);
    }

    // Insert application (ON DUPLICATE KEY UPDATE; stores title/company for self-contained table)
    const [result] = await db.query(
      `INSERT INTO applications (user_id, job_id, job_title, company_name, status) 
       VALUES (?, ?, ?, ?, 'applied') 
       ON DUPLICATE KEY UPDATE status = 'applied', applied_at = CURRENT_TIMESTAMP, job_title = VALUES(job_title), company_name = VALUES(company_name)`,
      [userId, job_id, job_title, company_name]
    );

    res.json({ 
      message: 'Applied successfully!', 
      application_id: result.insertId,
      job_title 
    });
  } catch (error) {
    console.error('Apply job error (full stack):', error.stack || error);
    res.status(500).json({ message: 'Failed to apply' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { appId } = req.params;
    const { status } = req.body;
    if (!status || !['applied', 'interview', 'offer', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [result] = await db.query(
      'UPDATE applications SET status = ? WHERE id = ? AND user_id = ?',
      [status, appId, userId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Application not found' });

    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Update status error (full stack):', error.stack || error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};