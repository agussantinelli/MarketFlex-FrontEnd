import { api } from '../lib/api';
import type { Category } from '../types/category.types';

export const getCategories = async (): Promise<Category[]> => {
    try {
        const response: { data: Category[] } = await api.get('categories').json();
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};
