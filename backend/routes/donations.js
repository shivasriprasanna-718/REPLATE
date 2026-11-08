/* ============================================================
   REPLATE — routes/donations.js
   Everything about a donor's "pickup request": creating one,
   listing them for the volunteer dashboard, and updating status
   as a volunteer collects and delivers the food.
   Now backed by a real SQLite table (see db/index.js).
   ============================================================ */

const express = require("express");
const { run, all, get, nextId } = require("../db");

const router = express.Router();

// GET /api/donations — list all pickups (newest first)
router.get("/", (req, res) => {
  const rows = all("SELECT * FROM donations ORDER BY createdAt DESC");
  res.json(rows.map(toClient));
});

// POST /api/donations — donor requests a pickup
router.post("/", (req, res) => {
  const { source, contact, foodType, quantity, address, pickupTime, expiry, notes, photoCount } = req.body;

  if (!source || !contact || !foodType || !quantity || !address) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const id = nextId("d");
  const createdAt = new Date().toISOString();

  run(
    `INSERT INTO donations (id, source, contact, foodType, quantity, address, pickupTime, expiry, notes, photoCount, status, verified, points, createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, source, contact, foodType, quantity, address, pickupTime || null, expiry || null, notes || "", Number(photoCount) || 0, "pending", 0, 20, createdAt]
  );

  res.status(201).json(toClient(get("SELECT * FROM donations WHERE id = ?", [id])));
});

// PATCH /api/donations/:id/status — volunteer marks completed / delivered
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "completed", "delivered"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
  }

  const donation = get("SELECT * FROM donations WHERE id = ?", [req.params.id]);
  if (!donation) return res.status(404).json({ message: "Donation not found." });

  const verified = status === "completed" ? 1 : donation.verified;
  run("UPDATE donations SET status = ?, verified = ? WHERE id = ?", [status, verified, req.params.id]);

  res.json(toClient(get("SELECT * FROM donations WHERE id = ?", [req.params.id])));
});

// SQLite stores booleans as 0/1 — convert to true/false for the frontend
function toClient(row) {
  return { ...row, verified: !!row.verified };
}

module.exports = router;
