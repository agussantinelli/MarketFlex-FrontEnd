import { api } from "../api/client";
import type { ProductType } from '../types/product-type.types';

export const getProductTypes = async (): Promise<ProductType[]> => {
    try {
        const response: { data: ProductType[] } = await api.get('product-types').json();
        return response.data;
    } catch (error) {
        console.error("Error fetching product types:", error);
        return [];
    }
};
