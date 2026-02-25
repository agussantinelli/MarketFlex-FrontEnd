import { describe, it, expect, beforeEach } from 'vitest';
import { cartItems, cartCount, cartTotals, addItem, removeItem, clearCart } from './cartStore';

describe('Cart Store', () => {
    beforeEach(() => {
        clearCart();
    });

    it('should start with an empty cart', () => {
        expect(cartItems.get()).toEqual([]);
        expect(cartCount.get()).toBe(0);
    });

    it('should add items to the cart', () => {
        const item = { id: '1', nombre: 'P1', precioActual: 100, stock: 10 } as any;
        addItem(item, 1);

        expect(cartItems.get()).toHaveLength(1);
        expect(cartItems.get()[0]?.quantity).toBe(1);
        expect(cartCount.get()).toBe(1);
    });

    it('should increment quantity if same item added', () => {
        const item = { id: '1', nombre: 'P1', precioActual: 100, stock: 10 } as any;
        addItem(item, 1);
        addItem(item, 1);

        expect(cartItems.get()).toHaveLength(1);
        expect(cartItems.get()[0]?.quantity).toBe(2);
        expect(cartCount.get()).toBe(2);
    });

    it('should remove items from the cart', () => {
        const item = { id: '1', nombre: 'P1', precioActual: 100, stock: 10 } as any;
        addItem(item, 1);
        removeItem('1');

        expect(cartItems.get()).toHaveLength(0);
    });

    it('should calculate totals correctly via computed atom', () => {
        addItem({ id: '1', nombre: 'P1', precioActual: 100, stock: 10 } as any, 1);
        addItem({ id: '2', nombre: 'P2', precioActual: 200, stock: 10 } as any, 1);

        const totals = cartTotals.get();
        expect(totals.subtotal).toBe(300);
        expect(totals.total).toBe(300);
    });
});
