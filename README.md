# Replate — Food Rescue Platform

A web app that connects people/places with surplus food (hostels, restaurants,
event halls) to volunteers who collect it and NGOs/shelters/daycares who need
it — with a Kindness Points leaderboard to encourage participation.

Stack: **HTML, CSS, JavaScript** (frontend) + **Node.js/Express** (backend)
+ **SQLite** (real database, via `sql.js`). No frontend framework, no
build step — easy to run and easy to explain.

---

## 1. Project structure

```
replate/
├── frontend/
│   ├── index.html          → Landing page (hero, problem statement, 3 paths, stats)
│   ├── donate.html         → Donor: "Request Pickup" form
│   ├── volunteer.html      → Volunteer dashboard (list + status updates)
│   ├── recipient.html      → NGO/shelter registration form
│   ├── leaderboard.html    → Kindness Points leaderboard
│   ├── css/style.css       → All styling (design tokens at the top)
│   └── js/
│       ├── api.js          → fetch() wrapper — talks to the backend
│       ├── main.js         → shared nav behavior (all pages)
│       ├── home.js         → loads stats + ledger on index.html
│       ├── donate.js       → donation form + photo preview
│       ├── volunteer.js    → dashboard list + status buttons
│       ├── recipient.js    → registration form
│       └── leaderboard.js  → leaderboard list
│
└── backend/
    ├── server.js            → starts Express, mounts routes, /api/stats
    ├── package.json         → dependencies (express, cors, sql.js)
    ├── data/replate.db      → the real SQLite database file (created on first run)
    ├── routes/
    │   ├── donations.js     → GET/POST donations, PATCH status
    │   ├── recipients.js    → GET/POST recipient registrations
    │   └── volunteers.js    → POST volunteers, GET /leaderboard
    └── db/index.js          → SQLite connection, schema, query helpers
```

---

## 2. Step-by-step: set this up in VS Code from scratch

You already have the finished files in this folder — but here's how you'd
build this from an empty folder, step by step, so you can explain it and
reproduce it if asked.

### Step 1 — Install prerequisites
1. Install **VS Code**: https://code.visualstudio.com
2. Install **Node.js** (LTS version): https://nodejs.org — this gives you `node` and `npm`.
3. Confirm both installed correctly by opening a terminal and running:
   ```
   node -v
   npm -v
   ```

### Step 2 — Create the project folder
```
mkdir replate
cd replate
mkdir frontend backend
```
Open the `replate` folder in VS Code: `File → Open Folder`.

### Step 3 — Build the frontend
Inside `frontend/`, create `index.html`, `donate.html`, `volunteer.html`,
`recipient.html`, `leaderboard.html`, plus `css/style.css` and a `js/`
folder with `api.js`, `main.js`, `home.js`, `donate.js`, `volunteer.js`,
`recipient.js`, `leaderboard.js` (all already written for you here).

To preview it: install the **Live Server** extension in VS Code, right-click
`index.html` → "Open with Live Server". It'll open in your browser and
auto-refresh when you save changes.

### Step 4 — Build the backend
```
cd backend
npm init -y
npm install express cors sql.js
```
This creates `package.json` and downloads Express (web server framework),
CORS (lets the frontend, running on a different port, call the API), and
`sql.js` — a real SQLite database compiled to WebAssembly. We chose sql.js
over other SQLite packages because it needs **no native build tools**
(no Python, no Visual Studio Build Tools) — it just works after
`npm install`, on any machine.

Then create `server.js`, the `routes/` folder, and `db/index.js`
(all already written for you here). The database file itself
(`data/replate.db`) is created automatically the first time you run
the server — you don't create it by hand.

### Step 5 — Run the backend
```
cd backend
npm install        # only needed once, or after pulling fresh files
node server.js
```
You should see: `Replate backend running at http://localhost:4000`

Leave this terminal running. Open a **second terminal** (or just keep the
Live Server tab open) for the frontend.

### Step 6 — Run the frontend
- Right-click `frontend/index.html` in VS Code → **Open with Live Server**, or
- Just double-click `index.html` to open it directly in a browser.

