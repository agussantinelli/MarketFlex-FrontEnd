import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initCheckoutSuccess } from './checkout-success';
import { checkoutStore } from '../store/checkoutStore';

describe('Checkout Success Script', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = `
            <div id="monto-valor"></div>
            <a href="/">Home</a>
            <a href="/products">Products</a>
        `;
    });

    it('should display the last order total', () => {
        checkoutStore.set({
            formData: { nombre: '', email: '', telefono: '', direccion: '', ciudad: '', provincia: '', cp: '' },
            paymentMethod: 'card',
            isSubmitting: false,
            success: true,
            lastOrderTotal: 1500.50,
            error: null
        });

        initCheckoutSuccess();

        const montoValor = document.getElementById("monto-valor");
        // Check for specific formatted output. 
        // toLocaleString varies by node version so we just check it was inserted and includes numbers
        expect(montoValor?.innerText).toContain('$1');
        expect(montoValor?.innerText).toContain('500');
    });

    it('should reset store on link click', () => {
        checkoutStore.set({
            formData: { nombre: 'A', email: 'A', telefono: 'A', direccion: 'A', ciudad: 'A', provincia: 'A', cp: 'A' },
            paymentMethod: 'card',
            isSubmitting: false,
            success: true,
            lastOrderTotal: 100,
            error: null
        });

        initCheckoutSuccess();

        const link = document.querySelector('a');
        link?.dispatchEvent(new Event('click'));

        // Store should be reset to defaults
        const store = checkoutStore.get();
        expect(store.success).toBe(false);
        expect(store.lastOrderTotal).toBe(0);
        expect(store.formData.nombre).toBe('');
    });
});
