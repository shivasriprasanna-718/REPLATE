/* ============================================================
   REPLATE — main.js
   Small shared behaviors used on every page: mobile nav toggle
   and marking the current page's nav link as active.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Highlight the active nav link based on the current file name
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === current) link.classList.add("active");
  });

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }
});
