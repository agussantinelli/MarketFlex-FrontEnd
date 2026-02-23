export type Promotion = {
    id: string;
    nombre: string;
    descripcion: string | null;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    foto: string | null;
    esDestacado: boolean;
    tipoPromocion: string;
    cantCompra: number | null;
    cantPaga: number | null;
    porcentajeDescuentoSegunda: string | null;
    alcance: string;
};
