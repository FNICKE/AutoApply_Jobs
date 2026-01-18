// src/controllers/usercontroller.js (Updated: Fixed addSkills INSERT query with proper ON DUPLICATE KEY UPDATE for updated_at; added skill normalization (trim + lowercase for uniqueness); improved error handling; ensured parsed_skills is parsed as array in response)
import db from "../config/db.js";
import jwt from "jsonwebtoken";

export const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const userId = decoded.id;

    const [users] = await db.query(
      "SELECT id, full_name, email, role, experience_years, education, current_company, parsed_skills, ats_score FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const [skills] = await db.query("SELECT skill_name FROM skills WHERE user_id = ?", [userId]);
    users[0].skills = skills.map(s => s.skill_name);
    // Ensure parsed_skills is always an array
    users[0].parsed_skills = JSON.parse(users[0].parsed_skills || '[]');

    res.json(users[0]);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const userId = decoded.id;
    const { full_name, role, experience_years, education, current_company } = req.body;

    const [result] = await db.query(
      "UPDATE users SET full_name = ?, role = ?, experience_years = ?, education = ?, current_company = ? WHERE id = ?",
      [full_name, role, experience_years, education, current_company, userId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    const [users] = await db.query(
      "SELECT id, full_name, email, role, experience_years, education, current_company, parsed_skills, ats_score FROM users WHERE id = ?",
      [userId]
    );

    const [skills] = await db.query("SELECT skill_name FROM skills WHERE user_id = ?", [userId]);
    users[0].skills = skills.map(s => s.skill_name);
    // Ensure parsed_skills is always an array
    users[0].parsed_skills = JSON.parse(users[0].parsed_skills || '[]');

    res.json({ message: "Profile updated (ready for auto-applies)", user: users[0] });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addSkills = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const userId = decoded.id;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: "Skills array required (non-empty)" });
    }

    // Normalize skills: trim and lowercase for consistency/uniqueness
    const normalizedSkills = skills.map(skill => skill.trim().toLowerCase()).filter(skill => skill);

    if (normalizedSkills.length === 0) {
      return res.status(400).json({ message: "No valid skills provided" });
    }

    // Insert or update skills (assumes 'skills' table with UNIQUE INDEX on (user_id, skill_name))
    const insertPromises = normalizedSkills.map(skill => 
      db.query(
        "INSERT INTO skills (user_id, skill_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP",
        [userId, skill]
      )
    );

    await Promise.all(insertPromises);

    // Fetch updated skills for confirmation
    const [updatedSkills] = await db.query("SELECT skill_name FROM skills WHERE user_id = ? ORDER BY skill_name", [userId]);

    res.json({ 
      message: `Skills added (improves match rate for interviews). Total: ${updatedSkills.length}`, 
      skills: updatedSkills.map(s => s.skill_name)
    });
  } catch (error) {
    console.error("Add skills error:", error);
    res.status(500).json({ message: "Server error" });
  }
};