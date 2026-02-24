import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initLogin } from './auth-login';
import * as authService from '../services/auth.service';

vi.mock('../services/auth.service', () => ({
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithFacebookCode: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe('auth-login.ts', () => {
    let originalLocation: Location;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Mock DOM
        document.body.innerHTML = `
            <form class="login-form">
                <input type="text" id="email" name="email" />
                <input type="password" id="password" name="password" />
                <input type="checkbox" name="remember" />
                <button class="btn-login" type="submit">Login</button>
            </form>
            <button id="fb-login-btn">FB</button>
            <button id="google-login-btn">Google</button>
            <div id="google-signin-button"></div>
            <div id="fb-login-btn"></div>
        `;

        (window as any).triggerSileo = vi.fn();

        // Mock Location
        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            href: 'http://localhost/login',
            search: '',
            origin: 'http://localhost',
            pathname: '/login'
        };
    });

    afterEach(() => {
        (window as any).location = originalLocation;
    });

    it('should load remembered email from localStorage', () => {
        localStorage.setItem('rememberedEmail', 'saved@test.com');
        initLogin();

        const emailInput = document.getElementById('email') as HTMLInputElement;
        const rememberCheckbox = document.querySelector('input[name="remember"]') as HTMLInputElement;

        expect(emailInput.value).toBe('saved@test.com');
        expect(rememberCheckbox.checked).toBe(true);
    });

    it('should save email to localStorage when "remember me" is checked', async () => {
        const mockResponse = {
            accessToken: 'at',
            refreshToken: 'rt',
            user: { nombre: 'Agus' }
        };
        (authService.login as any).mockResolvedValueOnce(mockResponse);

        initLogin();
        const form = document.querySelector('.login-form') as HTMLFormElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const rememberCheckbox = document.querySelector('input[name="remember"]') as HTMLInputElement;

        emailInput.value = 'new@test.com';
        rememberCheckbox.checked = true;

        await form.dispatchEvent(new Event('submit'));

        expect(localStorage.getItem('rememberedEmail')).toBe('new@test.com');
    });

    it('should call login service with correct data', async () => {
        (authService.login as any).mockResolvedValueOnce({
            accessToken: 'at',
            refreshToken: 'rt',
            user: { nombre: 'Agus' }
        });

        initLogin();
        const form = document.querySelector('.login-form') as HTMLFormElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        emailInput.value = 'test@test.com';
        passwordInput.value = 'password123';

        await form.dispatchEvent(new Event('submit'));

        expect(authService.login).toHaveBeenCalledWith({
            email: 'test@test.com',
            password: 'password123'
        });
    });

    it('should detect and handle Facebook code in URL', async () => {
        (window as any).location.search = '?code=abc-123';
        const mockResponse = { accessToken: 'at', refreshToken: 'rt', user: { nombre: 'FB User' } };
        (authService.loginWithFacebookCode as any).mockResolvedValueOnce(mockResponse);

        initLogin();

        expect(authService.loginWithFacebookCode).toHaveBeenCalledWith('abc-123', expect.stringContaining('/login'));

        await vi.waitFor(() => {
            expect(localStorage.getItem('marketflex_token')).toBe('at');
            expect(window.location.href).toContain('login_success=true');
        });
    });
});
