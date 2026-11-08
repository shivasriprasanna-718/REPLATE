/* ============================================================
   REPLATE — volunteer.js
   Volunteer dashboard: loads pending pickups from the backend
   and lets a volunteer mark them Completed / Delivered.
   ============================================================ */

const DEMO_PICKUPS = [
  { id: "d1", source: "Hostel Block C", foodType: "Cooked meals", quantity: "18 meals", address: "Gachibowli", status: "pending", verified: true },
  { id: "d2", source: "Sunrise Banquet Hall", foodType: "Event leftovers", quantity: "60 meals", address: "Madhapur", status: "pending", verified: false },
  { id: "d3", source: "Cafe Mocha", foodType: "Bakery items", quantity: "9 boxes", address: "Kondapur", status: "completed", verified: true },
];

const list = document.getElementById("pickup-list");

function pickupCard(p) {
  return `
    <div class="pickup-card" data-id="${p.id}">
      <div>
        <span class="pickup-badge ${p.status}">${p.status}</span>
      </div>
      <div>
        <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--forest)">${p.source}</h3>
        <div class="pickup-meta">
          <span>${p.foodType}</span>
          <span>${p.quantity}</span>
          <span>${p.address}</span>
          ${p.verified ? '<span class="verified">&#10003; Verified Safe</span>' : ""}
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${
          p.status === "pending"
            ? `<button class="btn btn-primary btn-sm" data-action="completed">Mark Completed</button>`
            : ""
        }
        ${
          p.status === "completed"
            ? `<button class="btn btn-tomato btn-sm" data-action="delivered">Mark Delivered</button>`
            : ""
        }
      </div>
    </div>`;
}

function render(pickups) {
  if (!list) return;
  list.innerHTML = pickups.map(pickupCard).join("") || "<p>No pickup requests right now.</p>";
}

async function loadPickups() {
  try {
    const data = await Api.getDonations();
    render(data);
  } catch (err) {
    render(DEMO_PICKUPS);
  }
}

list?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const card = btn.closest(".pickup-card");
  const id = card.dataset.id;
  const status = btn.dataset.action;

  try {
    await Api.updateDonationStatus(id, status);
  } catch (err) {
    // offline demo mode — update UI anyway
  }
  loadPickups();
});

document.addEventListener("DOMContentLoaded", loadPickups);
