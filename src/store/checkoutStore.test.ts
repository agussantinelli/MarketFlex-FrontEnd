import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutStore, updateFormData, updatePaymentMethod, validateFields, submitPurchase, resetCheckout } from './checkoutStore';
import { cart } from './cartStore';
import * as purchaseService from '../services/purchase.service';

vi.mock('../services/purchase.service', () => ({
    createPurchase: vi.fn()
}));

describe('Checkout Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetCheckout();
        // Reset cart for clean state
        cart.set({ items: [] });
    });

    it('should update form data', () => {
        updateFormData({ nombre: 'Test Name' });
        expect(checkoutStore.get().formData.nombre).toBe('Test Name');

        updateFormData({ email: 'test@test.com', ciudad: 'NY' });
        expect(checkoutStore.get().formData.email).toBe('test@test.com');
        expect(checkoutStore.get().formData.ciudad).toBe('NY');
    });

    it('should update payment method', () => {
        updatePaymentMethod('cash');
        expect(checkoutStore.get().paymentMethod).toBe('cash');
    });

    it('validateFields should fail if required fields are missing', () => {
        updateFormData({ nombre: '' });
        const isValid = validateFields();
        expect(isValid).toBe(false);
        expect(checkoutStore.get().error).toContain('campos obligatorios');
    });

    it('validateFields should fail if email is invalid', () => {
        updateFormData({
            nombre: 'Test Name',
            telefono: '123',
            direccion: 'Main St',
            ciudad: 'NY',
            provincia: 'NY',
            cp: '10001',
            email: 'invalid-email'
        });
        const isValid = validateFields();
        expect(isValid).toBe(false);
        expect(checkoutStore.get().error).toContain('email ingresado no es válido');
    });

    it('validateFields should pass if all fields are valid', () => {
        updateFormData({
            nombre: 'Test Name',
            telefono: '123',
            direccion: 'Main St',
            ciudad: 'NY',
            provincia: 'NY',
            cp: '10001',
            email: 'valid@example.com'
        });
        const isValid = validateFields();
        expect(isValid).toBe(true);
    });

    it('submitPurchase should not submit if fields are invalid', async () => {
        await submitPurchase();
        expect(purchaseService.createPurchase).not.toHaveBeenCalled();
    });

    it('submitPurchase should fail if cart is empty', async () => {
        updateFormData({
            nombre: 'Test Name', telefono: '123', direccion: 'Main St',
            ciudad: 'NY', provincia: 'NY', cp: '10001', email: 'valid@example.com'
        });
        await submitPurchase();
        expect(checkoutStore.get().error).toBe('El carrito está vacío.');
        expect(purchaseService.createPurchase).not.toHaveBeenCalled();
    });

    it('submitPurchase should hit the API and handle success', async () => {
        updateFormData({
            nombre: 'Test Name', telefono: '123', direccion: 'Main St',
            ciudad: 'NY', provincia: 'NY', cp: '10001', email: 'valid@example.com'
        });
        cart.set({
            items: [{
                id: 'prod-1', nombre: 'P1', precioActual: 10, precioConDescuento: 10, quantity: 1, stock: 10,
                foto: '', caracteristicas: [], esDestacado: false, envioGratis: false, categoria: null,
                subcategoria: null, descripcion: null, descuentoActivo: null, marca: null, autor: null, fechaLlegada: null
            }]
        });

        (purchaseService.createPurchase as any).mockResolvedValue({ status: 'success' });

        await submitPurchase();

        expect(purchaseService.createPurchase).toHaveBeenCalled();
        expect(checkoutStore.get().success).toBe(true);
        expect(checkoutStore.get().isSubmitting).toBe(false);
        // cart should be cleared
        expect(cart.get().items.length).toBe(0);
    });

    it('submitPurchase should handle API failure gracefully', async () => {
        updateFormData({
            nombre: 'Test Name', telefono: '123', direccion: 'Main St',
            ciudad: 'NY', provincia: 'NY', cp: '10001', email: 'valid@example.com'
        });
        cart.set({
            items: [{
                id: 'prod-1', nombre: 'P1', precioActual: 10, precioConDescuento: 10, quantity: 1, stock: 10,
                foto: '', caracteristicas: [], esDestacado: false, envioGratis: false, categoria: null,
                subcategoria: null, descripcion: null, descuentoActivo: null, marca: null, autor: null, fechaLlegada: null
            }]
        });

        (purchaseService.createPurchase as any).mockResolvedValue({ status: 'error', message: 'Failed' });

        await submitPurchase();

        expect(purchaseService.createPurchase).toHaveBeenCalled();
        expect(checkoutStore.get().success).toBe(false);
        expect(checkoutStore.get().error).toBe('No se pudo procesar la compra. Verifica los productos en tu carrito.');
        // cart should NOT be cleared
        expect(cart.get().items.length).toBe(1);
    });
});
