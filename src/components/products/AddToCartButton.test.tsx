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

        // Verificamos el estado visual y el atributo de accesibilidad
        expect(button.hasAttribute('disabled')).toBe(true);
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

        const btnAgregar = screen.getByText('Agregar');
        fireEvent.click(btnAgregar);

        expect(screen.getByText(/Confirmar y Agregar/i)).toBeDefined();

        expect(screen.getByText('Product Test')).toBeDefined();
    });
});