export interface Promotion {
    id: string;
    nombre: string;
    descripcion: string | null;
    fechaInicio: string;
    fechaFin: string;
    estado: 'ACTIVO' | 'PENDIENTE' | 'VENCIDO' | 'CANCELADO';
    foto: string | null;
    esDestacado: boolean;
    tipoPromocion: string;
    cantCompra: number | null;
    cantPaga: number | null;
    porcentajeDescuentoSegunda: string | null;
    alcance: 'GLOBAL' | 'POR_TIPO' | 'POR_PRODUCTO';
}

export interface CreatePromotionInput extends Omit<Promotion, 'id'> {
    id?: string;
}

export interface PromotionsResponse {
    status: string;
    data: Promotion[];
}

export interface SinglePromotionResponse {
    status: string;
    data: Promotion;
}
