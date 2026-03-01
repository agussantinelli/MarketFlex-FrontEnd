import { api } from "../lib/api";
import type { CategoriesResponse, Category } from "../types/category.types";

export async function getCategories(): Promise<Category[]> {
    try {
        const data = await api.get('categories').json<CategoriesResponse>();
        return data.status === "success" ? data.data : [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
