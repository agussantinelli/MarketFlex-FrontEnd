import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initProductCarousel, setupAllProductCarousels } from './carousel';

describe('carousel.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Mock DOM structure
        document.body.innerHTML = `
            <section id="carousel-1" data-carousel>
                <div data-carousel-container style="width: 1000px; overflow: scroll;">
                    <button data-carousel-prev></button>
                    <button data-carousel-next></button>
                    <div data-carousel-item style="width: 200px;"></div>
                </div>
            </section>
        `;

        // Mock properties and methods that happy-dom might not handle fully
        const container = document.querySelector('[data-carousel-container]') as any;
        if (container) {
            container.scrollLeft = 0;
            // Define scrollWidth and clientWidth
            Object.defineProperty(container, 'scrollWidth', { configurable: true, value: 2000 });
            Object.defineProperty(container, 'clientWidth', { configurable: true, value: 1000 });

            container.scrollBy = vi.fn().mockImplementation((options) => {
                if (options.left) {
                    container.scrollLeft += options.left;
                    container.dispatchEvent(new Event('scroll'));
                }
            });
        }

        const item = document.querySelector('[data-carousel-item]') as any;
        if (item) {
            item.getBoundingClientRect = vi.fn().mockReturnValue({ width: 200 });
        }
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize carousel and update button states', () => {
        initProductCarousel('carousel-1');

        const prevBtn = document.querySelector('[data-carousel-prev]');
        const nextBtn = document.querySelector('[data-carousel-next]');

        // Initially scrollLeft is 0, so prev should be disabled
        expect(prevBtn?.getAttribute('data-disabled')).toBe('true');
        // maxScroll is 1000, scrollLeft 0, so next should be enabled
        expect(nextBtn?.getAttribute('data-disabled')).toBeNull();
    });

    it('should scroll next and update buttons', () => {
        initProductCarousel('carousel-1');
        const nextBtn = document.querySelector('[data-carousel-next]') as HTMLButtonElement;
        const container = document.querySelector('[data-carousel-container]') as any;

        nextBtn.click();

        expect(container.scrollBy).toHaveBeenCalled();
        // scrollAmount = 200 (item) + 24 = 224
        expect(container.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: 224 }));
    });

    it('should disable next button when reached end', () => {
        initProductCarousel('carousel-1');
        const container = document.querySelector('[data-carousel-container]') as any;
        const nextBtn = document.querySelector('[data-carousel-next]') as HTMLButtonElement;

        // Manually set scroll to end (maxScroll = 1000)
        container.scrollLeft = 1000;
        container.dispatchEvent(new Event('scroll'));

        expect(nextBtn?.getAttribute('data-disabled')).toBe('true');
        expect(document.querySelector('[data-carousel-prev]')?.getAttribute('data-disabled')).toBeNull();
    });

    it('should setup all carousels on page', () => {
        document.body.innerHTML += `
            <section id="carousel-2" data-carousel>
                <div data-carousel-container>
                    <button data-carousel-prev></button>
                    <button data-carousel-next></button>
                </div>
            </section>
        `;

        // Mock second container
        const container2 = document.getElementById('carousel-2')?.querySelector('[data-carousel-container]') as any;
        if (container2) {
            Object.defineProperty(container2, 'scrollWidth', { configurable: true, value: 500 });
            Object.defineProperty(container2, 'clientWidth', { configurable: true, value: 500 });
        }

        setupAllProductCarousels();

        const prevBtn2 = document.querySelector('#carousel-2 [data-carousel-prev]');
        expect(prevBtn2?.getAttribute('data-disabled')).toBe('true');
    });
});
