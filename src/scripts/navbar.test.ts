import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initNavbar } from './navbar';

describe('navbar.ts', () => {
    let originalLocation: Location;
    const styles = { active: 'active-style' };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        document.body.innerHTML = `
            <div class="mobile-menu-btn"></div>
            <div class="nav-links"></div>
            <div class="category-item">
                <div class="subcat-toggle"></div>
                <div class="subcategory-menu"></div>
            </div>
            <div class="nav-item-dropdown">
                <button class="dropdown-trigger"></button>
                <div class="nav-dropdown-menu"></div>
            </div>
            <div class="nav-auth-guest"></div>
            <div class="nav-auth-user"></div>
            <span id="user-name"></span>
            <button id="logout-btn"></button>
            <div id="navbar-logout-modal">
                <button id="navbar-logout-modal-cancel"></button>
                <button id="navbar-logout-modal-confirm"></button>
            </div>
            <form class="nav-search-form">
                <input class="search-input" />
                <button class="search-clear-btn"></button>
            </form>
            <div class="admin-only"></div>
            <div class="customer-only"></div>
        `;

        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            href: 'http://localhost/',
            search: '',
            origin: 'http://localhost',
            pathname: '/'
        };
        (window as any).triggerSileo = vi.fn().mockReturnValue(true);
        (window as any).alert = vi.fn();
    });

    afterEach(() => {
        (window as any).location = originalLocation;
    });

    it('should toggle mobile menu classes on click', () => {
        initNavbar(styles);
        const mobileBtn = document.querySelector('.mobile-menu-btn') as HTMLElement;
        const navLinks = document.querySelector('.nav-links') as HTMLElement;

        mobileBtn.click();
        expect(navLinks.classList.contains('active')).toBe(true);
        expect(mobileBtn.classList.contains('active')).toBe(true);

        mobileBtn.click();
        expect(navLinks.classList.contains('active')).toBe(false);
        expect(mobileBtn.classList.contains('active')).toBe(false);
    });

    it('should update UI correctly when user is logged in', () => {
        const user = { nombre: 'Test User', rol: 'admin' };
        localStorage.setItem('marketflex_user', JSON.stringify(user));
        localStorage.setItem('marketflex_token', 'valid-token');

        initNavbar(styles);

        const userName = document.getElementById('user-name');
        const authGuest = document.querySelector('.nav-auth-guest') as HTMLElement;
        const authUser = document.querySelector('.nav-auth-user') as HTMLElement;

        expect(userName?.textContent).toBe('Test User');
        expect(authGuest.style.display).toBe('none');
        expect(authUser.style.display).toBe('flex');
    });

    it('should validate search query length on submit', () => {
        initNavbar(styles);
        const form = document.querySelector('.nav-search-form') as HTMLFormElement;
        const input = document.querySelector('.search-input') as HTMLInputElement;

        input.value = 'a'; // Too short
        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect((window as any).triggerSileo).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('should allow search query with 2 or more characters', () => {
        initNavbar(styles);
        const form = document.querySelector('.nav-search-form') as HTMLFormElement;
        const input = document.querySelector('.search-input') as HTMLInputElement;

        input.value = 'ab';
        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
    });

    it('should toggle clear button visibility based on input', () => {
        initNavbar(styles);
        const input = document.querySelector('.search-input') as HTMLInputElement;
        const clearBtn = document.querySelector('.search-clear-btn') as HTMLButtonElement;

        input.value = 'test';
        input.dispatchEvent(new Event('input'));
        expect(clearBtn.classList.contains('visible')).toBe(true);

        input.value = '';
        input.dispatchEvent(new Event('input'));
        expect(clearBtn.classList.contains('visible')).toBe(false);
    });

    it('should clear input and focus when clear button is clicked', () => {
        initNavbar(styles);
        const input = document.querySelector('.search-input') as HTMLInputElement;
        const clearBtn = document.querySelector('.search-clear-btn') as HTMLButtonElement;
        const focusSpy = vi.spyOn(input, 'focus');

        input.value = 'to be cleared';
        input.dispatchEvent(new Event('input'));

        clearBtn.click();

        expect(input.value).toBe('');
        expect(focusSpy).toHaveBeenCalled();
        expect(clearBtn.classList.contains('visible')).toBe(false);
    });
});
