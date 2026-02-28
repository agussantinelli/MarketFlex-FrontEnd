import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initUserDropdown } from './userDropdown';

describe('userDropdown', () => {
    let originalLocation: Location;
    const modalStyles = { active: 'modal-active' };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        document.body.innerHTML = `
            <span class="user-name-display"></span>
            <button class="logout-trigger-btn"></button>
            <div class="admin-only"></div>
            <div class="customer-only"></div>
            <button class="go-admin-btn"></button>
            <button class="go-client-btn"></button>
            <a class="client-purchases-link"></a>
            <button class="dropdown-trigger"></button>
            <div class="dropdown-menu"></div>
            <div id="user-logout-modal">
                <button id="user-logout-modal-cancel"></button>
                <button id="user-logout-modal-confirm"></button>
            </div>
        `;

        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            href: 'http://localhost/',
            pathname: '/'
        };

        vi.useFakeTimers();
    });

    afterEach(() => {
        (window as any).location = originalLocation;
        vi.useRealTimers();
    });

    it('should initialize dropdown click logic and toggle active class', () => {
        initUserDropdown(modalStyles);

        const btn = document.querySelector('.dropdown-trigger') as HTMLElement;
        const menu = document.querySelector('.dropdown-menu') as HTMLElement;

        btn.click();
        expect(menu.classList.contains('active')).toBe(true);

        btn.click();
        expect(menu.classList.contains('active')).toBe(false);
    });

    it('should close dropdown when clicking outside', () => {
        initUserDropdown(modalStyles);

        const btn = document.querySelector('.dropdown-trigger') as HTMLElement;
        const menu = document.querySelector('.dropdown-menu') as HTMLElement;

        btn.click();
        expect(menu.classList.contains('active')).toBe(true);

        document.body.click();
        expect(menu.classList.contains('active')).toBe(false);
    });

    it('should update UI correctly for admin user', () => {
        const user = { nombre: 'Admin User', rol: 'admin' };
        localStorage.setItem('marketflex_user', JSON.stringify(user));
        localStorage.setItem('marketflex_token', 'valid-token');

        initUserDropdown(modalStyles);

        const userName = document.querySelector('.user-name-display');
        const adminOnly = document.querySelector('.admin-only') as HTMLElement;
        const customerOnly = document.querySelector('.customer-only') as HTMLElement;

        expect(userName?.textContent).toBe('Admin User');
        expect(adminOnly.style.display).toBe('flex');
        expect(customerOnly.style.display).toBe('none');
    });

    it('should update route-based visibility for client view correctly', () => {
        (window as any).location.pathname = '/';
        initUserDropdown(modalStyles);

        const clientPurchasesLinks = document.querySelector('.client-purchases-link') as HTMLElement;
        const goAdminBtn = document.querySelector('.go-admin-btn') as HTMLElement;
        const goClientBtn = document.querySelector('.go-client-btn') as HTMLElement;

        expect(clientPurchasesLinks.style.display).toBe('flex');
        expect(goAdminBtn.style.display).toBe('flex');
        expect(goClientBtn.style.display).toBe('none');
    });

    it('should show logout modal on click', () => {
        initUserDropdown(modalStyles);

        const logoutBtn = document.querySelector('.logout-trigger-btn') as HTMLElement;
        const modal = document.getElementById('user-logout-modal');

        logoutBtn.click();
        expect(modal?.classList.contains(modalStyles.active)).toBe(true);
    });

    it('should hide logout modal on cancel', () => {
        initUserDropdown(modalStyles);

        const logoutBtn = document.querySelector('.logout-trigger-btn') as HTMLElement;
        const modal = document.getElementById('user-logout-modal');
        const cancelBtn = document.getElementById('user-logout-modal-cancel') as HTMLElement;

        logoutBtn.click();
        expect(modal?.classList.contains(modalStyles.active)).toBe(true);

        cancelBtn.click();
        expect(modal?.classList.contains(modalStyles.active)).toBe(false);
    });

    it('should clear local storage and redirect on confirm logout', () => {
        localStorage.setItem('marketflex_token', 'token');
        localStorage.setItem('marketflex_refresh_token', 'refresh');
        localStorage.setItem('marketflex_user', '{}');

        initUserDropdown(modalStyles);

        const logoutBtn = document.querySelector('.logout-trigger-btn') as HTMLElement;
        const confirmBtn = document.getElementById('user-logout-modal-confirm') as HTMLElement;

        logoutBtn.click();
        confirmBtn.click();

        expect(localStorage.getItem('marketflex_token')).toBeNull();
        expect(localStorage.getItem('marketflex_refresh_token')).toBeNull();
        expect(localStorage.getItem('marketflex_user')).toBeNull();
        expect(window.location.href).toBe('/login');
    });

    it('should set admin mode to false and redirect to / when "Cambiar a Vista Cliente" is clicked', () => {
        initUserDropdown(modalStyles);

        const goClientBtn = document.querySelector('.go-client-btn') as HTMLElement;
        goClientBtn.click();

        expect(localStorage.getItem('marketflex_admin:isAdminMode')).toBe('false');

        vi.advanceTimersByTime(50);
        expect(window.location.href).toBe('/');
    });

    it('should set admin mode to true and redirect to /admin/dashboard when "Cambiar al Panel Administrador" is clicked', () => {
        initUserDropdown(modalStyles);

        const goAdminBtn = document.querySelector('.go-admin-btn') as HTMLElement;
        goAdminBtn.click();

        expect(localStorage.getItem('marketflex_admin:isAdminMode')).toBe('true');

        vi.advanceTimersByTime(50);
        expect(window.location.href).toBe('/admin/dashboard');
    });
});
