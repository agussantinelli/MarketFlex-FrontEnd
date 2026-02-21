export function initSearchFilters() {
    // Filter modal logic
    const filterBtn = document.getElementById("filter-btn");
    const modal = document.getElementById("filter-modal");
    const closeBtn = document.getElementById("close-modal");
    const closeBtnAction = document.getElementById("close-modal-btn");

    if (filterBtn && modal && closeBtn && closeBtnAction) {
        filterBtn.addEventListener("click", () => {
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        });

        const closeModal = () => {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        };

        closeBtn.addEventListener("click", closeModal);
        closeBtnAction.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }
}
