/* ============================================================
   REPLATE — leaderboard.js
   Loads the Kindness Points leaderboard from the backend.
   ============================================================ */

const DEMO_LEADERS = [
  { name: "Sunrise Banquet Hall", points: 1240 },
  { name: "Priya K. (Volunteer)", points: 980 },
  { name: "Hostel Block C", points: 860 },
  { name: "Cafe Mocha", points: 610 },
  { name: "Arjun R. (Volunteer)", points: 540 },
];

const board = document.getElementById("leaderboard");

function render(leaders) {
  if (!board) return;
  board.innerHTML = leaders
    .map(
      (l, i) => `
      <div class="leader-row">
        <span class="rank">#${i + 1}</span>
        <span>${l.name}</span>
        <span class="points">${l.points.toLocaleString()} pts</span>
      </div>`
    )
    .join("");
}

async function loadLeaderboard() {
  try {
    const data = await Api.getLeaderboard();
    render(data);
  } catch (err) {
    render(DEMO_LEADERS);
  }
}

document.addEventListener("DOMContentLoaded", loadLeaderboard);
