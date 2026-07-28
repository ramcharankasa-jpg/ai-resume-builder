const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// POST /api/ai/improve - sends resume text to Claude for professional rewriting
router.post("/improve", async (req, res) => {
  const { text, type, uid } = req.body;

  if (!text || !type) {
    return res.status(400).json({ error: "Missing text or type" });
  }

  const prompts = {
    summary:
      "Rewrite the following resume professional summary to be more concise, impactful, and achievement-oriented. Keep it under 60 words. Return only the rewritten text, no preamble:\n\n",
    experience:
      "Rewrite the following work experience description into 3-5 strong resume bullet points using action verbs and quantifiable impact where possible. Return only the rewritten bullet points, no preamble:\n\n"
  };

  const promptPrefix = prompts[type] || prompts.summary;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: promptPrefix + text }]
      })
    });

    const data = await response.json();
    const improvedText = data?.content?.[0]?.text?.trim();

    // Log the request for analytics (optional, non-blocking)
    if (uid) {
      pool
        .query("INSERT INTO ai_requests_log (uid, request_type) VALUES ($1, $2)", [uid, type])
        .catch((e) => console.error("Log insert failed:", e));
    }

    if (!improvedText) {
      return res.status(502).json({ error: "AI service returned no content" });
    }

    res.json({ improvedText });
  } catch (err) {
    console.error("AI improve error:", err);
    res.status(500).json({ error: "AI service error" });
  }
});

module.exports = router;
