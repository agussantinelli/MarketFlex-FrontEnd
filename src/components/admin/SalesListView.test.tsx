import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SalesListView from './SalesListView';
import { AdminService } from '../../services/admin.service';

// Mock AdminService
vi.mock('../../services/admin.service', () => ({
    AdminService: {
        getAllPurchases: vi.fn()
    }
}));

const mockSales = [
    {
        id: 'purchase-1',
        fechaHora: '2026-02-28T14:30:00Z',
        total: 1500.50,
        metodoPago: 'Tarjeta de Crédito',
        estado: 'COMPLETADO',
        usuario: {
            nombre: 'Juan',
            apellido: 'Pérez'
        },
        lineas: []
    },
    {
        id: 'purchase-2',
        fechaHora: '2026-02-28T15:45:00Z',
        total: 2300.00,
        metodoPago: 'Mercado Pago',
        estado: 'PENDIENTE',
        usuario: {
            nombre: 'Maria',
            apellido: 'Gomez'
        },
        lineas: []
    }
];

describe('SalesListView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('fetches and renders sales data on mount', async () => {
        (AdminService.getAllPurchases as any).mockResolvedValue(mockSales);

        render(<SalesListView />);

        await waitFor(() => {
            expect(AdminService.getAllPurchases).toHaveBeenCalled();
        });

        // Check header
        expect(screen.getByText('Listado de Ventas')).toBeDefined();

        // Check sales rows
        expect(await screen.findByText('Juan Pérez')).toBeDefined();
        expect(screen.getByText('Maria Gomez')).toBeDefined();

        // Check amounts (using toLocaleString format or simple contains)
        // Note: The component uses .toLocaleString('es-AR') which might vary by environment
        // but we can check for the numeric parts
        expect(screen.getByText(/\$1.500,50/)).toBeDefined();
        expect(screen.getByText(/\$2.300,00/)).toBeDefined();

        // Check statuses
        expect(screen.getByText('COMPLETADO')).toBeDefined();
        expect(screen.getByText('PENDIENTE')).toBeDefined();
    });

    it('renders error state when fetch fails', async () => {
        (AdminService.getAllPurchases as any).mockRejectedValue(new Error('API Error'));

        render(<SalesListView />);

        await waitFor(() => {
            expect(screen.getByText('No se pudieron cargar las ventas.')).toBeDefined();
        });
    });

    it('renders empty state when no sales are returned', async () => {
        (AdminService.getAllPurchases as any).mockResolvedValue([]);

        render(<SalesListView />);

        await waitFor(() => {
            expect(screen.getByText(/No se encontraron/i)).toBeDefined();
        });
    });
});
