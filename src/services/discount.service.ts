import { api } from "../lib/api";

export interface Discount {
    id: string;
    nombre: string;
    porcentaje: number | null;
    montoFijo: number | null;
    fechaInicio: string;
    fechaFin: string;
    estado: 'ACTIVO' | 'INACTIVO' | 'BORRADO';
}

export const discountService = {
    async getAll(): Promise<Discount[]> {
        const response = await api.get('discounts').json<{ status: string, data: Discount[] }>();
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`discounts/${id}`);
    }
};
