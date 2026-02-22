import { register } from "../services/auth.service";

export function initRegister() {
    const registerForm = document.querySelector(".register-form") as HTMLFormElement;

    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);

        if (data.password !== data.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        const submitBtn = registerForm.querySelector(
            "button[type='submit']",
        ) as HTMLButtonElement;

        try {
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Registrando...";

            const response = await register({
                nombre: data.nombre as string,
                apellido: data.apellido as string,
                dni: data.dni as string,
                email: data.email as string,
                password: data.password as string,
                fechaNacimiento: data.fechaNacimiento as string,
                paisNacimiento: data.paisNacimiento as string,
                ciudadResidencia: data.ciudadResidencia as string,
                codigoPostal: data.codigoPostal as string,
                foto: data.foto as string,
                rol: "customer" // Default role
            });

            // Save session
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));

            const userName = response.user.nombre || "Usuario";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}&new=true`;
        } catch (error) {
            console.error("Registration error:", error);
            alert("Error al registrar: " + (error instanceof Error ? error.message : "Intente nuevamente"));
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrarse";
        }
    });
}
