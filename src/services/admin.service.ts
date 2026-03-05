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
    async createProduct(data: any): Promise<{ status: string; data?: any; message?: string }> {
        try {
            const result = await api.post('admin/products', {
                json: data
            }).json<{ status: string; data: any }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al crear el producto'
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
    },
    async createUser(data: any): Promise<{ status: string; data?: import('../types/admin.types').AdminUser; message?: string }> {
        try {
            const result = await api.post('admin/users', {
                json: data
            }).json<{ status: string; data: import('../types/admin.types').AdminUser }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al crear el usuario'
            };
        }
    },
    async getUserById(id: string): Promise<{ status: string; data?: import('../types/admin.types').AdminUser & any; message?: string }> {
        try {
            const result = await api.get(`admin/users/${id}`).json<{ status: string; data: any }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al obtener el usuario'
            };
        }
    },
    async updateUser(id: string, data: any): Promise<{ status: string; message?: string }> {
        try {
            const result = await api.patch(`admin/users/${id}`, {
                json: data
            }).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al actualizar el usuario'
            };
        }
    },
    async getUserPurchases(id: string): Promise<AdminPurchase[]> {
        try {
            const result = await api.get(`admin/users/${id}/purchases`).json<{ data: AdminPurchase[] }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching user purchases:', error);
            return [];
        }
    },
    async deleteUser(id: string): Promise<{ status: string; message: string }> {
        try {
            const result = await api.delete(`admin/users/${id}`).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al desactivar el usuario'
            };
        }
    },
    async searchProducts(query: string): Promise<any[]> {
        try {
            const result = await api.get(`admin/products?q=${encodeURIComponent(query)}&limit=5`).json<PaginatedResponse<AdminProduct>>();
            return result.data;
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    },
    async getPurchaseById(id: string): Promise<AdminPurchase | null> {
        try {
            const result = await api.get(`admin/purchases`).json<{ data: AdminPurchase[] }>();
            return result.data.find(p => p.id === id) || null;
        } catch (error) {
            console.error('Error fetching purchase:', error);
            return null;
        }
    },
    async updatePurchase(id: string, data: { estado?: string; metodoPago?: string }): Promise<{ status: string; message?: string }> {
        try {
            const result = await api.patch(`admin/purchases/${id}`, {
                json: data
            }).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al actualizar la venta'
            };
        }
    },
    async deletePurchase(id: string): Promise<{ status: string; message: string }> {
        try {
            const result = await api.delete(`purchases/${id}`).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al eliminar la compra'
            };
        }
    },
    async deleteClaim(compraId: string, nroReclamo: number): Promise<{ status: string; message: string }> {
        try {
            const result = await api.delete(`claims/${compraId}/${nroReclamo}`).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al eliminar el reclamo'
            };
        }
    },
    async deleteSupportMessage(id: string): Promise<{ status: string; message: string }> {
        try {
            const result = await api.delete(`support/${id}`).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al eliminar el mensaje de soporte'
            };
        }
    }
};
