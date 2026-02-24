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
                if (request.url.includes('/auth/')) {
                    console.log(`🌐 [API] Request to auth endpoint: ${request.url}`);
                    return;
                }

                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('marketflex_token');
                    if (token) {
                        console.log(`🌐 [API] Attaching token to request: ${request.url}`);
                        request.headers.set('Authorization', `Bearer ${token}`);
                    } else {
                        console.warn(`🌐 [API] No token found for request: ${request.url}`);
                    }
                }
            },
        ],
        afterResponse: [
            async (request, _options, response) => {
                console.log(`🌐 [API] Response received: ${response.status} from ${response.url}`);
                if (response.status === 401 && !request.url.includes('/auth/refresh')) {
                    console.warn(`🌐 [API] 401 Unauthorized detected. Attempting token refresh...`);
                    const refreshToken = localStorage.getItem('marketflex_refresh_token');

                    if (refreshToken) {
                        try {
                            console.log(`🌐 [API] Sending refresh token to backend...`);
                            const newTokens: any = await api.post('auth/refresh', {
                                json: { refreshToken },
                                hooks: { beforeRequest: [] } // Evitar bucle infinito
                            }).json();

                            console.log(`🌐 [API] Refresh successful. Storing new tokens.`);
                            localStorage.setItem('marketflex_token', newTokens.accessToken);
                            localStorage.setItem('marketflex_refresh_token', newTokens.refreshToken);

                            // Reintentar la petición original con el nuevo token
                            console.log(`🌐 [API] Retrying original request with new token...`);
                            request.headers.set('Authorization', `Bearer ${newTokens.accessToken}`);
                            return ky(request);
                        } catch (refreshError) {
                            console.error(`❌ [API] Refresh token flow FAILED:`, refreshError);
                            // Si el refresh falla, sesión caducada definitivamente
                            localStorage.removeItem('marketflex_token');
                            localStorage.removeItem('marketflex_refresh_token');
                            window.location.href = '/login?expired=true';
                        }
                    } else {
                        console.error(`❌ [API] No refresh token available in localStorage`);
                    }
                }
                return response;
            }
        ]
    },
});
