import {
    login,
    loginWithGoogle,
    loginWithFacebookCode,
} from "../services/auth.service";

// --- HELPERS (Out of main scope for better visibility and avoiding hoarding) ---

const handleFacebookCodeLogin = async (code: string, redirectUri: string) => {
    console.log("🔍 [Auth] Processing FB OAuth code on backend...");
    try {
        const result = await loginWithFacebookCode(code, redirectUri);
        console.log("🔍 [Auth] FB code exchange success:", {
            success: !!result.accessToken,
            user: result.user?.email
        });
        localStorage.setItem("marketflex_token", result.accessToken);
        localStorage.setItem("marketflex_refresh_token", result.refreshToken);
        localStorage.setItem("marketflex_user", JSON.stringify(result.user));

        const userName = result.user.nombre || "Usuario";
        window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}`;
    } catch (error: any) {
        console.error("❌ [Auth] Facebook code exchange error:", error);
        if (typeof (window as any).triggerSileo === 'function') {
            (window as any).triggerSileo('error', "Error al procesar login con Facebook");
        }
    }
};

const handleGoogleLogin = async (credentialResponse: any) => {
    console.log("🔍 [Auth] Google Callback Recibido!", {
        hasCredential: !!credentialResponse.credential
    });
    try {
        const result = await loginWithGoogle(credentialResponse.credential);
        localStorage.setItem("marketflex_token", result.accessToken);
        localStorage.setItem("marketflex_refresh_token", result.refreshToken);
        localStorage.setItem("marketflex_user", JSON.stringify(result.user));

        const userName = result.user.nombre || "Usuario";
        const newParam = result.isNewUser ? "&new=true" : "";
        window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}${newParam}`;
    } catch (error: any) {
        console.error("❌ [Auth] Google login error:", error);
        if (typeof (window as any).triggerSileo === 'function') {
            (window as any).triggerSileo('error', "Error en el inicio de sesión con Google");
        }
    }
};

const initializeGoogle = () => {
    const google = (window as any).google;
    if (google?.accounts?.id) {
        // Init only once
        if (!(window as any).isGoogleInitialized) {
            const client_id = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
            google.accounts.id.initialize({
                client_id: client_id,
                callback: handleGoogleLogin,
                auto_select: false,
                use_fedcm_for_prompt: false,
            });
            (window as any).isGoogleInitialized = true;
        }

        const btnContainer = document.getElementById("google-signin-button");
        if (btnContainer) {
            let lastWidth = 0;

            const renderGoogleButton = () => {
                const referenceBtn = document.getElementById("fb-login-btn");
                const parent = btnContainer.parentElement;
                if (!parent) return;

                const newWidth = referenceBtn?.clientWidth || Math.min(parent.clientWidth - 16, 370);

                if (newWidth > 200 && Math.abs(newWidth - lastWidth) > 10) {
                    lastWidth = newWidth;
                    btnContainer.innerHTML = "";
                    google.accounts.id.renderButton(btnContainer, {
                        theme: "outline",
                        size: "large",
                        text: "continue_with",
                        shape: "rectangular",
                        width: newWidth,
                        logo_alignment: "left"
                    });
                }
            };

            // Initial render
            renderGoogleButton();

            // Responsive observation
            const observer = new ResizeObserver(() => {
                window.requestAnimationFrame(() => renderGoogleButton());
            });
            observer.observe(btnContainer.parentElement!);
        }
    }
};

export function initLogin() {
    console.log("🔍 [Auth] initLogin() started");

    const isClient = typeof window !== 'undefined';
    if (!isClient) return;

    // 1. Check for Facebook OAuth Code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const fbCode = urlParams.get('code');
    const redirectUri = window.location.origin + window.location.pathname;

    if (fbCode) {
        console.log("🔍 [Auth] Facebook OAuth code detected, exchanging...");
        handleFacebookCodeLogin(fbCode, redirectUri);
        return; // Stop further init while processing
    }

    // 2. Main Login Form Logic
    const loginForm = document.querySelector(".login-form") as HTMLFormElement;
    if (loginForm && loginForm.getAttribute("data-auth-initialized") !== "true") {
        loginForm.setAttribute("data-auth-initialized", "true");

        const emailInput = document.getElementById("email") as HTMLInputElement;
        const rememberCheckbox = document.querySelector("input[name='remember']") as HTMLInputElement;

        // Load remembered email
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail && emailInput && rememberCheckbox) {
            emailInput.value = rememberedEmail;
            rememberCheckbox.checked = true;
        }

        // Form Submit
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);
            const submitBtn = loginForm.querySelector(".btn-login") as HTMLButtonElement;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Iniciando...";

                const response = await login({
                    email: data.email as string,
                    password: data.password as string,
                });

                if (rememberCheckbox?.checked) {
                    localStorage.setItem("rememberedEmail", data.email as string);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }

                localStorage.setItem("marketflex_token", response.accessToken);
                localStorage.setItem("marketflex_refresh_token", response.refreshToken);
                localStorage.setItem("marketflex_user", JSON.stringify(response.user));

                window.location.href = `/?login_success=true&user=${encodeURIComponent(response.user.nombre || "Usuario")}`;
            } catch (error: any) {
                console.error("❌ Login error:", error);
                let message = "Ocurrió un error al iniciar sesión";
                if (error.response) {
                    try {
                        const errorData = await error.response.json();
                        message = errorData.error || errorData.message || message;
                    } catch (e) { }
                }
                if (typeof (window as any).triggerSileo === 'function') {
                    (window as any).triggerSileo('error', message);
                }
                submitBtn.disabled = false;
                submitBtn.innerHTML = `Iniciar Sesión <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
            }
        });

        // Password Toggles
        document.querySelectorAll("[data-toggle-for]").forEach(btn => {
            btn.addEventListener("click", () => {
                const inputId = btn.getAttribute("data-toggle-for");
                if (inputId) {
                    const input = document.getElementById(inputId) as HTMLInputElement;
                    if (input) {
                        const isPw = input.type === "password";
                        input.type = isPw ? "text" : "password";
                        btn.classList.toggle("password-visible", isPw);
                    }
                }
            });
        });
    }

    // 3. Social Login Logic (Google)
    const googleAppScriptId = "google-gsi-client";
    if (!document.getElementById(googleAppScriptId)) {
        const script = document.createElement("script");
        script.id = googleAppScriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initializeGoogle();
        document.head.appendChild(script);
    } else {
        initializeGoogle();
    }

    // 4. Facebook Redirect Trigger (Manual)
    const fbBtn = document.getElementById("fb-login-btn");
    fbBtn?.addEventListener("click", () => {
        console.log("🔍 [Auth] Redirecting to Facebook OAuth Dialog...");
        const fbAppId = import.meta.env.PUBLIC_FACEBOOK_APP_ID || "2098383814330615";
        const fbRedirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
        const fbAuthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${fbRedirectUri}&scope=email,public_profile`;
        window.location.href = fbAuthUrl;
    });

    // Handle Manual Google Fallback
    const googleFallbackBtn = document.getElementById("google-login-btn");
    googleFallbackBtn?.addEventListener("click", () => {
        const google = (window as any).google;
        if (google?.accounts?.id) google.accounts.id.prompt();
    });
}
