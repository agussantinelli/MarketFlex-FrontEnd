import { api } from '../lib/api';
import type { Product } from '../types/product.types';

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response: { data: Product[] } = await api.get('products').json();
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

interface SearchOptions {
    query?: string;
    sort?: string;
    type?: string;
    category?: string;
    offers?: string;
}

export const searchProducts = async (options: SearchOptions): Promise<Product[]> => {
    try {
        const params = new URLSearchParams();
        if (options.query) params.append("q", options.query);
        if (options.sort) params.append("sort", options.sort);
        if (options.type) params.append("type", options.type);
        if (options.category) params.append("category", options.category);
        if (options.offers) params.append("offers", options.offers);

        const response: { data: Product[] } = await api.get(`products/search?${params.toString()}`).json();
        return response.data;
    } catch (error) {
        console.error("Error searching products:", error);
        return [];
    }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    try {
        const response: { data: Product[] } = await api.get('products/featured').json();
        return response.data;
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
    }
};
