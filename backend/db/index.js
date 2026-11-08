/* ============================================================
   REPLATE — db/index.js
   A real SQLite database, using sql.js (SQLite compiled to
   WebAssembly). We chose this over better-sqlite3 because it
   needs NO native build tools (no Python/Visual Studio Build
   Tools required) — it just works with `npm install`, which
   matters when this has to run on a classmate's Windows laptop
   with zero setup.

   The database lives on disk at data/replate.db and can be
   opened directly with a tool like "DB Browser for SQLite" to
   show your professor the raw tables during a demo.
   ============================================================ */

const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "..", "data", "replate.db");

let db; // the live sql.js Database instance, set by initDb()

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    db = new SQL.Database(fs.readFileSync(DB_FILE));
  } else {
    db = new SQL.Database();
    createSchema();
    seed();
    persist();
  }
  return db;
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      contact TEXT,
      foodType TEXT,
      quantity TEXT,
      address TEXT,
      pickupTime TEXT,
      expiry TEXT,
      notes TEXT,
      photoCount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      verified INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS recipients (
      id TEXT PRIMARY KEY,
      orgName TEXT NOT NULL,
      orgType TEXT,
      contactPerson TEXT,
      phone TEXT,
      address TEXT,
      capacity INTEGER DEFAULT 0,
      preferredType TEXT,
      timings TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      area TEXT,
      points INTEGER DEFAULT 0,
      createdAt TEXT
    );
  `);
}

function seed() {
  const donations = [
    ["d1", "Hostel Block C", "9876543210", "Cooked meals", "18 meals", "Gachibowli, Hyderabad", "2026-07-18T18:00", "2026-07-18T22:00", "", 0, "pending", 1, 40, "2026-07-18T10:00:00.000Z"],
    ["d2", "Sunrise Banquet Hall", "9876500000", "Event leftovers", "60 meals", "Madhapur, Hyderabad", "2026-07-18T20:00", "2026-07-19T00:00", "Wedding leftovers, still warm", 2, "pending", 0, 120, "2026-07-18T09:20:00.000Z"],
    ["d3", "Cafe Mocha", "9876511111", "Bakery items", "9 boxes", "Kondapur, Hyderabad", "2026-07-18T17:00", "2026-07-19T09:00", "", 1, "completed", 1, 25, "2026-07-18T08:05:00.000Z"],
  ];
  donations.forEach((row) =>
    db.run(
      `INSERT INTO donations (id, source, contact, foodType, quantity, address, pickupTime, expiry, notes, photoCount, status, verified, points, createdAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      row
    )
  );

  const volunteers = [
    ["v1", "Priya K.", "9000000001", "Gachibowli", 980, "2026-07-01T00:00:00.000Z"],
    ["v2", "Arjun R.", "9000000002", "Madhapur", 540, "2026-07-01T00:00:00.000Z"],
  ];
  volunteers.forEach((row) =>
    db.run(`INSERT INTO volunteers (id, name, phone, area, points, createdAt) VALUES (?,?,?,?,?,?)`, row)
  );
}

function persist() {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

// Run an INSERT/UPDATE/DELETE, then save the DB file to disk
function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

// Run a SELECT, return an array of row objects
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Run a SELECT, return the first row (or null)
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

function nextId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

module.exports = { initDb, run, all, get, nextId };
