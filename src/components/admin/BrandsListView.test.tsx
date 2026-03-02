import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BrandsListView from './BrandsListView';
import { brandService } from '../../services/brand.service';

vi.mock('../../services/brand.service', () => ({
    brandService: {
        getAll: vi.fn(),
        getProducts: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('BrandsListView', () => {
    const mockBrands = [
        { id: '1', nombre: 'Nike', productCount: 5 },
        { id: '2', nombre: 'Adidas', productCount: 2 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (brandService.getAll as any).mockResolvedValue(mockBrands);
        // Mock global window functions to avoid errors
        (window as any).showAdminLoader = vi.fn();
        (window as any).hideAdminLoader = vi.fn();
        (window as any).triggerSileo = vi.fn();
    });

    it('renders the brands table', async () => {
        render(<BrandsListView />);

        await waitFor(() => {
            expect(brandService.getAll).toHaveBeenCalled();
        });

        expect(await screen.findByText(/Gestión de Marcas/i)).toBeDefined();
        expect(await screen.findByText('Nike')).toBeDefined();
        expect(await screen.findByText('Adidas')).toBeDefined();
        expect(screen.getByText('5 productos')).toBeDefined();
    });

    it('opens the create modal and calls the service', async () => {
        (brandService.create as any).mockResolvedValue({ id: '3', nombre: 'Puma' });
        render(<BrandsListView />);

        const createBtn = await screen.findByRole('button', { name: /nueva marca/i });
        fireEvent.click(createBtn);

        expect(await screen.findByRole('heading', { name: /nueva marca/i })).toBeDefined();

        const input = screen.getByPlaceholderText(/Ej: Nike, Adidas, Salamandra.../i);
        fireEvent.change(input, { target: { value: 'Puma' } });

        const submitBtn = screen.getByText('Crear Marca');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(brandService.create).toHaveBeenCalledWith('Puma');
        });
    });

    it('opens the view products modal', async () => {
        const mockProducts = [{ id: 'p1', nombre: 'Zapatillas', foto: null, valor: null }];
        (brandService.getProducts as any).mockResolvedValue(mockProducts);

        render(<BrandsListView />);
        await screen.findByText('Nike');

        const viewBtns = await screen.findAllByTitle('Ver productos');
        fireEvent.click(viewBtns[0]!);

        await waitFor(() => {
            expect(brandService.getProducts).toHaveBeenCalledWith('1');
        });

        expect(await screen.findByText('Zapatillas')).toBeDefined();
    });
});
