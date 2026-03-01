import type { Characteristic, ProductSummary } from '../types/characteristics.types';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5979/api';

export const characteristicsService = {
    async getAll(): Promise<Characteristic[]> {
        const resp = await fetch(`${API_URL}/characteristics`);
        const json = await resp.json();
        return json.data;
    },

    async getProducts(id: string): Promise<ProductSummary[]> {
        const resp = await fetch(`${API_URL}/characteristics/${id}/products`);
        const json = await resp.json();
        return json.data;
    },

    async update(id: string, nombre: string): Promise<Characteristic> {
        const resp = await fetch(`${API_URL}/characteristics/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const json = await resp.json();
        return json.data;
    },

    async delete(id: string): Promise<void> {
        await fetch(`${API_URL}/characteristics/${id}`, {
            method: 'DELETE'
        });
    }
};
