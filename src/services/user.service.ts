import { api } from "../lib/api";
import type { User } from '../types/user.types';


export const getProfile = async (): Promise<User> => {
    const profile: User = await api.get('user/me').json();

    // Side effect: update localStorage to keep UI in sync
    if (typeof window !== 'undefined') {
        localStorage.setItem('marketflex_user', JSON.stringify(profile));
    }

    return profile;
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
    const profile: User = await api.patch('user/me', { json: userData }).json();

    if (typeof window !== 'undefined') {
        localStorage.setItem('marketflex_user', JSON.stringify(profile));
    }

    return profile;
};
