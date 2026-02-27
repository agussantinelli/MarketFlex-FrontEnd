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
    paymentMethod: 'card' | 'cash' | 'transfer';
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
    lastOrderTotal: number;
};
