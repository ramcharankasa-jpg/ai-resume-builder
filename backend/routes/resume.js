const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// POST /api/resume/sync - upsert resume data into SQL (mirrors Firestore doc)
router.post("/sync", async (req, res) => {
  const { uid, fullName, email, phone, summary, skills, experience, education, photoUrl } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    const query = `
      INSERT INTO resumes (uid, full_name, email, phone, summary, skills, experience, education, photo_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (uid)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        summary = EXCLUDED.summary,
        skills = EXCLUDED.skills,
        experience = EXCLUDED.experience,
        education = EXCLUDED.education,
        photo_url = EXCLUDED.photo_url,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [uid, fullName, email, phone, summary, skills, experience, education, photoUrl];
    const result = await pool.query(query, values);
    res.json({ success: true, resume: result.rows[0] });
  } catch (err) {
    console.error("DB sync error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/resume/:uid - fetch a resume record from SQL
router.get("/:uid", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM resumes WHERE uid = $1", [req.params.uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB fetch error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
