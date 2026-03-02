import { api } from '../lib/api';
import type { Brand, BrandWithCount, BrandProductSummary, BrandsResponse, BrandProductsResponse } from '../types/brand.types';

export const brandService = {
    async getAll(): Promise<BrandWithCount[]> {
        const response = await api.get('brands').json<BrandsResponse>();
        return response.data;
    },

    async create(nombre: string): Promise<Brand> {
        const response = await api.post('brands', {
            json: { nombre }
        }).json<{ status: string, data: Brand }>();
        return response.data;
    },

    async update(id: string, nombre: string): Promise<Brand> {
        const response = await api.patch(`brands/${id}`, {
            json: { nombre }
        }).json<{ status: string, data: Brand }>();
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`brands/${id}`);
    },

    async getProducts(id: string): Promise<BrandProductSummary[]> {
        const response = await api.get(`brands/${id}/products`).json<BrandProductsResponse>();
        return response.data;
    }
};
