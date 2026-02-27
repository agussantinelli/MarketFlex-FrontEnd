import { api } from '../lib/api';

export interface AdminStats {
    totalRevenue: number;
    totalSales: number;
    averageTicket: number;
    activeUsers: number;
}

export interface AdminPurchase {
    id: string;
    fechaHora: string;
    total: number;
    metodoPago: string;
    estado: string;
    usuario: {
        nombre: string;
        apellido: string;
    };
    lineas: Array<{
        nombreProducto: string;
        cantidad: number;
        subtotal: number;
    }>;
}

export const AdminService = {
    async getStats(): Promise<AdminStats | null> {
        try {
            const result: any = await api.get('admin/stats').json();
            return result.data;
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            return null;
        }
    },

    async getAllPurchases(): Promise<AdminPurchase[]> {
        try {
            const result: any = await api.get('admin/purchases').json();
            return result.data;
        } catch (error) {
            console.error('Error fetching all purchases:', error);
            return [];
        }
    }
};
