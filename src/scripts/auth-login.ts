import {
    login,
    loginWithGoogle,
    loginWithFacebook,
} from "../services/auth.service";

export function initLogin() {
    const loginForm = document.querySelector(".login-form") as HTMLFormElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const rememberCheckbox = document.querySelector(
        "input[name='remember']",
    ) as HTMLInputElement;

    if (!loginForm || !emailInput || !rememberCheckbox) return;

    // Password Visibility Toggle
    const toggleBtns = document.querySelectorAll("[data-toggle-for]");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const inputId = btn.getAttribute("data-toggle-for");
            if (!inputId) return;
            const input = document.getElementById(inputId) as HTMLInputElement;
            if (!input) return;

            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            btn.classList.toggle("password-visible", isPassword);
        });
    });

    // Load remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
    }



    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);
        const submitBtn = loginForm.querySelector(
            ".btn-login",
        ) as HTMLButtonElement;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Iniciando...";

            const response = await login({
                email: data.email as string,
                password: data.password as string,
            });

            // Handle Remember Me
            if (rememberCheckbox.checked) {
                localStorage.setItem("rememberedEmail", data.email as string);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            // Save session
            localStorage.setItem("marketflex_token", response.accessToken);
            localStorage.setItem("marketflex_refresh_token", response.refreshToken);
            localStorage.setItem("marketflex_user", JSON.stringify(response.user));

            const userName = response.user.nombre || "Usuario";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}`;
        } catch (error: any) {
            console.error("❌ Login error:", error);

            let message = "Ocurrió un error al iniciar sesión";

            // Extract detailed message from ky error if possible
            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    message = errorData.error || errorData.message || message;
                } catch (e) {
                    message = `Error ${error.response.status}: ${error.response.statusText}`;
                }
            } else if (error.message) {
                message = error.message;
            }

            // Use Sileo notification
            if (typeof (window as any).triggerSileo === 'function') {
                (window as any).triggerSileo('error', message);
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = `Iniciar Sesión <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
        }
    });

    // Google Sign-In
    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const result = await loginWithGoogle(credentialResponse.credential);

            localStorage.setItem("marketflex_token", result.accessToken);
            localStorage.setItem("marketflex_refresh_token", result.refreshToken);
            localStorage.setItem("marketflex_user", JSON.stringify(result.user));

            const userName = result.user.nombre || "Usuario";
            const newParam = result.isNewUser ? "&new=true" : "";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}${newParam}`;
        } catch (error: any) {
            console.error("❌ Google login error:", error);

            let message = "Error en el inicio de sesión con Google";
            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    message = errorData.error || errorData.message || message;
                } catch (e) {
                    message = `Error ${error.response.status}: ${error.response.statusText}`;
                }
            }

            // Use Sileo notification
            if (typeof (window as any).triggerSileo === 'function') {
                (window as any).triggerSileo('error', message);
            }
        }
    };

    (window as any).handleGoogleCredentialResponse = handleGoogleLogin;

    const googleBtn = document.getElementById("google-login-btn");
    googleBtn?.addEventListener("click", () => {
        const google = (window as any).google;
        if (!google) {
            console.error("Google SDK not loaded");
            return;
        }

        google.accounts.id.initialize({
            client_id:
                "697852573228-jl7nemqo3paglicuba0sdr68gshe1kta.apps.googleusercontent.com",
            callback: handleGoogleLogin,
            auto_select: false,
            use_fedcm_for_prompt: false,
        });
        google.accounts.id.prompt();
    });

    // Facebook Login
    const fbAppId = "2098383814330615";

    // Load Facebook SDK
    if (!(window as any).fbAsyncInit) {
        (window as any).fbAsyncInit = function () {
            (window as any).FB.init({
                appId: fbAppId,
                cookie: true,
                xfbml: true,
                version: "v21.0",
            });
        };

        // Inject FB SDK script if not already present
        if (!document.getElementById("facebook-jssdk")) {
            (function (d, s, id) {
                const fjs = d.getElementsByTagName(s)[0];
                const parent = fjs?.parentNode;
                if (d.getElementById(id) || !fjs || !parent) return;
                const js = d.createElement(s) as HTMLScriptElement;
                js.id = id;
                js.src = "https://connect.facebook.net/es_LA/sdk.js";
                parent.insertBefore(js, fjs);
            })(document, "script", "facebook-jssdk");
        }
    }

    const fbBtn = document.getElementById("fb-login-btn");
    fbBtn?.addEventListener("click", () => {
        const FB = (window as any).FB;
        if (!FB) {
            console.error("Facebook SDK not loaded");
            return;
        }

        FB.login(
            (response: any) => {
                if (response.authResponse) {
                    loginWithFacebook(response.authResponse.accessToken)
                        .then((result) => {
                            localStorage.setItem("marketflex_token", result.accessToken);
                            localStorage.setItem("marketflex_refresh_token", result.refreshToken);
                            localStorage.setItem(
                                "marketflex_user",
                                JSON.stringify(result.user),
                            );

                            const userName = result.user.nombre || "Usuario";
                            const newParam = result.isNewUser
                                ? "&new=true"
                                : "";
                            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}${newParam}`;
                        })
                        .catch(async (error) => {
                            console.error("❌ Facebook login error:", error);

                            let message = "Error en el inicio de sesión con Facebook";
                            if (error.response) {
                                try {
                                    const errorData = await error.response.json();
                                    message = errorData.error || errorData.message || message;
                                } catch (e) {
                                    message = `Error ${error.response.status}: ${error.response.statusText}`;
                                }
                            }

                            // Use Sileo notification
                            if (typeof (window as any).triggerSileo === 'function') {
                                (window as any).triggerSileo('error', message);
                            }
                        });
                }
            },
            { scope: "email,public_profile" },
        );
    });
}
