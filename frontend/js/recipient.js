/* ============================================================
   REPLATE — recipient.js
   Handles the NGO / shelter / daycare registration form.
   ============================================================ */

const recipientForm = document.getElementById("recipient-form");
const recipientMsg = document.getElementById("recipient-msg");

recipientForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(recipientForm);
  const payload = Object.fromEntries(formData.entries());

  const submitBtn = recipientForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Registering...";

  try {
    const result = await Api.createRecipient(payload);
    recipientMsg.textContent = `Thanks, ${payload.orgName}! Your organization is registered (ID #${result.id}). We'll match deliveries to your preferences.`;
    recipientMsg.className = "form-msg success";
    recipientForm.reset();
  } catch (err) {
    recipientMsg.textContent =
      "Couldn't reach the server. Make sure the backend is running (see README), then try again.";
    recipientMsg.className = "form-msg error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register Organization";
  }
});
