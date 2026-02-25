import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { api } from './api';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer();

describe('API Interceptors (src/lib/api.ts)', () => {
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
        vi.clearAllMocks();
    });
    afterAll(() => server.close());

    it('should attach Authorization header when token exists', async () => {
        localStorage.setItem('marketflex_token', 'test-token');

        let capturedHeader = '';
        server.use(
            http.get('http://localhost:5979/api/test', ({ request }: { request: Request }) => {
                capturedHeader = request.headers.get('Authorization') || '';
                return HttpResponse.json({ success: true });
            })
        );

        await api.get('test');
        expect(capturedHeader).toBe('Bearer test-token');
    });

    it('should NOT attach Authorization header for auth endpoints', async () => {
        localStorage.setItem('marketflex_token', 'test-token');

        let capturedHeader = '';
        server.use(
            http.post('http://localhost:5979/api/auth/login', ({ request }: { request: Request }) => {
                capturedHeader = request.headers.get('Authorization') || '';
                return HttpResponse.json({ success: true });
            })
        );

        await api.post('auth/login');
        expect(capturedHeader).toBe('');
    });

    it('should attempt auto-refresh on 401 and retry original request', async () => {
        localStorage.setItem('marketflex_token', 'expired-token');
        localStorage.setItem('marketflex_refresh_token', 'valid-refresh-token');

        let attempts = 0;
        let refreshCalled = false;
        let finalRequestToken = '';

        server.use(
            // Original failing call
            http.get('http://localhost:5979/api/protected', ({ request }: { request: Request }) => {
                attempts++;
                if (attempts === 1) {
                    return new HttpResponse(null, { status: 401 });
                }
                finalRequestToken = request.headers.get('Authorization') || '';
                return HttpResponse.json({ data: 'secret' });
            }),
            // Refresh call
            http.post('http://localhost:5979/api/auth/refresh', async ({ request }: { request: Request }) => {
                refreshCalled = true;
                const body = await request.json() as any;
                if (body && body.refreshToken === 'valid-refresh-token') {
                    return HttpResponse.json({
                        accessToken: 'new-access-token',
                        refreshToken: 'new-refresh-token'
                    });
                }
                return new HttpResponse(null, { status: 400 });
            })
        );

        const response = await api.get('protected').json() as any;

        expect(refreshCalled).toBe(true);
        expect(attempts).toBe(2);
        expect(response.data).toBe('secret');
        expect(finalRequestToken).toBe('Bearer new-access-token');
        expect(localStorage.getItem('marketflex_token')).toBe('new-access-token');
    });

    it('should redirect to login on failed refresh', async () => {
        // Redefine window.location for testing
        const originalLocation = window.location;

        const locationMock = {
            href: 'http://localhost:2611/protected',
            assign: vi.fn(),
            replace: vi.fn(),
        } as unknown as Location;

        // @ts-ignore
        delete (window as any).location;
        // @ts-ignore
        window.location = locationMock;

        localStorage.setItem('marketflex_token', 'expired-token');
        localStorage.setItem('marketflex_refresh_token', 'expired-refresh-token');

        server.use(
            http.get('http://localhost:5979/api/protected', () => {
                return new HttpResponse(null, { status: 401 });
            }),
            http.post('http://localhost:5979/api/auth/refresh', () => {
                return new HttpResponse(null, { status: 401 });
            })
        );

        try {
            await api.get('protected');
        } catch (e) {
            // Expected
        }

        expect(window.location.href).toBe('/login?expired=true');
        expect(localStorage.getItem('marketflex_token')).toBeNull();

        // Restore location
        // @ts-ignore
        window.location = originalLocation;
    });
});
