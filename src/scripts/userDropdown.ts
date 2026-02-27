export function initUserDropdown(modalStyles?: Record<string, string>) {
    const userNameSpans = document.querySelectorAll(".user-name-display");
    const logoutBtns = document.querySelectorAll(".logout-trigger-btn");

    // Role based elements
    const adminLinks = document.querySelectorAll(".admin-only");
    const customerLinks = document.querySelectorAll(".customer-only");
    const adminModeToggles = document.querySelectorAll(".admin-mode-toggle");
    const adminModeTexts = document.querySelectorAll(".admin-mode-text");
    const clientPurchasesLinks = document.querySelectorAll(".client-purchases-link");

    // Dropdown interaction logic
    const dropdownBtns = document.querySelectorAll(".dropdown-trigger");
    const dropdownMenus = document.querySelectorAll(".dropdown-menu");

    if (dropdownBtns.length > 0 && dropdownMenus.length > 0) {
        dropdownBtns.forEach((btn, index) => {
            const menu = dropdownMenus[index];
            if (!menu) return;

            // Toggle menu on click
            const toggleHandler = (e: Event) => {
                e.preventDefault();
                menu.classList.toggle("active");
                e.stopPropagation();
            };

            // Re-auth safe listener
            btn.removeEventListener("click", toggleHandler);
            btn.addEventListener("click", toggleHandler);

            // Close menu on click outside
            document.addEventListener("click", (e) => {
                if (!btn.contains(e.target as Node) && !menu.contains(e.target as Node)) {
                    menu.classList.remove("active");
                }
            });
        });
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

            // Role Based Visibility
            if (user.rol === "admin") {
                adminLinks.forEach((el) => ((el as HTMLElement).style.display = "flex"));
                customerLinks.forEach((el) => ((el as HTMLElement).style.display = "none"));
            } else {
                adminLinks.forEach((el) => ((el as HTMLElement).style.display = "none"));
                customerLinks.forEach((el) => ((el as HTMLElement).style.display = "flex"));
            }
        }
    }

    updateAuthUI();

    // Admin Toggle Mode State Handling
    if (adminModeToggles.length > 0 && adminModeTexts.length > 0) {
        import("../store/adminStore").then(({ adminStore, toggleAdminMode }) => {
            // Subscribe to store changes
            adminStore.subscribe((state) => {
                const isAdminMode = state.isAdminMode === 'true';

                if (isAdminMode) {
                    adminModeTexts.forEach(text => text.textContent = "Cambiar a Tienda");
                    clientPurchasesLinks.forEach(link => (link as HTMLElement).style.display = 'none');
                } else {
                    adminModeTexts.forEach(text => text.textContent = "Cambiar a Admin");
                    clientPurchasesLinks.forEach(link => (link as HTMLElement).style.display = 'flex');
                }
            });

            // Toggle Click Handling
            adminModeToggles.forEach(toggle => {
                // Remove older listeners if we are re-initializing over astro:page-load
                toggle.replaceWith(toggle.cloneNode(true));
            });

            // Re-select after replacement
            const newToggles = document.querySelectorAll(".admin-mode-toggle");
            newToggles.forEach(toggle => {
                toggle.addEventListener("click", (e) => {
                    e.preventDefault();
                    const isCurrentlyAdmin = adminStore.get().isAdminMode === 'true';
                    toggleAdminMode();

                    setTimeout(() => {
                        window.location.href = !isCurrentlyAdmin ? "/admin/dashboard" : "/";
                    }, 50);
                });
            });
        });
    }

    // Connect logout button to local modal
    const logoutModal = document.getElementById('user-logout-modal');
    const cancelModalBtn = document.getElementById('user-logout-modal-cancel');
    if (logoutBtns.length > 0 && logoutModal && modalStyles?.active) {
        logoutBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                logoutModal.classList.add(modalStyles.active as string);
                dropdownMenus.forEach(menu => menu.classList.remove("active"));
            });
        });

        cancelModalBtn?.addEventListener('click', () => {
            logoutModal.classList.remove(modalStyles.active as string);
        });

        // Ensure we only attach once to the modal
        const newModal = logoutModal.cloneNode(true);
        logoutModal.parentNode?.replaceChild(newModal, logoutModal);

        const finalModal = document.getElementById('user-logout-modal');
        const finalCancelBtn = document.getElementById('user-logout-modal-cancel');
        const finalConfirmBtn = document.getElementById('user-logout-modal-confirm');

        finalCancelBtn?.addEventListener('click', () => {
            finalModal?.classList.remove(modalStyles.active as string);
        });

        finalModal?.addEventListener('click', (e) => {
            if (e.target === finalModal) {
                finalModal.classList.remove(modalStyles.active as string);
            }
        });

        finalConfirmBtn?.addEventListener("click", () => {
            localStorage.removeItem("marketflex_token");
            localStorage.removeItem("marketflex_refresh_token");
            localStorage.removeItem("marketflex_user");
            window.location.href = "/login";
        });
    }
}
