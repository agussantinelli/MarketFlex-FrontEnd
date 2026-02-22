export function initProductCarousel(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const container = section.querySelector("[data-carousel-container]") as HTMLElement;
    const prevBtn = section.querySelector("[data-carousel-prev]") as HTMLButtonElement;
    const nextBtn = section.querySelector("[data-carousel-next]") as HTMLButtonElement;

    if (!container || !prevBtn || !nextBtn) return;

    const updateButtonStates = () => {
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        // Use a small buffer (5px) for tolerance
        if (scrollLeft <= 5) {
            prevBtn.setAttribute("data-disabled", "true");
        } else {
            prevBtn.removeAttribute("data-disabled");
        }

        if (scrollLeft >= maxScroll - 5) {
            nextBtn.setAttribute("data-disabled", "true");
        } else {
            nextBtn.removeAttribute("data-disabled");
        }
    };

    const getScrollAmount = () => {
        const item = container.querySelector("[data-carousel-item]");
        return item ? item.getBoundingClientRect().width + 24 : 300;
    };

    prevBtn.addEventListener("click", () => {
        container.scrollBy({
            left: -getScrollAmount(),
            behavior: "smooth",
        });
    });

    nextBtn.addEventListener("click", () => {
        container.scrollBy({
            left: getScrollAmount(),
            behavior: "smooth"
        });
    });

    // Add scroll listener for state updates
    container.addEventListener("scroll", updateButtonStates);

    // Initial check
    updateButtonStates();

    // Final check after a short delay to ensure rendering is complete
    setTimeout(updateButtonStates, 100);
}

export function setupAllProductCarousels() {
    const carousels = document.querySelectorAll("[data-carousel]");
    carousels.forEach((carousel) => {
        if (carousel.id) initProductCarousel(carousel.id);
    });
}
