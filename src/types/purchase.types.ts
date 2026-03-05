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
    estado: 'COMPLETADO' | 'PENDIENTE' | 'CANCELADO' | 'BORRADO';
    lineas: LineaCompra[];
    detalleEnvio: DetalleEnvio;
    promociones?: AppliedPromotion[];
    tipoEntrega: 'ENVIO_DOMICILIO' | 'RETIRO_LOCAL' | 'RETIRO_SUCURSAL';
    razonPendiente?: string;
};

export type CreatePurchaseRequest = {
    metodoPago: 'Mercado Pago' | 'Efectivo';
    cantCuotas: number;
    items: {
        productoId: string;
        cantidad: number;
    }[];
    envio?: DetalleEnvio | undefined;
    ventaEnFisico: boolean;
    tipoEntrega: 'ENVIO_DOMICILIO' | 'RETIRO_LOCAL' | 'RETIRO_SUCURSAL';
};
