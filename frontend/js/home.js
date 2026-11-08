/* ============================================================
   REPLATE — home.js
   Fills the hero "ledger" and the stats strip on index.html.
   If the backend isn't running, we fall back to demo numbers
   so the page still looks complete for a quick demo.
   ============================================================ */

const DEMO_STATS = {
  mealsRescued: 3482,
  kgCo2Saved: 5890,
  activeDonors: 126,
  ngoPartners: 34,
  recentPickups: [
    { source: "Hostel Block C", qty: "18 meals", time: "12 min ago" },
    { source: "Sunrise Banquet Hall", qty: "60 meals", time: "40 min ago" },
    { source: "Cafe Mocha", qty: "9 meals", time: "1 hr ago" },
  ],
};

function renderStats(stats) {
  document.querySelectorAll("[data-stat]").forEach((el) => {
    const key = el.getAttribute("data-stat");
    if (stats[key] !== undefined) {
      el.textContent = stats[key].toLocaleString();
    }
  });
}

function renderLedger(rows) {
  const ledgerBody = document.getElementById("ledger-body");
  if (!ledgerBody) return;
  ledgerBody.innerHTML = rows
    .map(
      (r) => `
      <div class="ledger-row">
        <span>${r.source}</span>
        <span class="val">${r.qty}</span>
      </div>`
    )
    .join("");
}

async function loadHomeData() {
  try {
    const stats = await Api.getStats();
    renderStats(stats);
    renderLedger(stats.recentPickups || DEMO_STATS.recentPickups);
  } catch (err) {
    // Backend not running (e.g. static preview) — use demo data
    renderStats(DEMO_STATS);
    renderLedger(DEMO_STATS.recentPickups);
  }
}

document.addEventListener("DOMContentLoaded", loadHomeData);
