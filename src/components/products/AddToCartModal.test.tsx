import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddToCartModal from './AddToCartModal';
import * as cartStore from '../../store/cartStore';

vi.mock('../../store/cartStore', () => ({
    addItem: vi.fn(),
}));

describe('AddToCartModal Component', () => {
    const mockProduct = {
        id: '1',
        nombre: 'Product Test',
        precioActual: 100,
        precioConDescuento: null
    } as any;

    const mockOnClose = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        // Mock Sileo
        (window as any).triggerSileo = vi.fn();
    });

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <AddToCartModal
                isOpen={false}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render product name and controls when open', async () => {
        render(
            <AddToCartModal
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        // Wait for potential effects
        expect(await screen.findByText('Product Test')).toBeDefined();
        expect(screen.getByText('1')).toBeDefined(); // Initial quantity
    });

    it('should increment and decrement quantity', async () => {
        render(
            <AddToCartModal
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        const incBtn = screen.getByLabelText('Aumentar cantidad');
        const decBtn = screen.getByLabelText('Disminuir cantidad');

        fireEvent.click(incBtn);
        expect(screen.getByText('2')).toBeDefined();
        expect(screen.getByText('$200.00')).toBeDefined();

        fireEvent.click(decBtn);
        expect(screen.getByText('1')).toBeDefined();
        expect(screen.getByText('$100.00')).toBeDefined();
    });

    it('should call addItem and triggerSileo on confirm', async () => {
        (cartStore.addItem as any).mockReturnValue({ success: true });

        render(
            <AddToCartModal
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
                onConfirm={mockOnConfirm}
            />
        );

        fireEvent.click(screen.getByText(/Confirmar y Agregar/i));

        expect(cartStore.addItem).toHaveBeenCalledWith(mockProduct, 1);
        expect((window as any).triggerSileo).toHaveBeenCalledWith('success', expect.any(String), expect.anything());
        expect(mockOnConfirm).toHaveBeenCalledWith(1);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
