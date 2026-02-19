import { api } from '../lib/api';
import type { LoginResponse } from '../types/auth.types';

export const login = async (credentials: any): Promise<LoginResponse> => {
    return await api.post('auth/login', { json: credentials }).json();
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const getUser = () => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    return null;
};
