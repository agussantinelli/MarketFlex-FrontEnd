export function initNavbar() {
    // Mobile Menu Logic
    const mobileBtn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            mobileBtn.classList.toggle("active");
        });
    }

    // Hierarchical Subcategory Logic
    const subcatToggles = document.querySelectorAll(".subcat-toggle");

    subcatToggles.forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const categoryItem = toggle.closest(".category-item");
            const menu = categoryItem?.querySelector(".subcategory-menu");

            if (menu) {
                const isActive = menu.classList.contains("active");

                // Close others in same parent
                const parent = categoryItem?.parentElement;
                parent?.querySelectorAll(".subcategory-menu.active").forEach((m: any) => m.classList.remove("active"));
                parent?.querySelectorAll(".subcat-toggle.active").forEach((t: any) => t.classList.remove("active"));

                if (!isActive) {
                    menu.classList.add("active");
                    toggle.classList.add("active");
                }
            }
        });
    });

    // Generic Dropdown Logic (User & Nav Items)
    const dropdowns = document.querySelectorAll(
        ".nav-item-dropdown, .user-dropdown",
    );

    // Close nested menus when clicking outside main dropdown
    document.addEventListener("click", (e) => {
        let isDropdownClick = false;

        dropdowns.forEach((dropdown: any) => {
            const btn = dropdown.querySelector(
                ".dropdown-btn, .dropdown-trigger",
            );
            const menu = dropdown.querySelector(
                ".nav-dropdown-menu, .dropdown-menu",
            );

            if (btn && menu) {
                if (btn.contains(e.target as Node)) {
                    isDropdownClick = true;
                    // Close others
                    dropdowns.forEach((d: any) => {
                        if (d !== dropdown) {
                            d.querySelector(
                                ".nav-dropdown-menu, .dropdown-menu",
                            )?.classList.remove("active");
                            // Also close nested
                            d.querySelectorAll(".subcategory-menu.active").forEach((m: any) => m.classList.remove("active"));
                            d.querySelectorAll(".subcat-toggle.active").forEach((t: any) => t.classList.remove("active"));
                        }
                    });
                    menu.classList.toggle("active");

                    // If closing main menu, close nested too
                    if (!menu.classList.contains("active")) {
                        menu.querySelectorAll(".subcategory-menu.active").forEach((m: any) => m.classList.remove("active"));
                        menu.querySelectorAll(".subcat-toggle.active").forEach((t: any) => t.classList.remove("active"));
                    }

                    e.stopPropagation();
                } else if (menu.contains(e.target as Node)) {
                    isDropdownClick = true;
                }
            }
        });

        if (!isDropdownClick) {
            document
                .querySelectorAll(
                    ".nav-dropdown-menu.active, .dropdown-menu.active",
                )
                .forEach((menu: any) => {
                    menu.classList.remove("active");
                    menu.querySelectorAll(".subcategory-menu.active").forEach((m: any) => m.classList.remove("active"));
                    menu.querySelectorAll(".subcat-toggle.active").forEach((t: any) => t.classList.remove("active"));
                });
        }
    });

    // Auth Logic
    const authGuest = document.querySelector(".nav-auth-guest") as HTMLElement;
    const authUser = document.querySelector(".nav-auth-user") as HTMLElement;
    const userNameSpan = document.getElementById("user-name");
    const logoutBtn = document.getElementById("logout-btn");
    const adminLinks = document.querySelectorAll(".admin-only");
    const customerLinks = document.querySelectorAll(".customer-only");

    function updateAuthUI() {
        const userStr = localStorage.getItem("marketflex_user");
        const token = localStorage.getItem("marketflex_token");

        if (userStr && token) {
            const user = JSON.parse(userStr);
            if (userNameSpan)
                userNameSpan.textContent = user.nombre || "Usuario";

            // Role Based Visibility
            if (user.rol === "admin") {
                adminLinks.forEach(
                    (el) => ((el as HTMLElement).style.display = "flex"),
                );
                customerLinks.forEach(
                    (el) => ((el as HTMLElement).style.display = "none"),
                );
            } else {
                adminLinks.forEach(
                    (el) => ((el as HTMLElement).style.display = "none"),
                );
                customerLinks.forEach(
                    (el) => ((el as HTMLElement).style.display = "flex"),
                );
            }

            if (authGuest) authGuest.style.display = "none";
            if (authUser) authUser.style.display = "flex";
        } else {
            if (authGuest) authGuest.style.display = "block";
            if (authUser) authUser.style.display = "none";
        }
    }

    // Initial check
    updateAuthUI();

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("marketflex_token");
            localStorage.removeItem("marketflex_refresh_token");
            localStorage.removeItem("marketflex_user");
            window.location.href = "/login";
        });
    }

    // Search Logic (Validation & Clear)
    const searchForm = document.querySelector(
        ".nav-search-form",
    ) as HTMLFormElement;
    const searchInput = document.querySelector(
        ".search-input",
    ) as HTMLInputElement;
    const searchClearBtn = document.querySelector(
        ".search-clear-btn",
    ) as HTMLButtonElement;

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            if (searchInput) {
                const query = searchInput.value.trim();
                if (query.length < 2) {
                    e.preventDefault();
                    let handled = false;
                    if ((window as any).triggerSileo) {
                        handled = (window as any).triggerSileo(
                            "error",
                            "Ingresa al menos 2 caracteres para buscar.",
                        );
                    }

                    if (!handled) {
                        console.warn("Sileo fallback triggered");
                        alert("Ingresa al menos 2 caracteres para buscar.");
                    }
                }
            }
        });
    }

    if (searchInput && searchClearBtn) {
        const updateClearBtn = () => {
            if (searchInput.value.length > 0) {
                searchClearBtn.classList.add("visible");
            } else {
                searchClearBtn.classList.remove("visible");
            }
        };

        searchInput.addEventListener("input", updateClearBtn);

        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get("q");
        if (q) {
            searchInput.value = q;
            updateClearBtn();
        }

        searchClearBtn.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.focus();
            updateClearBtn();
        });
    }
}
