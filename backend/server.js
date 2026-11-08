/* ============================================================
   REPLATE — server.js
   Entry point for the backend. Initializes the SQLite database,
   starts an Express server on port 4000, enables CORS (so the
   static frontend can call it from a different port/file), and
   mounts each resource's routes under /api/...
   ============================================================ */

const express = require("express");
const cors = require("cors");
const { initDb, all } = require("./db");

const donationsRouter = require("./routes/donations");
const recipientsRouter = require("./routes/recipients");
const volunteersRouter = require("./routes/volunteers"); // also exposes /leaderboard

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Mount feature routes
app.use("/api/donations", donationsRouter);
app.use("/api/recipients", recipientsRouter);
app.use("/api/volunteers", volunteersRouter);
app.use("/api", volunteersRouter); // exposes GET /api/leaderboard

// GET /api/stats — homepage impact numbers + recent pickups for the "ledger"
app.get("/api/stats", (req, res) => {
  const donations = all("SELECT * FROM donations");

  const mealsRescued = donations.reduce((sum, d) => {
    const n = parseInt(d.quantity, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const recentPickups = [...donations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map((d) => ({ source: d.source, qty: d.quantity }));

  const recipients = all("SELECT * FROM recipients");

  res.json({
    mealsRescued,
    kgCo2Saved: Math.round(mealsRescued * 1.6), // rough estimate: ~1.6kg CO2e per meal saved
    activeDonors: new Set(donations.map((d) => d.source)).size,
    ngoPartners: recipients.length,
    recentPickups,
  });
});

// The DB is loaded from a WASM module asynchronously, so we wait
// for it to be ready before accepting requests.
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Replate backend running at http://localhost:${PORT}`);
    console.log(`Database file: backend/data/replate.db`);
  });
});
