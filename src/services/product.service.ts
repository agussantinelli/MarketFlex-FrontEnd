import { api } from "../lib/api";
import type { Product } from '../types/product.types';
import type { PaginatedResponse } from '../types/common.types';

export const getProducts = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> => {
    try {
        const response: PaginatedResponse<Product> = await api.get(`products?page=${page}&limit=${limit}`).json();
        return response;
    } catch (error) {
        console.error("Error fetching products:", error);
        return {
            status: 'error',
            data: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
        };
    }
};

interface SearchOptions {
    query?: string;
    sort?: string;
    type?: string;
    category?: string;
    offers?: string;
    page?: number;
    limit?: number;
}

// Pagination interfaces moved to common.types.ts

export const searchProducts = async (options: SearchOptions): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        if (options.query) params.append("q", options.query);
        if (options.sort) params.append("sort", options.sort);
        if (options.type) params.append("type", options.type);
        if (options.category) params.append("category", options.category);
        if (options.offers) params.append("offers", options.offers);
        if (options.page) params.append("page", options.page.toString());
        if (options.limit) params.append("limit", options.limit.toString());

        return await api.get(`products/search?${params.toString()}`).json();
    } catch (error) {
        console.error("Error searching products:", error);
        return {
            status: 'error',
            data: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
        } as any;
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

export const getNewArrivals = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return await api.get(`products/new-arrivals?${params.toString()}`).json();
    } catch (error) {
        console.error("Error fetching new arrivals:", error);
        return {
            status: 'error',
            data: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
        };
    }
};

export const getBestsellers = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return await api.get(`products/bestsellers?${params.toString()}`).json();
    } catch (error) {
        console.error("Error fetching bestsellers:", error);
        return {
            status: 'error',
            data: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
        };
    }
};

export const getOffers = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return await api.get(`products/offers?${params.toString()}`).json();
    } catch (error) {
        console.error("Error fetching offers:", error);
        return {
            status: 'error',
            data: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
        };
    }
};


