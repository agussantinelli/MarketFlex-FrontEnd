export function setupHero() {
    const containers = document.querySelectorAll("[data-hero-container]");

    containers.forEach((container) => {
        const track = container.querySelector(
            "[data-hero-track]",
        ) as HTMLElement;
        const slides = container.querySelectorAll(
            "[data-hero-slide]",
        ) as NodeListOf<HTMLElement>;
        const indicators = container.querySelectorAll(
            "[data-hero-indicator]",
        ) as NodeListOf<HTMLElement>;
        const nextBtn = container.querySelector("[data-hero-next]");
        const prevBtn = container.querySelector("[data-hero-prev]");

        if (!track || slides.length <= 1) return;

        let currentIndex = 0;
        let interval: any;

        const updateHero = (index: number) => {
            currentIndex = index;
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;

            // Update dots/indicators
            indicators.forEach((ind, i) => {
                ind.setAttribute(
                    "data-active",
                    (i === currentIndex).toString(),
                );
            });

            // Reset interval
            startAutoPlay();
        };

        const next = () => {
            const newIndex = (currentIndex + 1) % slides.length;
            updateHero(newIndex);
        };

        const prev = () => {
            const newIndex =
                (currentIndex - 1 + slides.length) % slides.length;
            updateHero(newIndex);
        };

        const startAutoPlay = () => {
            if (interval) clearInterval(interval);
            interval = setInterval(next, 6000);
        };

        nextBtn?.addEventListener("click", next);
        prevBtn?.addEventListener("click", prev);

        indicators.forEach((ind, i) => {
            ind.addEventListener("click", () => updateHero(i));
        });

        startAutoPlay();
    });
}
