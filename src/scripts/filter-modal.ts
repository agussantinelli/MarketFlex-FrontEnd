import type { Category } from "../types/category.types";
import type { Subcategory } from "../types/subcategory.types";

document.addEventListener('astro:page-load', () => {
    const backdrop = document.getElementById("filter-modal-backdrop");
    if (!backdrop) return;

    const categories: Category[] = JSON.parse(backdrop.getAttribute("data-categories") || "[]");
    const subcategories: Subcategory[] = JSON.parse(backdrop.getAttribute("data-subcategories") || "[]");
    const styles = JSON.parse(backdrop.getAttribute("data-styles") || "{}");

    const closeBtn = document.getElementById("close-modal-btn");
    const filterBtn = document.getElementById("filter-btn");
    const applyBtn = document.getElementById("apply-filters-btn");
    const resetBtn = document.getElementById("reset-filters-btn");
    const subcategorySection = document.getElementById("subcategory-section");
    const subcategoryOptions = document.getElementById("subcategory-options");

    let selectedType = backdrop.getAttribute("data-initial-type") || "";
    let selectedCategory = backdrop.getAttribute("data-initial-category") || "";

    // Initialize selected states from URL or props
    const urlParams = new URLSearchParams(window.location.search);
    selectedType = urlParams.get("type") || "";
    selectedCategory = urlParams.get("category") || "";

    // Populate price inputs
    const minPriceInput = document.getElementById("min-price") as HTMLInputElement;
    const maxPriceInput = document.getElementById("max-price") as HTMLInputElement;
    const stockCheckbox = document.getElementById("with-stock-checkbox") as HTMLInputElement;
    const onlyOffersCheckbox = document.getElementById("only-offers-checkbox") as HTMLInputElement;

    if (minPriceInput) minPriceInput.value = urlParams.get("minPrice") || "";
    if (maxPriceInput) maxPriceInput.value = urlParams.get("maxPrice") || "";

    // Default to checked if not explicitly 'false'
    if (stockCheckbox) {
        stockCheckbox.checked = urlParams.get("withStock") !== "false";
    }

    // Default to unchecked
    if (onlyOffersCheckbox) {
        onlyOffersCheckbox.checked = urlParams.get("onlyOffers") === "true";
    }

    function toggleModal() {
        backdrop?.classList.toggle(styles.active);
    }

    if (filterBtn) filterBtn.addEventListener("click", toggleModal);
    if (closeBtn) closeBtn.addEventListener("click", toggleModal);
    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) toggleModal();
    });

    // Category selection
    document
        .querySelectorAll(`.${styles.optionBtn}[data-type]`)
        .forEach((btn) => {
            btn.addEventListener("click", () => {
                const type = btn.getAttribute("data-type");
                const catId = btn.getAttribute("data-category-id");

                // Toggle selection
                if (selectedType === type) {
                    selectedType = "";
                    btn.classList.remove(styles.optionActive);
                } else {
                    // Clear others
                    document
                        .querySelectorAll(`.${styles.optionBtn}[data-type]`)
                        .forEach((b) =>
                            b.classList.remove(styles.optionActive),
                        );
                    selectedType = type || "";
                    btn.classList.add(styles.optionActive);
                }

                selectedCategory = ""; // Reset subcategory when type changes
                updateSubcategories(catId || "");
            });
        });

    function updateSubcategories(catId: string) {
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
                .map(
                    (sub) => `
                <button 
                    class="${styles.optionBtn} ${selectedCategory === sub.nombre ? styles.optionActive : ""}"
                    data-category="${sub.nombre}"
                >
                    ${sub.nombre}
                </button>
            `,
                )
                .join("");

            // Add events to new buttons
            subcategoryOptions
                .querySelectorAll(`.${styles.optionBtn}`)
                .forEach((btn) => {
                    btn.addEventListener("click", () => {
                        const subName = btn.getAttribute("data-category");
                        if (selectedCategory === subName) {
                            selectedCategory = "";
                            btn.classList.remove(styles.optionActive);
                        } else {
                            subcategoryOptions
                                ?.querySelectorAll(`.${styles.optionBtn}`)
                                .forEach((b) =>
                                    b.classList.remove(styles.optionActive),
                                );
                            selectedCategory = subName || "";
                            btn.classList.add(styles.optionActive);
                        }
                    });
                });
        } else {
            subcategorySection.classList.add(styles.hidden);
        }
    }

    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const minPrice = (document.getElementById("min-price") as HTMLInputElement).value;
            const maxPrice = (document.getElementById("max-price") as HTMLInputElement).value;

            const params = new URLSearchParams(window.location.search);

            if (selectedType) params.set("type", selectedType);
            else params.delete("type");

            if (selectedCategory) params.set("category", selectedCategory);
            else params.delete("category");

            if (minPrice) params.set("minPrice", minPrice);
            else params.delete("minPrice");

            if (maxPrice) params.set("maxPrice", maxPrice);
            else params.delete("maxPrice");

            if (stockCheckbox && !stockCheckbox.checked) {
                params.set("withStock", "false");
            } else {
                params.delete("withStock");
            }

            if (onlyOffersCheckbox && onlyOffersCheckbox.checked) {
                params.set("onlyOffers", "true");
            } else {
                params.delete("onlyOffers");
            }

            // Always reset to page 1 when filtering
            params.set("page", "1");

            window.location.href = `${window.location.pathname}?${params.toString()}`;
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            const params = new URLSearchParams(window.location.search);
            params.delete("type");
            params.delete("category");
            params.delete("minPrice");
            params.delete("maxPrice");
            params.delete("withStock");
            params.delete("onlyOffers");
            params.set("page", "1");
            window.location.href = `${window.location.pathname}?${params.toString()}`;
        });
    }
});
