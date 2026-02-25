import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import CartView from './CartView';

// Mock nanostores
const mockItems = vi.hoisted(() => ({ value: [] as any[] }));
const mockTotals = vi.hoisted(() => ({ value: { subtotal: 0, total: 0, appliedPromotions: [] } as any }));

vi.mock('@nanostores/react', () => ({
    useStore: (store: any) => {
        if (store === 'cartItems') return mockItems.value;
        if (store === 'cartTotals') return mockTotals.value;
        return [];
    }
}));

vi.mock('../../store/cartStore', () => ({
    cartItems: 'cartItems',
    cartTotals: 'cartTotals',
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
}));

describe('CartView Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockItems.value = [];
        mockTotals.value = { subtotal: 0, total: 0, appliedPromotions: [] };
    });

    it('should show loading spinner initially', () => {
        render(<CartView />);
        expect(screen.getByText(/Cargando tu carrito/i)).toBeDefined();
    });

    it('should show empty cart state after loading', async () => {
        render(<CartView />);

        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(screen.getByText(/Tu carrito está vacío/i)).toBeDefined();
    });

    it('should render items and totals', async () => {
        mockItems.value = [
            { id: '1', nombre: 'Product Test', quantity: 2, precioActual: 100, foto: '' }
        ];
        mockTotals.value = { subtotal: 200, total: 200, appliedPromotions: [] };

        render(<CartView />);

        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(screen.getByText('Product Test')).toBeDefined();
        expect(screen.getByText('2')).toBeDefined();
        expect(screen.getByText('$200.00')).toBeDefined();
    });
});
