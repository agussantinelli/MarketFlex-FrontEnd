import { api } from '../lib/api';
import type { Characteristic, ProductSummary } from '../types/characteristics.types';

export const characteristicsService = {
    async getAll(): Promise<Characteristic[]> {
        const response = await api.get('characteristics').json<{ data: Characteristic[] }>();
        return response.data;
    },

    async getProducts(id: string): Promise<ProductSummary[]> {
        const response = await api.get(`characteristics/${id}/products`).json<{ data: ProductSummary[] }>();
        return response.data;
    },

    async update(id: string, nombre: string): Promise<Characteristic> {
        const response = await api.patch(`characteristics/${id}`, {
            json: { nombre }
        }).json<{ data: Characteristic }>();
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`characteristics/${id}`);
    }
};
