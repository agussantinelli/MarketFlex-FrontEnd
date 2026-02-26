import { persistentAtom } from '@nanostores/persistent';
import { cart, clearCart, cartTotals } from './cartStore';
import { createPurchase } from '../services/purchase.service';

export interface CheckoutState {
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
}

export const checkoutStore = persistentAtom<CheckoutState>('marketflex_checkout', {
    formData: {
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        cp: ''
    },
    paymentMethod: 'card',
    isSubmitting: false,
    error: null,
    success: false,
    lastOrderTotal: 0
}, {
    encode: JSON.stringify,
    decode: JSON.parse
});

// Actions
export const updateFormData = (data: Partial<CheckoutState['formData']>) => {
    const current = checkoutStore.get();
    checkoutStore.set({
        ...current,
        formData: { ...current.formData, ...data }
    });
};

export const updatePaymentMethod = (method: CheckoutState['paymentMethod']) => {
    const current = checkoutStore.get();
    checkoutStore.set({ ...current, paymentMethod: method });
};

export const validateFields = () => {
    const { formData } = checkoutStore.get();
    const required = ['nombre', 'email', 'telefono', 'direccion', 'ciudad', 'provincia', 'cp'];
    const missing = required.filter(key => !(formData as any)[key].trim());

    if (missing.length > 0) {
        checkoutStore.set({ ...checkoutStore.get(), error: 'Por favor, completa todos los campos obligatorios.' });
        return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        checkoutStore.set({ ...checkoutStore.get(), error: 'El email ingresado no es válido.' });
        return false;
    }

    return true;
};

export const submitPurchase = async () => {
    if (!validateFields()) return;

    const current = checkoutStore.get();
    const cartData = cart.get();

    if (cartData.items.length === 0) {
        checkoutStore.set({ ...current, error: 'El carrito está vacío.' });
        return;
    }

    checkoutStore.set({ ...current, isSubmitting: true, error: null });

    try {
        const payload = {
            metodoPago: current.paymentMethod,
            cantCuotas: 1, // Default to 1 for now
            items: cartData.items.map(item => ({
                productoId: item.id,
                cantidad: item.quantity
            })),
            envio: {
                nombreCompleto: current.formData.nombre,
                email: current.formData.email,
                telefono: current.formData.telefono,
                direccion: current.formData.direccion,
                ciudad: current.formData.ciudad,
                provincia: current.formData.provincia,
                codigoPostal: current.formData.cp
            }
        };

        const response = await createPurchase(payload);

        if (response.status === 'success') {
            const finalTotal = cartTotals.get().total;
            checkoutStore.set({
                ...checkoutStore.get(),
                isSubmitting: false,
                success: true,
                lastOrderTotal: finalTotal
            });
            clearCart();
        } else {
            checkoutStore.set({ ...checkoutStore.get(), isSubmitting: false, error: 'No se pudo procesar la compra. Verifica los productos en tu carrito.' });
        }
    } catch (err: any) {
        console.error("Purchase error:", err);
        let message = 'Error de comunicación con el servidor.';

        if (err.response) {
            try {
                const data = await err.response.json();
                message = data.message || data.error || message;

                // Map to Spanish if it's a known technical error
                if (message.toLowerCase().includes('not found')) message = 'Uno o más productos no están disponibles. Por favor, revisa tu carrito.';
                if (message.toLowerCase().includes('insufficient stock')) message = 'Stock insuficiente para completar la compra.';
            } catch (e) {
                // Keep default message
            }
        }

        checkoutStore.set({ ...checkoutStore.get(), isSubmitting: false, error: message });
    }
};

export const resetCheckout = () => {
    checkoutStore.set({
        formData: {
            nombre: '',
            email: '',
            telefono: '',
            direccion: '',
            ciudad: '',
            provincia: '',
            cp: ''
        },
        paymentMethod: 'card',
        isSubmitting: false,
        error: null,
        success: false,
        lastOrderTotal: 0
    });
};
