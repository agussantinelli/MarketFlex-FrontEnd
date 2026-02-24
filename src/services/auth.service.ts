import { api } from "../lib/api";
import type { LoginResponse, GoogleLoginResponse } from '../types/auth.types';

export const login = async (credentials: any): Promise<LoginResponse> => {
    return await api.post('auth/login', { json: credentials }).json();
};

export const register = async (userData: any): Promise<LoginResponse> => {
    return await api.post('auth/register', { json: userData }).json();
};

export const loginWithGoogle = async (idToken: string): Promise<GoogleLoginResponse> => {
    return await api.post('auth/google', { json: { idToken } }).json();
};

export const loginWithFacebook = async (accessToken: string): Promise<GoogleLoginResponse> => {
    return await api.post('auth/facebook', { json: { accessToken } }).json();
};

export const loginWithFacebookCode = async (code: string, redirectUri: string): Promise<GoogleLoginResponse> => {
    return await api.post('auth/facebook/code', { json: { code, redirectUri } }).json();
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('marketflex_token');
        localStorage.removeItem('marketflex_refresh_token');
        localStorage.removeItem('marketflex_user');
        window.location.href = '/login';
    }
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('marketflex_token');
    }
    return null;
};

export const getUser = () => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('marketflex_user');
        return userStr ? JSON.parse(userStr) : null;
    }
    return null;
};
