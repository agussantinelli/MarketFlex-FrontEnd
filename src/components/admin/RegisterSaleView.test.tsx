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
            expect(screen.getAllByText('Zapatillas Adidas').length).toBeGreaterThan(0);
        });

        // Click on plus button to add
        const addBtn = screen.getByLabelText(/Agregar producto/i);
        fireEvent.click(addBtn);

        expect(screen.getByText(/Productos Seleccionados/i)).toBeDefined();
        expect(screen.getAllByText('Zapatillas Adidas').length).toBeGreaterThan(1);

        // Go to next step
        fireEvent.click(screen.getByText(/Siguiente/i));

        // --- STEP 2: Sale Details ---
        expect(screen.getByText(/Método de Pago/i)).toBeDefined();
        expect(screen.getByText(/Método de Entrega/i)).toBeDefined();

        // Change payment method
        fireEvent.click(screen.getByText(/Mercado Pago/i));

        // Go to next step
        fireEvent.click(screen.getByText(/Siguiente/i));

        // --- STEP 3: Confirmation ---
        expect(screen.getByText(/Resumen de la Venta/i)).toBeDefined();
        expect(screen.getAllByText(/5.*000/).length).toBeGreaterThan(0);

        // Confirm Sale
        const confirmBtn = screen.getByText(/Confirmar Venta/i);
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('purchases', expect.objectContaining({
                json: expect.objectContaining({
                    metodoPago: 'Mercado Pago',
                    ventaEnFisico: true
                })
            }));
            expect((window as any).triggerSileo).toHaveBeenCalledWith('success', expect.stringContaining('éxito'));
        });
    });

    it('disables "Siguiente" if no products are selected in Step 1', () => {
        render(<RegisterSaleView />);
        const nextBtn = screen.getByText(/Siguiente/i);
        expect(nextBtn.hasAttribute('disabled')).toBe(true);
    });

    it('updates quantity in Step 1', async () => {
        (AdminService.searchProducts as any).mockResolvedValue([mockProduct]);
        render(<RegisterSaleView />);

        const searchInput = screen.getByPlaceholderText(/Buscar productos/i);
        fireEvent.change(searchInput, { target: { value: 'zapa' } });

        await waitFor(() => {
            const addBtn = screen.getByLabelText(/Agregar producto/i);
            fireEvent.click(addBtn);
        });

        const plusBtn = screen.getByLabelText(/Aumentar cantidad/i);
        fireEvent.click(plusBtn);

        expect(screen.getAllByText(/5.*000.*2/).length).toBeGreaterThan(0);
    });

    it('triggers Sileo notifications when adding/removing products', async () => {
        (AdminService.searchProducts as any).mockResolvedValue([{ id: 'p1', nombre: 'Test Prod', precioActual: 100, stock: 10, foto: null }]);

        render(<RegisterSaleView />);
        const searchInput = screen.getByPlaceholderText(/Buscar productos/i);
        fireEvent.change(searchInput, { target: { value: 'test' } });

        await waitFor(() => {
            const addBtn = screen.getByLabelText(/Agregar producto/i);
            fireEvent.click(addBtn);
        });

        expect((window as any).triggerSileo).toHaveBeenCalledWith('info', expect.stringContaining('Test Prod añadido'));

        const removeBtn = screen.getByLabelText(/Eliminar producto/i);
        fireEvent.click(removeBtn);

        expect((window as any).triggerSileo).toHaveBeenCalledWith('info', expect.stringContaining('Producto eliminado: Test Prod'));
    });
});
