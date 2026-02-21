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
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));

            const userName = response.user.nombre || "Usuario";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}`;
        } catch (error) {
            console.error("Login error:", error);
            window.location.href = "/login?error=true";
            submitBtn.disabled = false;
        }
    });

    // Google Sign-In
    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const result = await loginWithGoogle(credentialResponse.credential);

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            const userName = result.user.nombre || "Usuario";
            const newParam = result.isNewUser ? "&new=true" : "";
            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}${newParam}`;
        } catch (error) {
            console.error("Google login error:", error);
            window.location.href = "/login?error=true";
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
                if (d.getElementById(id)) return;
                const js = d.createElement(s) as HTMLScriptElement;
                js.id = id;
                js.src = "https://connect.facebook.net/es_LA/sdk.js";
                fjs.parentNode?.insertBefore(js, fjs);
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
                            localStorage.setItem("token", result.token);
                            localStorage.setItem(
                                "user",
                                JSON.stringify(result.user),
                            );

                            const userName = result.user.nombre || "Usuario";
                            const newParam = result.isNewUser
                                ? "&new=true"
                                : "";
                            window.location.href = `/?login_success=true&user=${encodeURIComponent(userName)}${newParam}`;
                        })
                        .catch((error) => {
                            console.error("Facebook login error:", error);
                            window.location.href = "/login?error=true";
                        });
                }
            },
            { scope: "email,public_profile" },
        );
    });
}
