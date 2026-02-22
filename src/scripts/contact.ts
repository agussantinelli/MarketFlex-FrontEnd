import { sendSupportMessage } from "../services/support.service";

export function initContactForm() {
    // Auto-fill and disable if logged in
    const userStr = localStorage.getItem("marketflex_user");
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;

    if (userStr && nameInput && emailInput) {
        try {
            const user = JSON.parse(userStr);
            if (user.nombre || user.apellido) {
                nameInput.value =
                    `${user.nombre || ""} ${user.apellido || ""}`.trim();
                nameInput.readOnly = true;
                nameInput.classList.add("readonly-input");
            }
            if (user.email) {
                emailInput.value = user.email;
                emailInput.readOnly = true;
                emailInput.classList.add("readonly-input");
            }
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
        }
    }

    const supportForm = document.getElementById(
        "support-form",
    ) as HTMLFormElement;
    if (supportForm) {
        supportForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = supportForm.querySelector(
                ".submit-btn",
            ) as HTMLButtonElement;
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Enviando...";
            submitBtn.disabled = true;

            const formData = new FormData(supportForm);

            try {
                await sendSupportMessage({
                    nombre: formData.get("name") as string,
                    email: formData.get("email") as string,
                    asunto: formData.get("subject") as string,
                    mensaje: formData.get("message") as string,
                });

                // Redirect with success query param for notification
                window.location.href = "/contacto?support_success=true";
            } catch (error) {
                console.error("Error submitting support message:", error);
                window.location.href = "/contacto?support_error=true";
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}
