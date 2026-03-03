export interface Promotion {
    id: string;
    nombre: string;
    descripcion: string | null;
    tipoPromocion: 'NxM' | 'DESCUENTO_SEGUNDA_UNIDAD' | 'PORCENTAJE';
    alcance: 'GLOBAL' | 'POR_TIPO' | 'POR_PRODUCTO';
    foto: string | null;
    esDestacado: boolean;
    estado: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE' | 'VENCIDO' | 'CANCELADO' | 'BORRADO';
    fechaInicio: string;
    fechaFin: string;
    cantCompra: number | null;
    cantPaga: number | null;
    porcentajeDescuentoSegunda: string | null;
    // Relation IDs for POR_TIPO / POR_PRODUCTO
    categoryIds?: string[];
    productIds?: string[];
}

export interface CreatePromotionInput extends Omit<Promotion, 'id' | 'estado' | 'categoryIds' | 'productIds'> {
    estado?: Promotion['estado'];
    categoryIds?: string[];
    productIds?: string[];
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
