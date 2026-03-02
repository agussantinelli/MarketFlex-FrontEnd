import { api } from "../lib/api";
import type {
    CategoriesResponse,
    CategoryWithCount,
    Category,
    CategoryProductsResponse,
    CategoryProductSummary,
    CategoryActionResponse
} from "../types/category.types";

export async function getCategories(): Promise<CategoryWithCount[]> {
    try {
        const data = await api.get('categories').json<CategoriesResponse>();
        return data.status === "success" ? data.data : [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function getProductsByCategory(id: string): Promise<CategoryProductSummary[]> {
    try {
        const data = await api.get(`categories/${id}/products`).json<CategoryProductsResponse>();
        return data.status === "success" ? data.data : [];
    } catch (error) {
        console.error("Error fetching category products:", error);
        return [];
    }
}

export async function createCategory(nombre: string): Promise<Category | null> {
    try {
        const data = await api.post('categories', { json: { nombre } }).json<CategoryActionResponse>();
        return data.status === "success" ? data.data : null;
    } catch (error) {
        console.error("Error creating category:", error);
        return null;
    }
}

export async function updateCategory(id: string, nombre: string): Promise<Category | null> {
    try {
        const data = await api.patch(`categories/${id}`, { json: { nombre } }).json<CategoryActionResponse>();
        return data.status === "success" ? data.data : null;
    } catch (error) {
        console.error("Error updating category:", error);
        return null;
    }
}

export async function deleteCategory(id: string): Promise<boolean> {
    try {
        const data = await api.delete(`categories/${id}`).json<CategoryActionResponse>();
        return data.status === "success";
    } catch (error) {
        console.error("Error deleting category:", error);
        return false;
    }
}
