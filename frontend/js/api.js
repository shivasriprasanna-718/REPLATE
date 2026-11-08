/* ============================================================
   REPLATE — api.js
   Tiny wrapper around fetch() so every page talks to the
   backend the same way. Change API_BASE if you deploy the
   backend somewhere other than localhost.
   ============================================================ */

const API_BASE = "http://localhost:4000/api";

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

const Api = {
  getStats: () => apiRequest("/stats"),
  getDonations: () => apiRequest("/donations"),
  createDonation: (data) =>
    apiRequest("/donations", { method: "POST", body: JSON.stringify(data) }),
  updateDonationStatus: (id, status) =>
    apiRequest(`/donations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  createRecipient: (data) =>
    apiRequest("/recipients", { method: "POST", body: JSON.stringify(data) }),
  createVolunteer: (data) =>
    apiRequest("/volunteers", { method: "POST", body: JSON.stringify(data) }),
  getLeaderboard: () => apiRequest("/leaderboard"),
};
