import { api } from '../lib/api';
import type { ManagementStats, ManagementPurchase, ManagementProduct, PaginatedResponse } from '../types/management.types';

export const ManagementService = {
    async getStats(period: 'today' | 'week' | 'month' | 'historical' = 'month'): Promise<ManagementStats | null> {
        try {
            const result = await api.get(`management/stats?period=${period}`).json<{ data: ManagementStats }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching management stats:', error);
            return null;
        }
    },

    async getAllPurchases(): Promise<ManagementPurchase[]> {
        try {
            const result = await api.get('management/purchases').json<{ data: ManagementPurchase[] }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching all purchases:', error);
            return [];
        }
    },

    async getAnalytics(): Promise<import('../types/management.types').AnalyticsData | null> {
        try {
            const result = await api.get('management/analytics').json<{ status: string; data: import('../types/management.types').AnalyticsData }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    },

    async getProducts(page: number = 1, limit: number = 10, search?: string, sort?: string): Promise<PaginatedResponse<ManagementProduct> | null> {
        try {
            const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
            const sortParam = sort ? `&sort=${sort}` : '';
            const result = await api.get(`management/products?page=${page}&limit=${limit}${searchParam}${sortParam}`).json<PaginatedResponse<ManagementProduct>>();
            return result;
        } catch (error) {
            console.error('Error fetching management products:', error);
            return null;
        }
    },

    async toggleFeature(productId: string, esDestacado: boolean): Promise<{ status: string; message: string } | null> {
        try {
            const result = await api.patch(`management/products/${productId}/feature`, {
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
            const result = await api.post('management/products', {
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
    async updateProduct(id: string, data: any): Promise<{ status: string; message?: string }> {
        try {
            const result = await api.put(`management/products/${id}`, {
                json: data
            }).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al actualizar el producto'
            };
        }
    },
    async getManagementProduct(id: string): Promise<{ status: string; data?: any; message?: string }> {
        try {
            const result = await api.get(`management/products/${id}`).json<{ status: string; data: any }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return { status: 'error', message: errorData?.message || 'Error al obtener el producto' };
        }
    },
    async generateTags(nombre: string, descripcion: string, existingTags: string[] = []): Promise<{ status: string; data?: string[]; message?: string }> {
        try {
            const result = await api.post('management/generate-tags', {
                json: { nombre, descripcion, existingTags },
                timeout: 60000 // override 10s default timeout
            }).json<{ status: string; data: string[] }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al generar tags con IA'
            };
        }
    },
    async getUsers(page: number = 1, limit: number = 10, search?: string, sort?: string): Promise<PaginatedResponse<import('../types/management.types').ManagementUser> | null> {
        try {
            const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
            const sortParam = sort ? `&sort=${sort}` : '';
            const result = await api.get(`management/users?page=${page}&limit=${limit}${searchParam}${sortParam}`).json<PaginatedResponse<import('../types/management.types').ManagementUser>>();
            return result;
        } catch (error) {
            console.error('Error fetching management users:', error);
            return null;
        }
    },
    async createUser(data: any): Promise<{ status: string; data?: import('../types/management.types').ManagementUser; message?: string }> {
        try {
            const result = await api.post('management/users', {
                json: data
            }).json<{ status: string; data: import('../types/management.types').ManagementUser }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al crear el usuario'
            };
        }
    },
    async getUserById(id: string): Promise<{ status: string; data?: import('../types/management.types').ManagementUser & any; message?: string }> {
        try {
            const result = await api.get(`management/users/${id}`).json<{ status: string; data: any }>();
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
            const result = await api.patch(`management/users/${id}`, {
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
    async getUserPurchases(id: string): Promise<ManagementPurchase[]> {
        try {
            const result = await api.get(`management/users/${id}/purchases`).json<{ data: ManagementPurchase[] }>();
            return result.data;
        } catch (error) {
            console.error('Error fetching user purchases:', error);
            return [];
        }
    },
    async deleteUser(id: string): Promise<{ status: string; message: string }> {
        try {
            const result = await api.delete(`management/users/${id}`).json<{ status: string; message: string }>();
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
            const result = await api.get(`management/products?q=${encodeURIComponent(query)}&limit=5`).json<PaginatedResponse<ManagementProduct>>();
            return result.data;
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    },
    async getPurchaseById(id: string): Promise<ManagementPurchase | null> {
        try {
            const result = await api.get(`management/purchases`).json<{ data: ManagementPurchase[] }>();
            return result.data.find(p => p.id === id) || null;
        } catch (error) {
            console.error('Error fetching purchase:', error);
            return null;
        }
    },
    async updatePurchase(id: string, data: { estado?: string; metodoPago?: string; tipoEntrega?: string; envio?: any }): Promise<{ status: string; message?: string }> {
        try {
            const result = await api.patch(`management/purchases/${id}`, {
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
    async completePurchase(id: string): Promise<{ status: string; message: string }> {
        try {
            const result = await api.patch(`purchases/${id}/complete`).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al completar la compra'
            };
        }
    },
    async cancelPurchase(id: string): Promise<{ status: string; message: string }> {
        try {
            const result = await api.patch(`purchases/${id}/cancel`).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al cancelar la compra'
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
    },
    async updateProductPrice(id: string, price: number): Promise<{ status: string; message: string }> {
        try {
            const result = await api.put(`management/products/${id}`, {
                json: { precioActual: price }
            }).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al actualizar el precio del producto'
            };
        }
    },
    async updateProductStatus(id: string, estado: 'ACTIVO' | 'INACTIVO' | 'BORRADO'): Promise<{ status: string; message: string }> {
        try {
            const result = await api.patch(`management/products/${id}/status`, {
                json: { estado }
            }).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al actualizar el estado del producto'
            };
        }
    },
    async applyDirectDiscount(id: string, data: { nombre: string, tipo: 'PORCENTAJE' | 'MONTO_FIJO', valor: number, fechaInicio: string, fechaFin: string }): Promise<{ status: string; data?: any; message?: string }> {
        try {
            const result = await api.post(`management/products/${id}/discount`, {
                json: data
            }).json<{ status: string; data: any }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al aplicar el descuento'
            };
        }
    },
    async removeDirectDiscount(id: string, discountId: string): Promise<{ status: string; message?: string }> {
        try {
            const result = await api.delete(`management/products/${id}/discount/${discountId}`).json<{ status: string; message: string }>();
            return result;
        } catch (error: any) {
            const errorData = await error.response?.json().catch(() => null);
            return {
                status: 'error',
                message: errorData?.message || 'Error al remover el descuento'
            };
        }
    }
};
