export type CheckoutState = {
    formData: {
        nombre: string;
        email: string;
        telefono: string;
        direccion: string;
        ciudad: string;
        provincia: string;
        cp: string;
    };
    paymentMethod: 'Mercado Pago' | 'Efectivo';
    tipoEntrega: 'ENVIO_DOMICILIO' | 'RETIRO_LOCAL';
    ventaEnFisico: boolean;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
    lastOrderTotal: number;
};
