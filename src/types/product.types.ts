export type Product = {
    id: string;
    nombre: string;
    caracteristicas: string | null;
    foto: string | null;
    categoria: string | null;
    subcategoria: string | null;
    precioActual: number | null;
    precioConDescuento: number | null;
    descuentoActivo: {
        nombre: string;
        porcentaje: number | null;
        montoFijo: number | null;
    } | null;
    esDestacado: boolean;
    stock: number;
    envioGratis: boolean;
    marca: string | null;
    autor: string | null;
    fechaLlegada: string | null;
};
