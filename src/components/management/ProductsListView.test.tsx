import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProductsListView from './ProductsListView';
import { ManagementService } from '../../services/management\.service';

// Mock ManagementService
vi.mock('../../services/management\.service', () => ({
    ManagementService: {
        getProducts: vi.fn()
    }
}));

const mockProductsResponse = {
    status: 'success',
    data: [
        {
            id: '1',
            nombre: 'Producto Test 1',
            categoria: 'Libros',
            marca: 'Marca A',
            precioActual: 1000,
            stock: 10,
            esDestacado: true,
            foto: null
        }
    ],
    pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
    }
};

describe('ProductsListView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and renders products on mount', async () => {
        (ManagementService.getProducts as any).mockResolvedValue(mockProductsResponse);

        render(<ProductsListView />);

        // Check if service was called
        await waitFor(() => {
            expect(ManagementService.getProducts).toHaveBeenCalled();
        });

        // Wait for the title which is inside DataTable
        expect(await screen.findByText(/Gestión de Productos/i)).toBeDefined();

        // Wait for the mock data
        const productCell = await screen.findByText('Producto Test 1');
        expect(productCell).toBeDefined();
        expect(screen.getByText('Libros')).toBeDefined();
    });

    it('shows empty state when no products found', async () => {
        (ManagementService.getProducts as any).mockResolvedValue({
            status: 'success',
            data: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        });

        render(<ProductsListView />);

        await waitFor(() => {
            expect(screen.getByText('No se encontraron resultados')).toBeDefined();
        });
    });
});
