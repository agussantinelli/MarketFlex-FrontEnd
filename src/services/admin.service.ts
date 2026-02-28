import { api } from '../lib/api';
import type { AdminStats, AdminPurchase } from '../types/admin.types';

export const AdminService = {
    async getStats(period: 'month' | 'historical' = 'month'): Promise<AdminStats | null> {
        try {
            const result = await api.get(`admin/stats?period=${period}`).json<{ data: AdminStats }>();
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
    },

    async getAnalytics(): Promise<import('../types/admin.types').AnalyticsData | null> {
        try {
            const result = await api.get('admin/analytics').json<{ status: string; data: import('../types/admin.types').AnalyticsData }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    }
};
