export interface Subcategory {
    categoriaId: string;
    nroSubcategoria: number;
    nombre: string;
    productCount?: number;
}

export interface SubcategoriesResponse {
    status: string;
    data: Subcategory[];
}

export interface SubcategoryActionResponse {
    status: string;
    data: Subcategory;
}
