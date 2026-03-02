export interface Brand {
    id: string;
    nombre: string;
}

export interface BrandWithCount extends Brand {
    productCount: number;
}

export interface BrandProductSummary {
    id: string;
    nombre: string;
    foto: string | null;
    valor: string | null;
}

export interface BrandsResponse {
    status: string;
    data: BrandWithCount[];
}

export interface BrandProductsResponse {
    status: string;
    data: BrandProductSummary[];
}
