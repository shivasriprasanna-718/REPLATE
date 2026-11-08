/* ============================================================
   REPLATE — donate.js
   Handles the "Request Pickup" form: photo preview (client-side
   only) and submitting the donation to the backend.
   ============================================================ */

const fileInput = document.getElementById("photos");
const dropZone = document.getElementById("file-drop");
const preview = document.getElementById("photo-preview");

if (dropZone && fileInput) {
  dropZone.addEventListener("click", () => fileInput.click());

  ["dragenter", "dragover"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add("drag");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag");
    })
  );
  dropZone.addEventListener("drop", (e) => {
    fileInput.files = e.dataTransfer.files;
    showPreview();
  });
  fileInput.addEventListener("change", showPreview);
}

function showPreview() {
  preview.innerHTML = "";
  [...fileInput.files].forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

const donateForm = document.getElementById("donate-form");
const donateMsg = document.getElementById("donate-msg");

donateForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(donateForm);
  const payload = Object.fromEntries(formData.entries());
  payload.photoCount = fileInput.files.length;

  const submitBtn = donateForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending request...";

  try {
    const result = await Api.createDonation(payload);
    donateMsg.textContent = `Pickup request received! Reference #${result.id}. A volunteer nearby will be notified.`;
    donateMsg.className = "form-msg success";
    donateForm.reset();
    preview.innerHTML = "";
  } catch (err) {
    donateMsg.textContent =
      "Couldn't reach the server. Make sure the backend is running (see README), then try again.";
    donateMsg.className = "form-msg error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Request Pickup";
  }
});
