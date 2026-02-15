import ky from 'ky';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5979/api';

export const api = ky.create({
    prefixUrl: API_URL,
    timeout: 10000,
    hooks: {
        beforeRequest: [
            (request) => {
                // Aquí podrías inyectar el token JWT si estuviera guardado en localStorage
                // const token = localStorage.getItem('token');
                // if (token) {
                // 	request.headers.set('Authorization', `Bearer ${token}`);
                // }
            },
        ],
    },
});
