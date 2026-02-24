export interface Brand {
    id: string;
    nombre: string;
}

export interface BrandsResponse {
    status: string;
    data: Brand[];
}
