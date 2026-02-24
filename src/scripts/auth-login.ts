import {
    login,
    loginWithGoogle,
    loginWithFacebook,
} from "../services/auth.service";



export function initLogin() {
    console.log("🔍 [Auth] initLogin() started");

    // Origin & Session Diagnostics
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('marketflex_token');
        const refreshToken = localStorage.getItem('marketflex_refresh_token');
        console.log("🔍 [Auth] Diagnostic Report:", {
            origin: window.location.origin,
            pathname: window.location.pathname,
            hasToken: !!token,
            hasRefreshToken: !!refreshToken,
            userStored: !!localStorage.getItem('marketflex_user')
        });
    }

    const loginForm = document.querySelector(".login-form") as HTMLFormElement;
    if (!loginForm) {
        console.log("🔍 [Auth] No login form found on this page");
        return;
    }

    // Check if this specific form element has already been initialized
    if (loginForm.getAttribute("data-auth-initialized") === "true") {
        console.log("🔍 [Auth] Form already initialized, skipping listeners");
        return;
    }
    loginForm.setAttribute("data-auth-initialized", "true");
    console.log("🔍 [Auth] Attaching listeners to login form");

    const emailInput = document.getElementById("email") as HTMLInputElement;
    const rememberCheckbox = document.querySelector(
        "input[name='remember']",
    ) as HTMLInputElement;

    if (!emailInput || !rememberCheckbox) return;

    // Password Visibility Toggle
    document.querySelectorAll("[data-toggle-for]").forEach(btn => {
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
        console.log("🔍 [Auth] Google Callback Recibido!", {
            hasCredential: !!credentialResponse.credential,
            tokenStart: credentialResponse.credential ? credentialResponse.credential.substring(0, 10) + "..." : "null"
        });
        try {
            console.log("🔍 [Auth] Llamando a loginWithGoogle en el backend...");
            const result = await loginWithGoogle(credentialResponse.credential);

            console.log("🔍 [Auth] Login exitoso en backend:", {
                user: result.user?.email,
                accessToken: result.accessToken ? "Presente" : "Missing",
                refreshToken: result.refreshToken ? "Presente" : "Missing"
            });

            localStorage.setItem("marketflex_token", result.accessToken);
            localStorage.setItem("marketflex_refresh_token", result.refreshToken);
            localStorage.setItem("marketflex_user", JSON.stringify(result.user));

            console.log("🔍 [Auth] Todo guardado en localStorage. Redirigiendo...");

            const userName = result.user.nombre || "Usuario";
            const newParam = result.isNewUser ? "&new=true" : "";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}${newParam}`;
        } catch (error: any) {
            console.error("❌ [Auth] Google login error:", error);

            let message = "Error en el inicio de sesión con Google";
            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    console.error("❌ [Auth] Error data from backend:", errorData);
                    message = errorData.error || errorData.message || message;
                } catch (e) {
                    message = `Error ${error.response.status}: ${error.response.statusText}`;
                }
            }

            if (typeof (window as any).triggerSileo === 'function') {
                (window as any).triggerSileo('error', message);
            }
        }
    };

    (window as any).handleGoogleCredentialResponse = handleGoogleLogin;

    const initializeGoogle = () => {
        if ((window as any).isGoogleInitialized) {
            console.log("🔍 [Auth] Google SDK already initialized, skipping");
            return;
        }
        const google = (window as any).google;
        if (google?.accounts?.id) {
            const client_id = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
            console.log("🔍 [Auth] Initializing Google SDK and rendering Standard Button");

            google.accounts.id.initialize({
                client_id: client_id,
                callback: handleGoogleLogin,
                auto_select: false,
                use_fedcm_for_prompt: false,
            });

            const btnContainer = document.getElementById("google-signin-button");
            if (btnContainer) {
                console.log("🔍 [Auth] Rendering official Google button into container");
                google.accounts.id.renderButton(btnContainer, {
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    shape: "rectangular",
                    width: btnContainer.offsetWidth || 350
                });
            } else {
                console.warn("⚠️ [Auth] Container #google-signin-button NOT FOUND, showing fallback button");
                const manualBtn = document.getElementById("google-login-btn");
                if (manualBtn) manualBtn.style.display = "flex";
            }

            (window as any).isGoogleInitialized = true;
        }
    };

    if ((window as any).google) {
        initializeGoogle();
    }

    // Manual button fallback (just in case)
    const googleBtn = document.getElementById("google-login-btn");
    googleBtn?.addEventListener("click", () => {
        console.log("🔍 [Auth] Manual Google button clicked (Fallback)");
        const google = (window as any).google;
        if (google?.accounts?.id) {
            google.accounts.id.prompt();
        }
    });

    // Facebook Login Initialization
    const fbAppId = import.meta.env.PUBLIC_FACEBOOK_APP_ID;
    const initFB = () => {
        const FB = (window as any).FB;
        if (FB) {
            console.log("🔍 [Auth] Initializing Facebook SDK with AppID (Unified):", fbAppId);
            try {
                FB.init({
                    appId: fbAppId,
                    cookie: true,
                    xfbml: true,
                    version: "v21.0",
                });
                console.log("🔍 [Auth] FB.init() successful with XFBML enabled");

                // Subscribe to auth events for the Official Button
                FB.Event.subscribe('auth.statusChange', (response: any) => {
                    console.log("🔍 [Auth] FB Official Button Status Change:", response.status);
                    if (response.status === 'connected' && response.authResponse) {
                        handleFacebookBackendLogin(response.authResponse.accessToken);
                    }
                });

                FB.XFBML.parse();
            } catch (e) {
                console.error("❌ [Auth] Error in FB.init():", e);
            }
        }
    };

    // Helper for FB backend login (Common logic)
    const handleFacebookBackendLogin = async (accessToken: string) => {
        console.log("🔍 [Auth] Processing FB token on backend...");
        try {
            const result = await loginWithFacebook(accessToken);
            console.log("🔍 [Auth] FB backend success:", {
                success: !!result.accessToken,
                user: result.user?.email
            });
            localStorage.setItem("marketflex_token", result.accessToken);
            localStorage.setItem("marketflex_refresh_token", result.refreshToken);
            localStorage.setItem("marketflex_user", JSON.stringify(result.user));

            const userName = result.user.nombre || "Usuario";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}`;
        } catch (error) {
            console.error("❌ [Auth] Facebook backend login error:", error);
            if (typeof (window as any).triggerSileo === 'function') {
                (window as any).triggerSileo('error', "Error al procesar login con Facebook");
            }
        }
    };

    // Unified SDK Loading (Strict Isolation)
    const loadSocialSDKs = () => {
        // Google GSI
        if (!document.getElementById("google-gsi-client")) {
            console.log("🔍 [Auth] Injecting Google GSI SDK script...");
            const script = document.createElement("script");
            script.id = "google-gsi-client";
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log("🔍 [Auth] Google SDK script loaded successfully");
                initializeGoogle();
            };
            document.head.appendChild(script);
        } else {
            initializeGoogle();
        }

        // Facebook SDK (Ultra-defensive asynchronous loading)
        const fbScriptId = "facebook-jssdk";
        if (!document.getElementById(fbScriptId) && !(window as any).isFacebookScriptInjected) {
            console.log("🔍 [Auth] Injecting Facebook SDK (Strict pattern)...");
            (window as any).fbAsyncInit = initFB;
            (window as any).isFacebookScriptInjected = true;

            const fjs = document.getElementsByTagName("script")[0];
            const js = document.createElement("script") as HTMLScriptElement;
            js.id = fbScriptId;
            js.src = "https://connect.facebook.net/es_LA/sdk.js";
            js.async = true;
            js.defer = true;
            js.crossOrigin = "anonymous";
            js.onload = () => console.log("🔍 [Auth] Facebook SDK script loaded successfully");

            if (fjs && fjs.parentNode) {
                fjs.parentNode.insertBefore(js, fjs);
            } else {
                document.head.appendChild(js);
            }
        } else {
            console.log("🔍 [Auth] Facebook SDK already injected, re-initializing...");
            initFB();
        }

        // --- GLOBAL FALLBACK TIMER ---
        // Si después de 2.5s no hay nada renderizado, forzamos el botón manual (incluso si el SDK falló)
        setTimeout(() => {
            const placeholders = document.querySelectorAll('.fb-login-button');
            let anyRendered = false;

            placeholders.forEach((p) => {
                const hasRendered = p.querySelector('iframe') || p.querySelector('span') || p.children.length > 0;
                if (hasRendered) anyRendered = true;
            });

            if (!anyRendered) {
                console.warn("⚠️ [Auth] FB Plugin failed to render after 3s, showing fallback button");
                const manualBtn = document.getElementById("fb-login-btn");
                const officialContainer = document.getElementById("fb-button-container");
                if (manualBtn) manualBtn.style.display = "flex";
                if (officialContainer) officialContainer.style.display = "none";
            } else {
                console.log("🔍 [Auth] FB Plugin rendered successfully");
            }
        }, 3000);
    };

    loadSocialSDKs();

    const fbBtn = document.getElementById("fb-login-btn");
    fbBtn?.addEventListener("click", () => {
        console.log("🔍 [Auth] Manual Facebook button clicked (Fallback)");
        const FB = (window as any).FB;
        if (FB) {
            FB.login((response: any) => {
                if (response.authResponse) {
                    handleFacebookBackendLogin(response.authResponse.accessToken);
                }
            }, { scope: "email,public_profile" });
        } else {
            console.error("❌ [Auth] Facebook SDK blocked or not loaded");
            if (typeof (window as any).triggerSileo === 'function') {
                (window as any).triggerSileo('error', "El inicio de sesión con Facebook parece estar bloqueado por tu navegador. Desactiva Adblock o intenta con otro navegador.");
            }
        }
    });
}
