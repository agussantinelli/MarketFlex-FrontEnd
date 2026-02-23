import { api } from "../lib/api";
import type { User } from '../types/user.types';


export const getProfile = async (): Promise<User> => {
    return await api.get('user/me').json();
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
    return await api.patch('user/me', { json: userData }).json();
};