The frontend calls the backend at `http://localhost:4000/api/...`
(set in `frontend/js/api.js`). If the backend isn't running, the pages
still work using built-in demo data — so you're never stuck with a blank
screen during the demo.

### Step 7 — Try the flow
1. Go to **Donate Food**, submit a pickup request.
2. Go to **Volunteer**, see it appear, click **Mark Completed**.
3. Go to **Leaderboard**, see points update.
4. Go to **Recipients**, register an NGO.

---

## 3. How to explain the code (for your presentation)

**Frontend (your part):**
- Plain HTML/CSS/JS, 5 pages, one shared stylesheet (`style.css`) and one
  small JS file per page, plus `api.js` as a shared helper so every page
  talks to the backend the same way (`Api.createDonation(...)`,
  `Api.getDonations()`, etc.) instead of repeating `fetch()` everywhere.
- Forms use the native `FormData` API to collect input, then call the
  matching `Api.*` function. On success, a success message is shown; on
  failure (e.g. backend not running), an error message is shown instead
  of the page silently failing.
- `home.js`, `volunteer.js`, and `leaderboard.js` all follow the same
  pattern: try to fetch real data from the backend; if that fails, fall
  back to hard-coded demo data — so the site always looks complete.

**Backend:**
- **Express** is a minimal Node.js web framework — it lets you define
  routes like `GET /api/donations` or `POST /api/donations` and write a
  function that runs when that URL is hit.
- We use **SQLite** as the database — a real, lightweight relational
  database that stores everything in a single file (`data/replate.db`).
  It's the same kind of database engine used inside apps like your phone's
  Photos app or Firefox. We use the `sql.js` package specifically because
  it's SQLite compiled to WebAssembly, so it installs with a plain
  `npm install` and needs no separate database server or native build
  tools — ideal for a student project that has to "just run" on any
  laptop.
- `db/index.js` sets up the connection, creates the three tables
  (`donations`, `recipients`, `volunteers`) if they don't exist yet, and
  exposes small `run()` / `all()` / `get()` helpers that routes use to
  execute SQL. Every write calls `persist()`, which saves the database
  back to `replate.db` on disk — so your data survives a server restart.
- Routes are split by resource (`donations.js`, `recipients.js`,
  `volunteers.js`) so each file has one job — this mirrors how real
  backend APIs (REST APIs) are commonly organized. Each route builds and
  runs a SQL query (e.g. `INSERT INTO donations ...`, `SELECT * FROM
  donations WHERE id = ?`) instead of manipulating a JSON blob.
- `/api/leaderboard` demonstrates SQL aggregation: it uses
  `SELECT source, SUM(points) ... GROUP BY source` to total up each
  donor's points directly in the database, rather than looping over data
  in JavaScript.
- `/api/stats` computes the homepage numbers (meals rescued, estimated
  CO₂ saved, active donors) directly from the donations table, instead of
  hard-coding them — so the "impact" numbers are real and grow as more
  donations come in.
- Want to *see* the database itself? Download the free tool
  **"DB Browser for SQLite"**, open `backend/data/replate.db`, and you can
  browse the actual tables and rows — a great thing to show live in your
  presentation.

**Talking points that map straight to your problem statement:**
- "One-click pickup request" → the Donate form.
- "Real-time pickup tracking" → the Volunteer dashboard's status badges
  (pending → completed → delivered).
- "Verified Safe badge" → the `verified` field, set true once a
  volunteer marks a pickup Completed.
- "Kindness Points / Leaderboard of Compassion" → `points` field per
  donation + the `/api/leaderboard` endpoint.
- "Zero-waste ecosystem" → mentioned on the homepage; food that fails
  verification is framed as going to composting/cocopeat instead of a
  landfill.

---

## 4. If you want to deploy it (optional, not required for a demo)
- Frontend: any static host (GitHub Pages, Netlify, Vercel).
- Backend: Render, Railway, or Cyclic (all have free tiers for small
  Node/Express apps). You'd update `API_BASE` in `frontend/js/api.js`
  to point at the deployed backend URL instead of `localhost:4000`.
