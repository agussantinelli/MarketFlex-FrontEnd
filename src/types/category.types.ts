export type Category = {
    id: string;
    nombre: string;
};

export type CategoriesResponse = {
    status: string;
    data: Category[];
};
