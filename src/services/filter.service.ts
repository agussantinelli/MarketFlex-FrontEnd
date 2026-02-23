import type { Category } from "../types/category.types";
import type { Subcategory } from "../types/subcategory.types";

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5979/api';

export const filterService = {
    async getCategories(): Promise<Category[]> {
        try {
            const response = await fetch(`${API_URL}/categories`);
            const result = await response.json();
            return result.status === 'success' ? result.data : [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    async getSubcategories(): Promise<Subcategory[]> {
        try {
            const response = await fetch(`${API_URL}/subcategories`);
            const result = await response.json();
            return result.status === 'success' ? result.data : [];
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            return [];
        }
    }
};
