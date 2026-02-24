import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initNavbar } from './navbar';

describe('navbar.ts', () => {
    let originalLocation: Location;
    const styles = { active: 'active-style' };
    const modalStyles = { active: 'modal-active' };

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
        initNavbar(styles, modalStyles);
        const mobileBtn = document.querySelector('.mobile-menu-btn') as HTMLElement;
        const navLinks = document.querySelector('.nav-links') as HTMLElement;

        mobileBtn.click();
        expect(navLinks.classList.contains('active')).toBe(true);
        expect(mobileBtn.classList.contains('active')).toBe(true);

        mobileBtn.click();
        expect(navLinks.classList.contains('active')).toBe(false);
        expect(mobileBtn.classList.contains('active')).toBe(false);
    });

    it('should update UI correctly when user is logged in as admin', () => {
        const user = { nombre: 'Admin User', rol: 'admin' };
        localStorage.setItem('marketflex_user', JSON.stringify(user));
        localStorage.setItem('marketflex_token', 'valid-token');

        initNavbar(styles, modalStyles);

        const userName = document.getElementById('user-name');
        const authGuest = document.querySelector('.nav-auth-guest') as HTMLElement;
        const authUser = document.querySelector('.nav-auth-user') as HTMLElement;
        const adminOnly = document.querySelector('.admin-only') as HTMLElement;
        const customerOnly = document.querySelector('.customer-only') as HTMLElement;

        expect(userName?.textContent).toBe('Admin User');
        expect(authGuest.style.display).toBe('none');
        expect(authUser.style.display).toBe('flex');
        expect(adminOnly.style.display).toBe('flex');
        expect(customerOnly.style.display).toBe('none');
    });

    it('should update UI correctly when user is logged in as customer', () => {
        const user = { nombre: 'Customer User', rol: 'customer' };
        localStorage.setItem('marketflex_user', JSON.stringify(user));
        localStorage.setItem('marketflex_token', 'valid-token');

        initNavbar(styles, modalStyles);

        const adminOnly = document.querySelector('.admin-only') as HTMLElement;
        const customerOnly = document.querySelector('.customer-only') as HTMLElement;

        expect(adminOnly.style.display).toBe('none');
        expect(customerOnly.style.display).toBe('flex');
    });

    it('should show logout modal and handle confirmation', () => {
        initNavbar(styles, modalStyles);

        const logoutBtn = document.getElementById('logout-btn');
        const modal = document.getElementById('navbar-logout-modal');
        const confirmBtn = document.getElementById('navbar-logout-modal-confirm');

        localStorage.setItem('marketflex_token', 'token');

        logoutBtn?.click();
        expect(modal?.classList.contains(modalStyles.active)).toBe(true);

        confirmBtn?.click();
        expect(localStorage.getItem('marketflex_token')).toBeNull();
        expect(window.location.href).toBe('/login');
    });

    it('should hide logout modal on cancel', () => {
        initNavbar(styles, modalStyles);

        const logoutBtn = document.getElementById('logout-btn');
        const modal = document.getElementById('navbar-logout-modal');
        const cancelBtn = document.getElementById('navbar-logout-modal-cancel');

        logoutBtn?.click();
        expect(modal?.classList.contains(modalStyles.active)).toBe(true);

        cancelBtn?.click();
        expect(modal?.classList.contains(modalStyles.active)).toBe(false);
    });

    it('should validate search query length on submit', () => {
        initNavbar(styles, modalStyles);
        const form = document.querySelector('.nav-search-form') as HTMLFormElement;
        const input = document.querySelector('.search-input') as HTMLInputElement;

        input.value = 'a'; // Too short
        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect((window as any).triggerSileo).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('should allow search query with 2 or more characters', () => {
        initNavbar(styles, modalStyles);
        const form = document.querySelector('.nav-search-form') as HTMLFormElement;
        const input = document.querySelector('.search-input') as HTMLInputElement;

        input.value = 'ab';
        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
    });

    it('should toggle clear button visibility based on input', () => {
        initNavbar(styles, modalStyles);
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
        initNavbar(styles, modalStyles);
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
