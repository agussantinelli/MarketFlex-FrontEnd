import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from './auth.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        post: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('location', { href: '' });
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        });
    });

    it('should call login endpoint', async () => {
        const credentials = { email: 'test@test.com', password: 'password' };
        const mockResponse = { accessToken: 'token', user: {} };
        (api.post as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce(mockResponse)
        });

        const result = await authService.login(credentials);

        expect(api.post).toHaveBeenCalledWith('auth/login', expect.objectContaining({ json: credentials }));
        expect(result).toEqual(mockResponse);
    });

    it('should call register endpoint', async () => {
        const userData = { email: 'new@test.com', password: 'password', nombre: 'Test' };
        const mockResponse = { accessToken: 'token', user: {} };
        (api.post as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce(mockResponse)
        });

        const result = await authService.register(userData);

        expect(api.post).toHaveBeenCalledWith('auth/register', expect.objectContaining({ json: userData }));
        expect(result).toEqual(mockResponse);
    });

    it('should call logout and clear localStorage', () => {
        authService.logout();

        expect(localStorage.removeItem).toHaveBeenCalledWith('marketflex_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('marketflex_refresh_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('marketflex_user');
        expect(window.location.href).toBe('/login');
    });

    it('should get token from localStorage', () => {
        (localStorage.getItem as any).mockReturnValue('stored-token');

        const token = authService.getToken();

        expect(localStorage.getItem).toHaveBeenCalledWith('marketflex_token');
        expect(token).toBe('stored-token');
    });

    it('should get user from localStorage', () => {
        const mockUser = { id: '1', email: 'test@test.com' };
        (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockUser));

        const user = authService.getUser();

        expect(localStorage.getItem).toHaveBeenCalledWith('marketflex_user');
        expect(user).toEqual(mockUser);
    });
});
