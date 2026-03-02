export interface Category {
    id: string;
    nombre: string;
}

export interface CategoryWithCount extends Category {
    productCount: number;
}

export interface CategoryProductSummary {
    id: string;
    nombre: string;
    foto: string | null;
    valor: string | null;
}

export interface CategoriesResponse {
    status: string;
    data: CategoryWithCount[];
}

export interface CategoryProductsResponse {
    status: string;
    data: CategoryProductSummary[];
}

export interface CategoryActionResponse {
    status: string;
    data: Category;
}
