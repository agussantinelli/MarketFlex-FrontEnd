import type { Category } from "../types/category.types";
import type { Subcategory } from "../types/subcategory.types";

const initFilterModal = () => {
    const backdrop = document.getElementById("filter-modal-backdrop");
    const filterBtn = document.getElementById("filter-btn");

    if (!backdrop || !filterBtn) return;

    // Recuperar datos y el mapeo de clases de CSS Modules
    const categories: Category[] = JSON.parse(backdrop.getAttribute("data-categories") || "[]");
    const subcategories: Subcategory[] = JSON.parse(backdrop.getAttribute("data-subcategories") || "[]");
    const styles = JSON.parse(backdrop.getAttribute("data-styles") || "{}");

    // Elementos del DOM
    const closeBtn = document.getElementById("close-modal-btn");
    const applyBtn = document.getElementById("apply-filters-btn");
    const resetBtn = document.getElementById("reset-filters-btn");
    const subcategorySection = document.getElementById("subcategory-section");
    const subcategoryOptions = document.getElementById("subcategory-options");
    const minPriceInput = document.getElementById("min-price") as HTMLInputElement;
    const maxPriceInput = document.getElementById("max-price") as HTMLInputElement;
    const stockCheckbox = document.getElementById("with-stock-checkbox") as HTMLInputElement;
    const onlyOffersCheckbox = document.getElementById("only-offers-checkbox") as HTMLInputElement;

    // Estado inicial desde URL
    const urlParams = new URLSearchParams(window.location.search);
    let selectedType = urlParams.get("type") || "";
    let selectedCategory = urlParams.get("category") || "";

    // Sincronizar UI con URL
    if (minPriceInput) minPriceInput.value = urlParams.get("minPrice") || "";
    if (maxPriceInput) maxPriceInput.value = urlParams.get("maxPrice") || "";
    if (stockCheckbox) stockCheckbox.checked = urlParams.get("withStock") !== "false";
    if (onlyOffersCheckbox) onlyOffersCheckbox.checked = urlParams.get("onlyOffers") === "true";

    // --- ACCIONES ---

    const openModal = () => {
        backdrop.classList.add(styles.active);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        backdrop.classList.remove(styles.active);
        document.body.style.overflow = "";
    };

    const updateSubcategories = (catId: string) => {
        if (!subcategorySection || !subcategoryOptions) return;

        if (!selectedType || !catId) {
            subcategorySection.classList.add(styles.hidden);
            subcategoryOptions.innerHTML = "";
            return;
        }

        const filtered = subcategories.filter((s) => s.categoriaId === catId);

        if (filtered.length > 0) {
            subcategorySection.classList.remove(styles.hidden);
            subcategoryOptions.innerHTML = filtered
                .map(sub => `
                    <button 
                        class="${styles.optionBtn} ${selectedCategory === sub.nombre ? styles.optionActive : ""}"
                        data-category="${sub.nombre}"
                    >
                        ${sub.nombre}
                    </button>
                `).join("");

            // Re-vincular eventos a botones inyectados
            subcategoryOptions.querySelectorAll(`.${styles.optionBtn}`).forEach((btn) => {
                btn.addEventListener("click", () => {
                    const subName = btn.getAttribute("data-category");
                    if (selectedCategory === subName) {
                        selectedCategory = "";
                        btn.classList.remove(styles.optionActive);
                    } else {
                        subcategoryOptions.querySelectorAll(`.${styles.optionBtn}`).forEach(b =>
                            b.classList.remove(styles.optionActive)
                        );
                        selectedCategory = subName || "";
                        btn.classList.add(styles.optionActive);
                    }
                });
            });
        } else {
            subcategorySection.classList.add(styles.hidden);
        }
    };

    // --- LISTENERS ---

    filterBtn.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal();
    });

    // Categorías principales
    document.querySelectorAll(`.${styles.optionBtn}[data-type]`).forEach((btn) => {
        btn.addEventListener("click", () => {
            const type = btn.getAttribute("data-type");
            const catId = btn.getAttribute("data-category-id");

            if (selectedType === type) {
                selectedType = "";
                btn.classList.remove(styles.optionActive);
            } else {
                document.querySelectorAll(`.${styles.optionBtn}[data-type]`).forEach(b =>
                    b.classList.remove(styles.optionActive)
                );
                selectedType = type || "";
                btn.classList.add(styles.optionActive);
            }
            selectedCategory = "";
            updateSubcategories(catId || "");
        });
    });

    applyBtn?.addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        const fixedKeysAttr = backdrop.getAttribute("data-fixed-keys");
        const fixedKeys: string[] = JSON.parse(fixedKeysAttr || "[]");

        // Only update type/category if they are not fixed
        if (!fixedKeys.includes("type")) {
            selectedType ? params.set("type", selectedType) : params.delete("type");
        }
        if (!fixedKeys.includes("category")) {
            selectedCategory ? params.set("category", selectedCategory) : params.delete("category");
        }

        minPriceInput?.value ? params.set("minPrice", minPriceInput.value) : params.delete("minPrice");
        maxPriceInput?.value ? params.set("maxPrice", maxPriceInput.value) : params.delete("maxPrice");

        if (stockCheckbox) params.set("withStock", stockCheckbox.checked ? "true" : "false");
        if (onlyOffersCheckbox) params.set("onlyOffers", onlyOffersCheckbox.checked ? "true" : "false");

        params.set("page", "1");
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    });

    resetBtn?.addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        const fixedKeysAttr = backdrop.getAttribute("data-fixed-keys");
        const fixedKeys: string[] = JSON.parse(fixedKeysAttr || "[]");

        // Remove query parameters that are NOT in fixedKeys and keep 'q' (search)
        const keysToRemove: string[] = [];
        params.forEach((_, key) => {
            if (!fixedKeys.includes(key) && key !== 'q') {
                keysToRemove.push(key);
            }
        });

        keysToRemove.forEach(key => params.delete(key));
        params.set("page", "1");

        window.location.href = `${window.location.pathname}?${params.toString()}`;
    });

    // Carga inicial de subcategorías si ya hay filtros
    if (selectedType) {
        const activeBtn = document.querySelector(`.${styles.optionActive}[data-category-id]`);
        if (activeBtn) updateSubcategories(activeBtn.getAttribute("data-category-id") || "");
    }
};

// Ejecución para Astro (View Transitions + Carga normal)
document.addEventListener('astro:page-load', initFilterModal);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initFilterModal();
}