import { api } from "../lib/api";
import type { UserResponse, UpdateUserInput } from "../types/user.types";

export const UserService = {
    async getProfile(): Promise<UserResponse | null> {
        try {
            return await api.get('user/profile').json<UserResponse>();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    },

    async updateProfile(data: UpdateUserInput): Promise<UserResponse | null> {
        try {
            return await api.patch('user/profile', { json: data }).json<UserResponse>();
        } catch (error) {
            console.error('Error updating user profile:', error);
            return null;
        }
    }
};
