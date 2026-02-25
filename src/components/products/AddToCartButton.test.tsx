import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddToCartButton from './AddToCartButton';

describe('AddToCartButton Component', () => {
    const mockProduct = {
        id: '1',
        nombre: 'Product Test',
        stock: 10,
        precioActual: 100
    } as any;

    beforeEach(() => {
        vi.stubGlobal('location', { href: '' });
        localStorage.clear();
    });

    it('should render "Agregar" when stock is available', () => {
        render(<AddToCartButton product={mockProduct} />);
        expect(screen.getByText('Agregar')).toBeDefined();
    });

    it('should render "Sin Stock" and be disabled when stock is 0', () => {
        const outOfStockProduct = { ...mockProduct, stock: 0 };
        render(<AddToCartButton product={outOfStockProduct} />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('disabled')).toBeDefined();
        expect(screen.getByText('Sin Stock')).toBeDefined();
    });

    it('should redirect to login if no token on click', () => {
        render(<AddToCartButton product={mockProduct} />);
        fireEvent.click(screen.getByText('Agregar'));
        expect(window.location.href).toBe('/login');
    });

    it('should open modal if token exists', () => {
        localStorage.setItem('marketflex_token', 'valid-token');
        render(<AddToCartButton product={mockProduct} />);
        fireEvent.click(screen.getByText('Agregar'));

        // Check if modal content appears (e.g., the title in the modal)
        expect(screen.getByText(/Seleccionar Cantidad/i)).toBeDefined();
    });
});
