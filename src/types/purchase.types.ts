export type DetalleEnvio = {
    nombreCompleto: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
};

export type LineaCompra = {
    productoId: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    promoAplicada?: string;
};

export type AppliedPromotion = {
    promocionId: string;
    nombre: string;
    vecesAplicada: number;
    montoDescuento: number;
};

export type Purchase = {
    id: string;
    fechaHora: string;
    total: number;
    metodoPago: string;
    cantCuotas: number;
    estado: string;
    lineas: LineaCompra[];
    detalleEnvio: DetalleEnvio;
    promociones?: AppliedPromotion[];
};

export type CreatePurchaseRequest = {
    metodoPago: 'card' | 'cash' | 'transfer';
    cantCuotas: number;
    items: {
        productoId: string;
        cantidad: number;
    }[];
    envio: DetalleEnvio;
};
