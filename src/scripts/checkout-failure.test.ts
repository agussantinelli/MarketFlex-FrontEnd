import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initCheckoutFailure } from './checkout-failure';
import { checkoutStore } from '../store/checkoutStore';

describe('Checkout Failure Script', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('should log error if store has an error', () => {
        checkoutStore.set({
            formData: { nombre: '', email: '', telefono: '', direccion: '', ciudad: '', provincia: '', cp: '' },
            paymentMethod: 'card',
            isSubmitting: false,
            success: false,
            lastOrderTotal: 0,
            error: 'Test Error'
        });

        initCheckoutFailure();

        expect(consoleErrorSpy).toHaveBeenCalledWith("Failure page reached with store error:", "Test Error");
    });

    it('should not log error if store has no error', () => {
        checkoutStore.set({
            formData: { nombre: '', email: '', telefono: '', direccion: '', ciudad: '', provincia: '', cp: '' },
            paymentMethod: 'card',
            isSubmitting: false,
            success: false,
            lastOrderTotal: 0,
            error: null
        });

        initCheckoutFailure();

        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
});
