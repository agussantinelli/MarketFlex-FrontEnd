import { api } from "../lib/api";
import type { Product, SearchOptions } from '../types/product.types';
import type { PaginatedResponse } from '../types/common.types';

export const getProducts = async (page: number = 1, limit: number = 20, minPrice?: string, maxPrice?: string, brand?: string): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (brand) params.append("brand", brand);

        const response: PaginatedResponse<Product> = await api.get(`products?${params.toString()}`).json();
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
        if (options.minPrice) params.append("minPrice", options.minPrice);
        if (options.maxPrice) params.append("maxPrice", options.maxPrice);
        if (options.withStock) params.append("withStock", options.withStock);
        if (options.onlyOffers) params.append("onlyOffers", options.onlyOffers);
        if (options.brand) params.append("brand", options.brand);
        if (options.promotion) params.append("promotion", options.promotion);

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

export const getNewArrivals = async (page: number = 1, limit: number = 20, sort?: string, minPrice?: string, maxPrice?: string, withStock?: string, onlyOffers?: string, brand?: string): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (sort) params.append("sort", sort);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (withStock) params.append("withStock", withStock);
        if (onlyOffers) params.append("onlyOffers", onlyOffers);
        if (brand) params.append("brand", brand);

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

export const getBestsellers = async (page: number = 1, limit: number = 20, minPrice?: string, maxPrice?: string, withStock?: string, onlyOffers?: string, brand?: string): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (withStock) params.append("withStock", withStock);
        if (onlyOffers) params.append("onlyOffers", onlyOffers);
        if (brand) params.append("brand", brand);

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

export const getOffers = async (page: number = 1, limit: number = 20, sort?: string, minPrice?: string, maxPrice?: string, withStock?: string, promotion?: string, brand?: string): Promise<PaginatedResponse<Product>> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (sort) params.append("sort", sort);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (withStock) params.append("withStock", withStock);
        if (promotion) params.append("promotion", promotion);
        if (brand) params.append("brand", brand);

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

export const getProductById = async (id: string): Promise<Product | null> => {
    try {
        const response: { data: Product } = await api.get(`products/${id}`).json();
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        return null;
    }
};
