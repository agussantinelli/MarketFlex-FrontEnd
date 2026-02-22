import { register } from "../services/auth.service";

export function initRegister() {
    const registerForm = document.querySelector(".register-form") as HTMLFormElement;

    if (!registerForm) return;

    // Helper for notifications using Sileo
    const notify = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        // @ts-ignore
        if (window.triggerSileo) {
            // @ts-ignore
            window.triggerSileo(type, message);
        } else {
            // Fallback for extreme cases
            alert(message);
        }
    };

    const passwordInput = registerForm.querySelector("#password") as HTMLInputElement;
    const reqLength = registerForm.querySelector("#req-length");
    const reqUpper = registerForm.querySelector("#req-upper");
    const reqNumber = registerForm.querySelector("#req-number");

    passwordInput?.addEventListener("input", () => {
        const value = passwordInput.value;
        const hasMinLen = value.length >= 6;
        const hasUpper = /[A-Z]/.test(value);
        const hasNumber = /[0-9]/.test(value);

        if (reqLength) reqLength.classList.toggle("met", hasMinLen);
        if (reqUpper) reqUpper.classList.toggle("met", hasUpper);
        if (reqNumber) reqNumber.classList.toggle("met", hasNumber);
    });

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);

        const password = data.password as string;
        const hasMinLen = password.length >= 6;
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasMinLen || !hasUpper || !hasNumber) {
            notify("error", "La contraseña no cumple con los requisitos de seguridad");
            return;
        }

        if (data.password !== data.confirmPassword) {
            notify("error", "Las contraseñas no coinciden");
            return;
        }

        const submitBtn = registerForm.querySelector(
            "button[type='submit']",
        ) as HTMLButtonElement;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Verificando...";

            // reCAPTCHA v3 Execution
            // @ts-ignore
            if (!window.grecaptcha) {
                throw new Error("reCAPTCHA no está disponible. Por favor, recarga la página.");
            }

            // @ts-ignore
            const token = await window.grecaptcha.execute(import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY, { action: 'register' });

            if (!token) {
                throw new Error("No se pudo obtener el token de verificación");
            }

            submitBtn.textContent = "Registrando...";

            const response = await register({
                nombre: data.nombre as string,
                apellido: data.apellido as string,
                dni: data.dni as string,
                tipoDni: data.tipoDni as string,
                email: data.email as string,
                password: data.password as string,
                fechaNacimiento: data.fechaNacimiento as string,
                paisNacimiento: data.paisNacimiento as string,
                ciudadResidencia: data.ciudadResidencia as string,
                codigoPostal: data.codigoPostal as string,
                foto: data.foto as string,
                rol: "customer",
                captchaToken: token // Use the fresh v3 token
            });

            // Save session
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));

            const userName = response.user.nombre || "Usuario";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}&new=true`;
        } catch (error) {
            console.error("Registration error:", error);
            const message = error instanceof Error ? error.message : "Error al registrar. Intente nuevamente";
            notify("error", message);
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrarse";
        }
    });
}
