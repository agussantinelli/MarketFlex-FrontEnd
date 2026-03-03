import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterSaleView from './RegisterSaleView';
import { AdminService } from '../../services/admin.service';
import { api } from '../../lib/api';

// Mock AdminService and API
vi.mock('../../services/admin.service', () => ({
    AdminService: {
        searchProducts: vi.fn()
    }
}));

vi.mock('../../lib/api', () => ({
    api: {
        post: vi.fn(() => ({
            json: vi.fn()
        }))
    }
}));

// Mock window globals
(window as any).triggerSileo = vi.fn();
(window as any).showAdminLoader = vi.fn();
(window as any).hideAdminLoader = vi.fn();

const mockProduct = {
    id: 'prod-1',
    nombre: 'Zapatillas Adidas',
    precioActual: '5000',
    stock: 10
};

describe('RegisterSaleView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('completes the full 3-step registration flow', async () => {
        (AdminService.searchProducts as any).mockResolvedValue([mockProduct]);
        const mockPostJson = vi.fn().mockResolvedValue({ status: 'success' });
        (api.post as any).mockReturnValue({ json: mockPostJson });

        render(<RegisterSaleView />);

        // --- STEP 1: Product Selection ---
        const searchInput = screen.getByPlaceholderText(/Buscar productos/i);
        fireEvent.change(searchInput, { target: { value: 'zapa' } });

        await waitFor(() => {
            expect(screen.getByText('Zapatillas Adidas')).toBeDefined();
        });

        // Click on result to add
        fireEvent.click(screen.getByText('Zapatillas Adidas'));

        expect(screen.getByText(/Productos Seleccionados/i)).toBeDefined();
        expect(screen.getByText('Zapatillas Adidas')).toBeDefined();

        // Go to next step
        fireEvent.click(screen.getByText(/Siguiente/i));

        // --- STEP 2: Sale Details ---
        expect(screen.getByText(/Método de Pago/i)).toBeDefined();
        expect(screen.getByText(/Venta en físico/i)).toBeDefined();

        // Change payment method
        fireEvent.click(screen.getByText(/Tarjeta/i));

        // Go to next step
        fireEvent.click(screen.getByText(/Siguiente/i));

        // --- STEP 3: Confirmation ---
        expect(screen.getByText(/Resumen de la Venta/i)).toBeDefined();
        expect(screen.getByText(/\$5000/)).toBeDefined();

        // Confirm Sale
        const confirmBtn = screen.getByText(/Confirmar Venta/i);
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('purchases', expect.objectContaining({
                json: expect.objectContaining({
                    metodoPago: 'card',
                    ventaEnFisico: true
                })
            }));
            expect((window as any).triggerSileo).toHaveBeenCalledWith('success', expect.stringContaining('éxito'));
        });
    });

    it('disables "Siguiente" if no products are selected in Step 1', () => {
        render(<RegisterSaleView />);
        const nextBtn = screen.getByText(/Siguiente/i);
        expect(nextBtn).toHaveAttribute('disabled');
    });

    it('updates quantity in Step 1', async () => {
        (AdminService.searchProducts as any).mockResolvedValue([mockProduct]);
        render(<RegisterSaleView />);

        const searchInput = screen.getByPlaceholderText(/Buscar productos/i);
        fireEvent.change(searchInput, { target: { value: 'zapa' } });

        await waitFor(() => fireEvent.click(screen.getByText('Zapatillas Adidas')));

        const plusBtn = screen.getByText('+');
        fireEvent.click(plusBtn);

        expect(screen.getByText('2')).toBeDefined(); // Quantity spans "2"
    });
});
