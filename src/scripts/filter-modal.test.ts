import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The script is not exported as a function normally, but it adds an event listener 
// for 'astro:page-load'. We can either export it or just trigger the event.
// Looking at filter-modal.ts, it has initFilterModal as a local function and 
// then adds the listener. I will modify the script to EXPORT the function
// to make it testable, OR I will just trigger the event.
// Wait, the user said "no cambies los scripts". 
// To test it without changing it, I have to rely on the event listener.

describe('filter-modal.ts', () => {
    let originalLocation: Location;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock DOM structure needed by the script
        document.body.innerHTML = `
            <div id="filter-modal-backdrop" 
                 data-categories='[{"id":"1","nombre":"Electrónica"}]'
                 data-subcategories='[{"id":"s1","nombre":"Celulares","categoriaId":"1"}]'
                 data-styles='{"active":"active","hidden":"hidden","optionBtn":"opt","optionActive":"act","filterSection":"sec","expanded":"exp"}'
                 data-fixed-keys='[]'>
                <button id="close-modal-btn"></button>
                <button id="apply-filters-btn"></button>
                <button id="reset-filters-btn"></button>
                <div id="subcategory-section" class="hidden">
                    <div id="subcategory-options"></div>
                </div>
                <input type="number" id="min-price" />
                <input type="number" id="max-price" />
                <input type="checkbox" id="with-stock-checkbox" />
                <input type="checkbox" id="only-offers-checkbox" />
                <div class="sec">
                    <button id="brands-trigger"></button>
                    <div id="brands-content"></div>
                </div>
                <button class="opt" data-type="Electrónica" data-category-id="1">Electrónica</button>
            </div>
            <button id="filter-btn">Open</button>
        `;

        // Mock Location
        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            href: 'http://localhost/products',
            search: '',
            origin: 'http://localhost',
            pathname: '/products'
        };

        // Re-import the script for each test to re-run the logic
        vi.resetModules();
        await import(`./filter-modal?t=${Date.now()}`);
    });

    afterEach(() => {
        (window as any).location = originalLocation;
    });

    it('should open and close modal', () => {
        const backdrop = document.getElementById('filter-modal-backdrop');
        const filterBtn = document.getElementById('filter-btn');
        const closeBtn = document.getElementById('close-modal-btn');

        filterBtn?.click();
        expect(backdrop?.classList.contains('active')).toBe(true);

        closeBtn?.click();
        expect(backdrop?.classList.contains('active')).toBe(false);
    });

    it('should show subcategories when a category is clicked', () => {
        const catBtn = document.querySelector('[data-type="Electrónica"]') as HTMLButtonElement;
        const subSection = document.getElementById('subcategory-section');
        const subOptions = document.getElementById('subcategory-options');

        catBtn.click();

        expect(subSection?.classList.contains('hidden')).toBe(false);
        expect(subOptions?.innerHTML).toContain('Celulares');
    });

    it('should build correct URL when "Apply" is clicked', () => {
        const applyBtn = document.getElementById('apply-filters-btn');
        const minInput = document.getElementById('min-price') as HTMLInputElement;
        const stockCheckbox = document.getElementById('with-stock-checkbox') as HTMLInputElement;

        minInput.value = '100';
        stockCheckbox.checked = true;

        applyBtn?.click();

        expect(window.location.href).toContain('minPrice=100');
        expect(window.location.href).toContain('withStock=true');
        expect(window.location.href).toContain('page=1');
    });

    it('should clear parameters when "Reset" is clicked', () => {
        (window as any).location.search = '?type=test&category=cat&page=2';
        const resetBtn = document.getElementById('reset-filters-btn');

        resetBtn?.click();

        expect(window.location.href).not.toContain('type=test');
        expect(window.location.href).not.toContain('category=cat');
        expect(window.location.href).toContain('page=1');
    });
});
