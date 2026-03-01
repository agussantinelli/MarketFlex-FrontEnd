import { api } from "../lib/api";
import type { SubcategoriesResponse, Subcategory } from "../types/subcategory.types";

export async function getSubcategories(): Promise<Subcategory[]> {
    try {
        const data = await api.get('subcategories').json<SubcategoriesResponse>();
        return data.status === "success" ? data.data : [];
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return [];
    }
}
