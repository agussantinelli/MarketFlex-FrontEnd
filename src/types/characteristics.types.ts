export interface Characteristic {
    id: string;
    nombre: string;
    productCount: number;
}

export interface ProductSummary {
    id: string;
    nombre: string;
    foto: string | null;
    valor: string | null;
}
