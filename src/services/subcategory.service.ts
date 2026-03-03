import { api } from "../lib/api";
import type { Subcategory, SubcategoriesResponse, SubcategoryActionResponse } from "../types/subcategory.types";
import type { CategoryProductSummary, CategoryProductsResponse } from "../types/category.types";

export const subcategoryService = {
    async getSubcategories(categoriaId: string): Promise<Subcategory[]> {
        const data = await api.get('subcategories', {
            searchParams: { categoriaId }
        }).json<SubcategoriesResponse>();
        return data.data;
    },

    async getProductsBySubcategory(categoriaId: string, nroSubcategoria: number): Promise<CategoryProductSummary[]> {
        const data = await api.get(`subcategories/${categoriaId}/${nroSubcategoria}/products`).json<CategoryProductsResponse>();
        return data.data;
    },

    async createSubcategory(categoriaId: string, nombre: string): Promise<Subcategory> {
        const data = await api.post('subcategories', {
            json: { categoriaId, nombre }
        }).json<SubcategoryActionResponse>();
        return data.data;
    },

    async updateSubcategory(categoriaId: string, nroSubcategoria: number, nombre: string): Promise<Subcategory> {
        const data = await api.patch(`subcategories/${categoriaId}/${nroSubcategoria}`, {
            json: { nombre }
        }).json<SubcategoryActionResponse>();
        return data.data;
    },

    async deleteSubcategory(categoriaId: string, nroSubcategoria: number): Promise<boolean> {
        const data = await api.delete(`subcategories/${categoriaId}/${nroSubcategoria}`).json<{ status: string }>();
        return data.status === "success";
    }
};
