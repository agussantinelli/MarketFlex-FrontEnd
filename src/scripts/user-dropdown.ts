let documentClickInitialized = false;

export function initUserDropdown(modalStyles?: Record<string, string>) {
    const userNameSpans = document.querySelectorAll(".user-name-display");
    const logoutBtns = document.querySelectorAll(".logout-trigger-btn");

    // Role based elements
    const adminLinks = document.querySelectorAll(".admin-only");
    const customerLinks = document.querySelectorAll(".customer-only");

    // Explicit Admin Navigation Buttons
    const goAdminBtns = document.querySelectorAll(".go-admin-btn");
    const goClientBtns = document.querySelectorAll(".go-client-btn");

    const clientPurchasesLinks = document.querySelectorAll(".client-purchases-link");

    // Dropdown interaction logic
    const dropdownBtns = document.querySelectorAll(".dropdown-trigger");
    const dropdownMenus = document.querySelectorAll(".dropdown-menu");

    if (dropdownBtns.length > 0 && dropdownMenus.length > 0) {
        dropdownBtns.forEach((btn, index) => {
            const menu = dropdownMenus[index];
            if (!menu) return;

            if (btn.hasAttribute("data-dropdown-init")) return;
            btn.setAttribute("data-dropdown-init", "true");

            // Toggle menu on click
            const toggleHandler = (e: Event) => {
                e.preventDefault();
                menu.classList.toggle("active");
                e.stopPropagation();
            };

            btn.addEventListener("click", toggleHandler);
        });

        // Close menu on click outside (Attach only once per document)
        if (!documentClickInitialized) {
            document.addEventListener("click", (e) => {
                const currentBtns = document.querySelectorAll(".dropdown-trigger");
                const currentMenus = document.querySelectorAll(".dropdown-menu");

                let clickedInside = false;
                currentBtns.forEach((btn, i) => {
                    const menu = currentMenus[i];
                    if (btn.contains(e.target as Node) || (menu && menu.contains(e.target as Node))) {
                        clickedInside = true;
                    }
                });

                if (!clickedInside) {
                    currentMenus.forEach(menu => menu.classList.remove("active"));
                }
            });
            documentClickInitialized = true;
        }
    }

    // Role state Check
    function updateAuthUI() {
        const userStr = localStorage.getItem("marketflex_user");
        const token = localStorage.getItem("marketflex_token");

        if (userStr && token) {
            const user = JSON.parse(userStr);
            if (userNameSpans.length > 0) {
                userNameSpans.forEach(span => {
                    span.textContent = user.nombre || "Usuario";
                });
            }

            // Role Based Visibility - Base State
            if (user.rol === "admin") {
                adminLinks.forEach((el) => ((el as HTMLElement).style.display = "flex"));
                customerLinks.forEach((el) => ((el as HTMLElement).style.display = "none"));
            } else {
                adminLinks.forEach((el) => ((el as HTMLElement).style.display = "none"));
                customerLinks.forEach((el) => ((el as HTMLElement).style.display = "flex"));
            }
        }

        // Admin Navigation Logic - strictly path-based (must run after Role based visibility)
        if (goAdminBtns.length > 0 || goClientBtns.length > 0) {
            const isAdminRoute = window.location.pathname.startsWith("/admin");

            if (isAdminRoute) {
                clientPurchasesLinks.forEach(link => (link as HTMLElement).style.display = 'none');
                goAdminBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
                goClientBtns.forEach(btn => {
                    (btn as HTMLElement).style.display = 'flex';
                    (btn as HTMLElement).style.setProperty('display', 'flex', 'important');
                });
            } else {
                clientPurchasesLinks.forEach(link => (link as HTMLElement).style.display = 'flex');
                goAdminBtns.forEach(btn => {
                    (btn as HTMLElement).style.display = 'flex';
                    (btn as HTMLElement).style.setProperty('display', 'flex', 'important');
                });
                goClientBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
            }
        }
    }

    updateAuthUI();

    // Navigation Click Handling
    if (goAdminBtns.length > 0 || goClientBtns.length > 0) {
        const navigateToAdmin = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            localStorage.setItem("marketflex_admin:isAdminMode", "true");
            setTimeout(() => { window.location.href = "/admin/dashboard"; }, 50);
        };

        const navigateToClient = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            localStorage.setItem("marketflex_admin:isAdminMode", "false");
            setTimeout(() => { window.location.href = "/"; }, 50);
        };

        goAdminBtns.forEach(btn => {
            if (btn.hasAttribute("data-nav-init")) return;
            btn.setAttribute("data-nav-init", "true");
            btn.addEventListener("click", navigateToAdmin);
        });

        goClientBtns.forEach(btn => {
            if (btn.hasAttribute("data-nav-init")) return;
            btn.setAttribute("data-nav-init", "true");
            btn.addEventListener("click", navigateToClient);
        });
    }

    // Connect logout button to local modal
    const logoutModal = document.getElementById('user-logout-modal');
    const cancelModalBtn = document.getElementById('user-logout-modal-cancel');

    // We get the confirm button inside the modal instead of redefining it with `cloneNode` hack
    const confirmModalBtn = document.getElementById('user-logout-modal-confirm');

    if (logoutBtns.length > 0 && logoutModal && modalStyles?.active) {
        logoutBtns.forEach(btn => {
            if (btn.hasAttribute("data-logout-init")) return;
            btn.setAttribute("data-logout-init", "true");

            btn.addEventListener("click", () => {
                logoutModal.classList.add(modalStyles.active as string);
                dropdownMenus.forEach(menu => menu.classList.remove("active"));
            });
        });

        // Initialize modal only once
        if (!logoutModal.hasAttribute("data-modal-init")) {
            logoutModal.setAttribute("data-modal-init", "true");

            cancelModalBtn?.addEventListener('click', () => {
                logoutModal.classList.remove(modalStyles.active as string);
            });

            logoutModal.addEventListener('click', (e) => {
                if (e.target === logoutModal) {
                    logoutModal.classList.remove(modalStyles.active as string);
                }
            });

            confirmModalBtn?.addEventListener("click", () => {
                localStorage.removeItem("marketflex_token");
                localStorage.removeItem("marketflex_refresh_token");
                localStorage.removeItem("marketflex_user");
                window.location.href = "/login";
            });
        }
    }
}
