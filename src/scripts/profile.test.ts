import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initProfile } from './profile';
import * as userService from '../services/user.service';
import * as authService from '../services/auth.service';

vi.mock('../services/user.service', () => ({
    getProfile: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
    getUser: vi.fn(),
    logout: vi.fn(),
}));

describe('profile.ts', () => {
    let originalLocation: Location;
    const styles = {
        isReady: 'ready-style',
        loading: 'loading-style',
        hasError: 'error-style',
        editBtn: 'btn-edit'
    };
    const modalStyles = { active: 'modal-active' };

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = `
            <div id="profile-content" class="loading-style">
                <img id="profile-avatar" />
                <div id="user-full-name"></div>
                <div id="user-email"></div>
                <div id="user-dni"></div>
                <div id="user-birth"></div>
                <div id="user-nationality"></div>
                <div id="user-residence"></div>
                <div id="social-google"></div>
                <div id="social-facebook"></div>
                <button id="edit-profile-btn"></button>
                <button id="profile-logout-btn"></button>
                <button id="retry-btn"></button>
                <div id="profile-logout-modal">
                    <button id="profile-logout-modal-cancel"></button>
                    <button id="profile-logout-modal-confirm"></button>
                </div>
            </div>
        `;

        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            href: 'http://localhost/profile',
            reload: vi.fn()
        };
    });

    afterEach(() => {
        (window as any).location = originalLocation;
    });

    it('should redirect back to login if no local user session is found', async () => {
        (authService.getUser as any).mockReturnValue(null);
        await initProfile(styles, modalStyles);
        expect(window.location.href).toBe('/login');
    });

    it('should successfully fetch project profile and update DOM with provided data', async () => {
        const mockUser = {
            nombre: 'Agus',
            apellido: 'Santinelli',
            email: 'agus@test.com',
            dni: '40123456',
            tipoDni: 'DNI',
            fechaNacimiento: '1995-10-20',
            paisNacimiento: 'Argentina',
            ciudadResidencia: 'Córdoba',
            codigoPostal: '5000',
            logueado_con_google: true,
            logueado_con_facebook: false,
            foto: 'http://image.com/avatar.jpg'
        };
        (authService.getUser as any).mockReturnValue({ email: 'agus@test.com' });
        (userService.getProfile as any).mockResolvedValue(mockUser);

        await initProfile(styles, modalStyles);

        expect(document.getElementById('user-full-name')?.textContent).toBe('Agus Santinelli');
        expect(document.getElementById('user-email')?.textContent).toBe('agus@test.com');
        expect(document.getElementById('user-dni')?.textContent).toBe('DNI 40123456');
        expect(document.getElementById('user-nationality')?.textContent).toBe('Argentina');
        expect(document.getElementById('edit-profile-btn')?.textContent).toBe('Editar Perfil');

        const container = document.getElementById('profile-content');
        expect(container?.classList.contains(styles.isReady)).toBe(true);
        expect(container?.classList.contains(styles.loading)).toBe(false);

        const avatar = document.getElementById('profile-avatar') as HTMLImageElement;
        expect(avatar.src).toBe(mockUser.foto);
    });

    it('should handle API errors by adding designated error class', async () => {
        (authService.getUser as any).mockReturnValue({ email: 'agus@test.com' });
        (userService.getProfile as any).mockRejectedValue(new Error('API Failure'));

        await initProfile(styles, modalStyles);

        expect(document.getElementById('profile-content')?.classList.contains(styles.hasError)).toBe(true);
    });

    it('should show "Completar Perfil" label when essential data is missing', async () => {
        const mockUser = {
            nombre: 'Agus',
            apellido: 'Santinelli',
            email: 'agus@test.com',
            dni: null // Triggering incomplete status
        };
        (authService.getUser as any).mockReturnValue({ email: 'agus@test.com' });
        (userService.getProfile as any).mockResolvedValue(mockUser);

        await initProfile(styles, modalStyles);

        expect(document.getElementById('edit-profile-btn')?.textContent).toBe('Completar Perfil');
    });

    it('should handle modal visibility and confirm logout correctly', async () => {
        (authService.getUser as any).mockReturnValue({ email: 'agus' });
        (userService.getProfile as any).mockResolvedValue({});

        await initProfile(styles, modalStyles);

        const logoutBtn = document.getElementById('profile-logout-btn');
        const modal = document.getElementById('profile-logout-modal');
        const confirmBtn = document.getElementById('profile-logout-modal-confirm');

        logoutBtn?.click();
        expect(modal?.classList.contains(modalStyles.active)).toBe(true);

        confirmBtn?.click();
        expect(authService.logout).toHaveBeenCalled();
    });

    it('should trigger page reload on retry button click', async () => {
        (authService.getUser as any).mockReturnValue({ email: 'agus' });
        (userService.getProfile as any).mockRejectedValue(new Error('err'));

        await initProfile(styles, modalStyles);

        const retryBtn = document.getElementById('retry-btn');
        retryBtn?.click();

        expect(window.location.reload).toHaveBeenCalled();
    });
});
