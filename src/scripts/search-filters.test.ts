import { describe, it, expect, beforeEach } from 'vitest';
import { initSearchFilters } from './search-filters';

describe('search-filters.ts', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button id="filter-btn"></button>
            <div id="filter-modal">
                <button id="close-modal"></button>
                <button id="close-modal-btn"></button>
            </div>
        `;
        document.body.style.overflow = '';
    });

    it('should open modal and disable body overflow on filter button click', () => {
        initSearchFilters();
        const btn = document.getElementById('filter-btn');
        const modal = document.getElementById('filter-modal');

        btn?.click();
        expect(modal?.classList.contains('active')).toBe(true);
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('should close modal and restore overflow on close button click', () => {
        initSearchFilters();
        const btn = document.getElementById('filter-btn');
        const closeBtn = document.getElementById('close-modal');
        const modal = document.getElementById('filter-modal');

        btn?.click();
        expect(modal?.classList.contains('active')).toBe(true);

        closeBtn?.click();
        expect(modal?.classList.contains('active')).toBe(false);
        expect(document.body.style.overflow).toBe('');
    });

    it('should close modal when clicking on the backdrop', () => {
        initSearchFilters();
        const btn = document.getElementById('filter-btn');
        const modal = document.getElementById('filter-modal');

        btn?.click();

        // Mocking a click specifically on the modal backdrop element
        const clickEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'target', { value: modal, enumerable: true });
        modal?.dispatchEvent(clickEvent);

        expect(modal?.classList.contains('active')).toBe(false);
    });

    it('should not close modal when clicking inside the modal content', () => {
        initSearchFilters();
        const btn = document.getElementById('filter-btn');
        const modal = document.getElementById('filter-modal');

        // Add a child to simulate inner content
        modal!.innerHTML += '<div id="inner-content"></div>';
        const innerContent = document.getElementById('inner-content');

        btn?.click();

        innerContent?.click();
        expect(modal?.classList.contains('active')).toBe(true);
    });
});
