/* ============================================================
   REPLATE — routes/volunteers.js
   Volunteer registration and the Kindness Points leaderboard.
   Now backed by a real SQLite database (see db/index.js).
   ============================================================ */

const express = require("express");
const { run, all, get, nextId } = require("../db");

const router = express.Router();

// POST /api/volunteers — register a new volunteer
router.post("/", (req, res) => {
  const { name, phone, area } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const id = nextId("v");
  const createdAt = new Date().toISOString();

  run(
    `INSERT INTO volunteers (id, name, phone, area, points, createdAt) VALUES (?,?,?,?,?,?)`,
    [id, name, phone, area || "", 0, createdAt]
  );

  res.status(201).json(get("SELECT * FROM volunteers WHERE id = ?", [id]));
});

// GET /api/leaderboard — donors (grouped by source) + volunteers, ranked by points
router.get("/leaderboard", (req, res) => {
  const donorRows = all(
    `SELECT source AS name, SUM(points) AS points FROM donations GROUP BY source`
  );
  const volunteerRows = all(`SELECT name, points FROM volunteers`);

  const combined = [...donorRows, ...volunteerRows].sort((a, b) => b.points - a.points);
  res.json(combined);
});

module.exports = router;
