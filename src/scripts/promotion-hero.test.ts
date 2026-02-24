import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupHero } from './promotion-hero';

describe('promotion-hero.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        document.body.innerHTML = `
            <div data-hero-container>
                <div data-hero-track style="transform: translateX(0%)">
                    <div data-hero-slide></div>
                    <div data-hero-slide></div>
                    <div data-hero-slide></div>
                </div>
                <div data-hero-indicator data-active="true"></div>
                <div data-hero-indicator data-active="false"></div>
                <div data-hero-indicator data-active="false"></div>
                <button data-hero-prev></button>
                <button data-hero-next></button>
            </div>
        `;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should auto-play to next slide after interval', () => {
        setupHero();
        const nextSlideTimeout = 6000;

        vi.advanceTimersByTime(nextSlideTimeout);

        const track = document.querySelector('[data-hero-track]') as HTMLElement;
        expect(track!.style.transform).toBe('translateX(-100%)');

        const indicators = document.querySelectorAll('[data-hero-indicator]');
        expect(indicators[1]?.getAttribute('data-active')).toBe('true');
        expect(indicators[0]?.getAttribute('data-active')).toBe('false');
    });

    it('should move to next slide when next button is clicked', () => {
        setupHero();
        const nextBtn = document.querySelector('[data-hero-next]') as HTMLButtonElement;
        const track = document.querySelector('[data-hero-track]') as HTMLElement;

        nextBtn.click();
        expect(track.style.transform).toBe('translateX(-100%)');
    });

    it('should move to previous slide when prev button is clicked', () => {
        setupHero();
        const prevBtn = document.querySelector('[data-hero-prev]') as HTMLButtonElement;
        const track = document.querySelector('[data-hero-track]') as HTMLElement;

        // Clicking prev from first slide should wrap to last (index 2)
        prevBtn.click();
        expect(track.style.transform).toBe('translateX(-200%)');
    });

    it('should jump to specific slide when indicator is clicked', () => {
        setupHero();
        const indicators = document.querySelectorAll('[data-hero-indicator]');
        const track = document.querySelector('[data-hero-track]') as HTMLElement;

        (indicators[2] as HTMLElement).click();
        expect(track?.style.transform).toBe('translateX(-200%)');
        expect(indicators[2]?.getAttribute('data-active')).toBe('true');
    });

    it('should handle containers with only one slide by doing nothing', () => {
        document.body.innerHTML = `
            <div data-hero-container>
                <div data-hero-track>
                    <div data-hero-slide></div>
                </div>
            </div>
        `;
        const track = document.querySelector('[data-hero-track]') as HTMLElement;
        setupHero();

        vi.advanceTimersByTime(6000);
        expect(track!.style.transform).toBe('');
    });
});
