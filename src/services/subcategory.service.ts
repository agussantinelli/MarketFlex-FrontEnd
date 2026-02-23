import { api } from "../lib/api";
import type { Subcategory } from '../types/subcategory.types';

export const getSubcategories = async (): Promise<Subcategory[]> => {
    try {
        const response: { data: Subcategory[] } = await api.get('subcategories').json();
        return response.data;
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return [];
    }
};
