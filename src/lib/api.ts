/// <reference path="../env.d.ts" />
import ky from 'ky';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5979/api';

export const api = ky.create({
    prefixUrl: API_URL,
    timeout: 10000,
    hooks: {
        beforeRequest: [
            (request) => {
                // Skip token if it's an auth request to prevent interference
                if (request.url.includes('/auth/')) return;

                if (typeof window !== 'undefined' && localStorage.getItem('marketflex_token')) {
                    const token = localStorage.getItem('marketflex_token');
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
        ],
        afterResponse: [
            async (request, options, response) => {
                if (response.status === 401 && !request.url.includes('/auth/refresh')) {
                    const refreshToken = localStorage.getItem('marketflex_refresh_token');

                    if (refreshToken) {
                        try {
                            const newTokens: any = await api.post('auth/refresh', {
                                json: { refreshToken },
                                hooks: { beforeRequest: [] } // Evitar bucle infinito
                            }).json();

                            localStorage.setItem('marketflex_token', newTokens.accessToken);
                            localStorage.setItem('marketflex_refresh_token', newTokens.refreshToken);

                            // Reintentar la petición original con el nuevo token
                            request.headers.set('Authorization', `Bearer ${newTokens.accessToken}`);
                            return ky(request);
                        } catch (refreshError) {
                            // Si el refresh falla, sesión caducada definitivamente
                            localStorage.removeItem('marketflex_token');
                            localStorage.removeItem('marketflex_refresh_token');
                            window.location.href = '/login?expired=true';
                        }
                    }
                }
            }
        ]
    },
});
