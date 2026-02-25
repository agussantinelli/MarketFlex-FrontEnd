import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CheckoutSummary from './CheckoutSummary';

// Mock data that can be updated from tests
const mockState = vi.hoisted(() => ({
    items: [] as any[],
    totals: {
        subtotal: 0,
        discount: 0,
        total: 0,
        appliedPromotions: [] as any[]
    }
}));

vi.mock('../../store/cartStore', () => ({
    cartItems: {
        get: () => mockState.items,
        subscribe: (cb: any) => {
            return () => { };
        }
    },
    cartTotals: {
        get: () => mockState.totals,
        subscribe: (cb: any) => {
            return () => { };
        }
    }
}));

describe('CheckoutSummary Component', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        mockState.items = [];
        mockState.totals = {
            subtotal: 0,
            discount: 0,
            total: 0,
            appliedPromotions: []
        };
    });

    it('should render empty state when cart is empty', () => {
        render(<CheckoutSummary />);
        expect(screen.getByText(/Tu carrito está vacío/i)).toBeDefined();
    });

    it('should render items and totals when cart has items', () => {
        const mockItems = [
            {
                id: '1',
                nombre: 'Producto Test',
                precioActual: 100,
                quantity: 2,
                foto: 'test.jpg'
            }
        ];

        const mockTotals = {
            subtotal: 200,
            discount: 20,
            total: 180,
            appliedPromotions: []
        };

        // Update mock state
        mockState.items = mockItems;
        mockState.totals = mockTotals;

        render(<CheckoutSummary />);

        expect(screen.getByText('Producto Test')).toBeDefined();
        expect(screen.getByText('Cant: 2')).toBeDefined();
        expect(screen.getByText('$200')).toBeDefined();
        expect(screen.getByText('-$20')).toBeDefined();
        expect(screen.getByText('$180')).toBeDefined();
    });

    it('should show success message after "Confirmar Compra"', () => {
        // Mock cart items so it's not empty
        mockState.items = [{ id: '1', nombre: 'Test', precioActual: 10, quantity: 1, foto: 'test.jpg' }];
        mockState.totals = { subtotal: 10, discount: 0, total: 10, appliedPromotions: [] };

        render(<CheckoutSummary />);

        const confirmBtn = screen.getByText(/Confirmar Compra/i);
        fireEvent.click(confirmBtn);

        expect(screen.getByText(/¡Pedido Recibido!/i)).toBeDefined();
        expect(screen.getByText(/Gracias por tu compra/i)).toBeDefined();
    });
});
