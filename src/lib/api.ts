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

                if (typeof window !== 'undefined' && localStorage.getItem('token')) {
                    const token = localStorage.getItem('token');
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
        ],
    },
});
