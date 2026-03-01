export interface Promotion {
    id: string;
    nombre: string;
    descripcion: string | null;
    tipo: 'NXM' | 'DESCUENTO_2DA' | 'PORCENTAJE';
    valor: number | null;
    alcance: 'GLOBAL' | 'POR_TIPO' | 'POR_PRODUCTO';
    foto: string | null;
    destacado: boolean;
    activo: boolean;
    prioridad: number;
    // UI Fields from plural version
    estado: 'ACTIVO' | 'PENDIENTE' | 'VENCIDO' | 'CANCELADO';
    fechaInicio: string;
    fechaFin: string;
    tipoPromocion: string;
    cantCompra: number | null;
    cantPaga: number | null;
}

export interface CreatePromotionInput {
    nombre: string;
    descripcion?: string;
    tipo: 'NXM' | 'DESCUENTO_2DA' | 'PORCENTAJE';
    valor?: number;
    alcance: 'GLOBAL' | 'POR_TIPO' | 'POR_PRODUCTO';
    foto?: string;
    destacado?: boolean;
    prioridad?: number;
}

export interface PromotionsResponse {
    promotions: Promotion[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    status?: string;
    data?: Promotion[];
}

export interface SinglePromotionResponse {
    promotion: Promotion;
    status?: string;
    data?: Promotion;
}

export interface PromotionResult {
    originalPrice: number;
    discountedPrice: number;
    appliedPromotion: Promotion | null;
    savings: number;
    // Engine fields from plural version
    subtotal: number;
    discount: number;
    total: number;
    appliedPromotions: {
        nombre: string;
        monto: number;
    }[];
}
