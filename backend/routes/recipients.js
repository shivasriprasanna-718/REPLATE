/* ============================================================
   REPLATE — routes/recipients.js
   NGO / shelter / daycare registration.
   Now backed by a real SQLite table (see db/index.js).
   ============================================================ */

const express = require("express");
const { run, all, get, nextId } = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(all("SELECT * FROM recipients ORDER BY createdAt DESC"));
});

router.post("/", (req, res) => {
  const { orgName, orgType, contactPerson, phone, address, capacity, preferredType, timings } = req.body;

  if (!orgName || !orgType || !contactPerson || !phone || !address) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const id = nextId("r");
  const createdAt = new Date().toISOString();

  run(
    `INSERT INTO recipients (id, orgName, orgType, contactPerson, phone, address, capacity, preferredType, timings, createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, orgName, orgType, contactPerson, phone, address, Number(capacity) || 0, preferredType || "Any", timings || "", createdAt]
  );

  res.status(201).json(get("SELECT * FROM recipients WHERE id = ?", [id]));
});

module.exports = router;
