import { api } from '../lib/api';
import type { AdminStats, AdminPurchase } from '../types/admin.types';

export const AdminService = {
    async getStats(): Promise<AdminStats | null> {
        try {
            const result = await api.get('admin/stats').json<{ data: AdminStats }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            return null;
        }
    },

    async getAllPurchases(): Promise<AdminPurchase[]> {
        try {
            const result = await api.get('admin/purchases').json<{ data: AdminPurchase[] }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching all purchases:', error);
            return [];
        }
    }
};
