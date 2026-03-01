export type Subcategory = {
    categoriaId: string;
    nroSubcategoria: number;
    nombre: string;
};

export type SubcategoriesResponse = {
    status: string;
    data: Subcategory[];
};
