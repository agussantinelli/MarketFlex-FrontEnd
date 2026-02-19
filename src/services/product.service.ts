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
