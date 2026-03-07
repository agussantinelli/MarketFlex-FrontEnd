let documentClickInitialized = false;

export function initUserDropdown(modalStyles?: Record<string, string>) {
    const userNameSpans = document.querySelectorAll(".user-name-display");
    const logoutBtns = document.querySelectorAll(".logout-trigger-btn");

    // Role based elements
    const managementLinks = document.querySelectorAll(".management-only");
    const customerLinks = document.querySelectorAll(".customer-only");

    // Explicit Management Navigation Buttons & Dividers
    const goManagementBtns = document.querySelectorAll(".go-management-btn");
    const goClientBtns = document.querySelectorAll(".go-client-btn");
    const managementDividers = document.querySelectorAll(".management-only-divider");

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
                managementLinks.forEach((el) => ((el as HTMLElement).style.display = "flex"));
                customerLinks.forEach((el) => ((el as HTMLElement).style.display = "none"));
            } else if (user.rol === "seller") {
                managementLinks.forEach((el) => ((el as HTMLElement).style.display = "none"));
                customerLinks.forEach((el) => ((el as HTMLElement).style.display = "flex")); // Let sellers see their purchases too
            } else {
                managementLinks.forEach((el) => ((el as HTMLElement).style.display = "none"));
                customerLinks.forEach((el) => ((el as HTMLElement).style.display = "flex"));
            }
        }

        // Management Navigation Logic - strictly path-based (must run after Role based visibility)
        if (goManagementBtns.length > 0 || goClientBtns.length > 0) {
            const userStr = localStorage.getItem("marketflex_user");
            const user = userStr ? JSON.parse(userStr) : null;
            const isAdmin = user && user.rol === "admin";
            const isSeller = user && user.rol === "seller";

            if (isAdmin || isSeller) {
                const basePath = "/management";
                const isPanelRoute = window.location.pathname.startsWith(basePath);

                if (isPanelRoute) {
                    clientPurchasesLinks.forEach(link => (link as HTMLElement).style.display = 'none');
                    managementDividers.forEach(div => (div as HTMLElement).style.display = 'flex');
                    goManagementBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
                    goClientBtns.forEach(btn => {
                        (btn as HTMLElement).style.display = 'flex';
                        (btn as HTMLElement).style.setProperty('display', 'flex', 'important');
                    });
                } else {
                    clientPurchasesLinks.forEach(link => (link as HTMLElement).style.display = 'flex');
                    managementDividers.forEach(div => (div as HTMLElement).style.display = 'flex');
                    goManagementBtns.forEach(btn => {
                        (btn as HTMLElement).style.display = 'flex';
                        (btn as HTMLElement).style.setProperty('display', 'flex', 'important');
                        const label = btn.querySelector('.btn-label');
                        if (label) label.textContent = isAdmin ? 'Panel Gestión' : 'Panel Vendedor';
                    });
                    goClientBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
                }
            } else {
                // Not admin nor seller, ensure neither button nor divider is shown
                managementDividers.forEach(div => (div as HTMLElement).style.display = 'none');
                goManagementBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
                goClientBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
            }
        }
    }

    updateAuthUI();

    // Navigation Click Handling
    if (goManagementBtns.length > 0 || goClientBtns.length > 0) {
        const navigateToManagement = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            const path = "/management/dashboard";

            localStorage.setItem("marketflex_management:isManagementMode", "true");
            setTimeout(() => { window.location.href = path; }, 50);
        };

        const navigateToClient = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            localStorage.setItem("marketflex_management:isManagementMode", "false");
            setTimeout(() => { window.location.href = "/"; }, 50);
        };

        goManagementBtns.forEach(btn => {
            if (btn.hasAttribute("data-nav-init")) return;
            btn.setAttribute("data-nav-init", "true");
            btn.addEventListener("click", navigateToManagement);
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

