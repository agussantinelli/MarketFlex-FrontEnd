import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initRegister } from './auth-register';
import * as authService from '../services/auth.service';

vi.mock('../services/auth.service', () => ({
    register: vi.fn()
}));

describe('auth-register.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = `
            <form class="register-form">
                <input type="text" name="nombre" value="Agus" />
                <input type="text" name="apellido" value="S" />
                <input type="text" name="email" value="agus@test.com" />
                <input type="password" id="password" name="password" />
                <input type="password" name="confirmPassword" />
                <div id="req-length"></div>
                <div id="req-upper"></div>
                <div id="req-number"></div>
                <button type="submit">Registrarse</button>
            </form>
        `;
        // Mock global objects
        (window as any).triggerSileo = vi.fn();
        (window as any).grecaptcha = {
            execute: vi.fn().mockResolvedValue('mock-recaptcha-token')
        };
    });

    it('should toggle "met" class on password requirements based on input', () => {
        initRegister();
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const reqLength = document.getElementById('req-length');
        const reqUpper = document.getElementById('req-upper');
        const reqNumber = document.getElementById('req-number');

        // Test length
        passwordInput.value = 'abc';
        passwordInput.dispatchEvent(new Event('input'));
        expect(reqLength?.classList.contains('met')).toBe(false);

        passwordInput.value = 'abcdef';
        passwordInput.dispatchEvent(new Event('input'));
        expect(reqLength?.classList.contains('met')).toBe(true);

        // Test upper
        passwordInput.value = 'abc';
        passwordInput.dispatchEvent(new Event('input'));
        expect(reqUpper?.classList.contains('met')).toBe(false);

        passwordInput.value = 'A';
        passwordInput.dispatchEvent(new Event('input'));
        expect(reqUpper?.classList.contains('met')).toBe(true);

        // Test number
        passwordInput.value = 'abc';
        passwordInput.dispatchEvent(new Event('input'));
        expect(reqNumber?.classList.contains('met')).toBe(false);

        passwordInput.value = '1';
        passwordInput.dispatchEvent(new Event('input'));
        expect(reqNumber?.classList.contains('met')).toBe(true);
    });

    it('should show error if passwords do not match', async () => {
        initRegister();
        const form = document.querySelector('.register-form') as HTMLFormElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const confirmInput = document.querySelector('input[name="confirmPassword"]') as HTMLInputElement;

        passwordInput.value = 'Valid1';
        confirmInput.value = 'Different1';

        form.dispatchEvent(new Event('submit'));

        expect(window.triggerSileo).toHaveBeenCalledWith('error', 'Las contraseñas no coinciden');
        expect(authService.register).not.toHaveBeenCalled();
    });

    it('should call register service and redirect on success', async () => {
        const mockResponse = {
            accessToken: 'at',
            refreshToken: 'rt',
            user: { nombre: 'Agus' }
        };
        (authService.register as any).mockResolvedValueOnce(mockResponse);

        // Mock window.location
        const originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = { href: '' };

        initRegister();
        const form = document.querySelector('.register-form') as HTMLFormElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const confirmInput = document.querySelector('input[name="confirmPassword"]') as HTMLInputElement;

        passwordInput.value = 'Valid1';
        confirmInput.value = 'Valid1';

        await form.dispatchEvent(new Event('submit'));

        // Wait for async operations in submit handler
        await vi.waitFor(() => {
            expect(authService.register).toHaveBeenCalled();
            expect(window.location.href).toContain('login_success=true');
        });

        // Cleanup
        (window as any).location = originalLocation;
    });
});
