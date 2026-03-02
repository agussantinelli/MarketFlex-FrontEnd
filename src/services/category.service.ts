import { api } from "../lib/api";
import type {
    CategoriesResponse,
    CategoryWithCount,
    Category,
    CategoryProductsResponse,
    CategoryProductSummary,
    CategoryActionResponse
} from "../types/category.types";

export const categoryService = {
    async getCategories(): Promise<CategoryWithCount[]> {
        const data = await api.get('categories').json<CategoriesResponse>();
        return data.data;
    },

    async getProductsByCategory(id: string): Promise<CategoryProductSummary[]> {
        const data = await api.get(`categories/${id}/products`).json<CategoryProductsResponse>();
        return data.data;
    },

    async createCategory(nombre: string): Promise<Category> {
        const data = await api.post('categories', { json: { nombre } }).json<CategoryActionResponse>();
        return data.data;
    },

    async updateCategory(id: string, nombre: string): Promise<Category> {
        const data = await api.patch(`categories/${id}`, { json: { nombre } }).json<CategoryActionResponse>();
        return data.data;
    },

    async deleteCategory(id: string): Promise<boolean> {
        const data = await api.delete(`categories/${id}`).json<CategoryActionResponse>();
        return data.status === "success";
    }
};
