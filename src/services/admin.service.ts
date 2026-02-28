import { api } from '../lib/api';
import type { AdminStats, AdminPurchase, AdminProduct, PaginatedResponse } from '../types/admin.types';

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
    },

    async getProducts(page: number = 1, limit: number = 10, search?: string, sort?: string): Promise<PaginatedResponse<AdminProduct> | null> {
        try {
            const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
            const sortParam = sort ? `&sort=${sort}` : '';
            const result = await api.get(`admin/products?page=${page}&limit=${limit}${searchParam}${sortParam}`).json<PaginatedResponse<AdminProduct>>();
            return result;
        } catch (error) {
            console.error('Error fetching admin products:', error);
            return null;
        }
    },

    async toggleFeature(productId: string, esDestacado: boolean): Promise<{ status: string; message: string } | null> {
        try {
            const result = await api.patch(`admin/products/${productId}/feature`, {
                json: { esDestacado }
            }).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al actualizar el estado destacado'
            };
        }
    },
    async getUsers(page: number = 1, limit: number = 10, search?: string, sort?: string): Promise<PaginatedResponse<import('../types/admin.types').AdminUser> | null> {
        try {
            const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
            const sortParam = sort ? `&sort=${sort}` : '';
            const result = await api.get(`admin/users?page=${page}&limit=${limit}${searchParam}${sortParam}`).json<PaginatedResponse<import('../types/admin.types').AdminUser>>();
            return result;
        } catch (error) {
            console.error('Error fetching admin users:', error);
            return null;
        }
    }
};
