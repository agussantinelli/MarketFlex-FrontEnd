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

                // Handle 401 Unauthorized (Session Expired / Token Invalid)
                if (response.status === 401 && !request.url.includes('/auth/refresh') && typeof window !== 'undefined') {
                    console.warn(`🌐 [API] 401 Unauthorized detected. Attempting token refresh...`);
                    const refreshToken = localStorage.getItem('marketflex_refresh_token');

                    if (refreshToken) {
                        try {
                            console.log(`🌐 [API] Sending refresh token to backend...`);
                            const newTokens: any = await api.post('auth/refresh', {
                                json: { refreshToken },
                                hooks: { beforeRequest: [] } // Prevent infinite loop
                            }).json();

                            console.log(`🌐 [API] Refresh successful. Storing new tokens.`);
                            localStorage.setItem('marketflex_token', newTokens.accessToken);
                            localStorage.setItem('marketflex_refresh_token', newTokens.refreshToken);

                            // Retry the original request with the global ky to avoid doubled prefixUrl
                            console.log(`🌐 [API] Retrying original request to: ${request.url}`);

                            return ky(request.clone(), {
                                headers: {
                                    'Authorization': `Bearer ${newTokens.accessToken}`
                                }
                            });
                        } catch (refreshError) {
                            console.error(`❌ [API] Refresh token flow FAILED:`, refreshError);
                            localStorage.removeItem('marketflex_token');
                            localStorage.removeItem('marketflex_refresh_token');
                            window.location.href = '/login?expired=true';
                            return response;
                        }
                    } else {
                        console.error(`❌ [API] No refresh token available in localStorage`);
                    }
                }

                // Global Error Handling with Sileo Notifications
                if (!response.ok && response.status !== 401) {
                    let errorMessage = 'Ocurrió un error inesperado';

                    try {
                        const errorData: any = await response.clone().json();
                        const rawMessage: string = (errorData.message || errorData.error || '') as string;

                        const errorMap: Record<string, string> = {
                            'insufficient stock': 'Stock insuficiente para uno o más productos',
                            'not found': 'Producto no encontrado o no disponible',
                            'invalid data': 'Datos de compra inválidos',
                            'unauthorized': 'Sesión no válida',
                            'internal server error': 'Error interno del servidor, por favor intenta de nuevo'
                        };

                        const matchedKey = Object.keys(errorMap).find(key =>
                            rawMessage.toLowerCase().includes(key)
                        ) as keyof typeof errorMap | undefined;

                        if (matchedKey && errorMap[matchedKey]) {
                            errorMessage = errorMap[matchedKey];
                        } else if (rawMessage && rawMessage.length < 100) {
                            errorMessage = rawMessage;
                        }
                    } catch (e) {
                        errorMessage = 'Error de comunicación con el servidor';
                    }

                    if (typeof window !== 'undefined' && (window as any).triggerSileo) {
                        (window as any).triggerSileo('error', errorMessage);
                    }
                }

                return response;
            }
        ]
    },
});
