export type Product = {
    id: string;
    nombre: string;
    descripcion: string | null;
    caracteristicas: { nombre: string; valor: string }[];
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
    promocionActiva?: {
        nombre: string;
        tipoPromocion: string;
        cantCompra: number | null;
        cantPaga: number | null;
        porcentajeDescuentoSegunda: string | null;
    } | null;
};

export type SearchOptions = {
    query?: string;
    sort?: string;
    type?: string;
    category?: string;
    offers?: string;
    page?: number;
    limit?: number;
    minPrice?: string;
    maxPrice?: string;
    withStock?: string;
    onlyOffers?: string;
    brand?: string;
    promotion?: string;
};
