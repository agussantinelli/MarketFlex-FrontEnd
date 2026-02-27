export type Brand = {
    id: string;
    nombre: string;
};

export type BrandsResponse = {
    status: string;
    data: Brand[];
};
