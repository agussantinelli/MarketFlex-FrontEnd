import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import CheckoutSummary from './CheckoutSummary';

// Mock data that can be updated from tests
const mockState = vi.hoisted(() => ({
    items: [] as any[],
    totals: {
        subtotal: 0,
        discount: 0,
        total: 0,
        appliedPromotions: [] as any[]
    },
    checkout: {
        isSubmitting: false,
        success: false,
        error: null as string | null
    }
}));

vi.mock('@nanostores/react', () => ({
    useStore: vi.fn((store: any) => {
        if (store?.id === 'cartItems') return mockState.items;
        if (store?.id === 'cartTotals') return mockState.totals;
        if (store?.id === 'checkoutStore') return mockState.checkout;
        return {};
    })
}));

vi.mock('../../store/cartStore', () => ({
    cartItems: { id: 'cartItems', get: () => mockState.items },
    cartTotals: { id: 'cartTotals', get: () => mockState.totals }
}));

vi.mock('../../store/checkoutStore', () => ({
    checkoutStore: { id: 'checkoutStore', get: () => mockState.checkout },
    submitPurchase: vi.fn(),
    resetCheckout: vi.fn()
}));

describe('CheckoutSummary Component', () => {
    beforeEach(() => {
        mockState.items = [];
        mockState.totals = {
            subtotal: 0,
            discount: 0,
            total: 0,
            appliedPromotions: []
        };
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should render empty state when cart is empty', () => {
        render(<CheckoutSummary />);
        expect(screen.getByText(/No hay productos en tu carrito/i)).toBeDefined();
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
            appliedPromotions: [
                { nombre: 'Descuento Test', monto: 20 }
            ]
        };

        // Update mock state
        mockState.items = mockItems;
        mockState.totals = mockTotals;

        render(<CheckoutSummary />);

        expect(screen.getByText('Producto Test')).toBeDefined();
        expect(screen.getByText('Cant: 2')).toBeDefined();
        expect(screen.getAllByText('$200')).toBeDefined();
        expect(screen.getByText(/Descuento Test/i)).toBeDefined();
        expect(screen.getByText('-$20')).toBeDefined();
        expect(screen.getByText('$180')).toBeDefined();
    });

    it('should show success message when state is success', () => {
        // Set success state
        mockState.items = [{ id: '1', nombre: 'Test', precioActual: 10, quantity: 1, foto: 'test.jpg' }];
        mockState.totals = { subtotal: 10, discount: 0, total: 10, appliedPromotions: [] };
        mockState.checkout.success = true;

        render(<CheckoutSummary />);

        expect(screen.getByText(/¡Pedido Recibido!/i)).toBeDefined();
        expect(screen.getByText(/Gracias por tu compra/i)).toBeDefined();
    });
});
