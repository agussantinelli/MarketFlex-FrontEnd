export type Product = {
    id: number;
    nombre: string;
    caracteristicas: string | null;
    foto: string | null;
    categorias: string[];
    precioActual: string | null;
    esDestacado: boolean;
};
