export interface Product {
    id: number;
    nombre: string;
    caracteristicas: string;
    foto: string;
    categorias: string[];
    precioActual: string | null;
}
