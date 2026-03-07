import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditSaleView from './EditSaleView';
import { ManagementService } from '../../services/management\.service';

vi.mock('../../services/management\.service', () => ({
    ManagementService: {
        getPurchaseById: vi.fn(),
        updatePurchase: vi.fn(),
    }
}));

const mockSale = {
    id: 'sale-1',
    fechaHora: '2026-01-15T10:00:00Z',
    total: 5000,
    metodoPago: 'cash',
    estado: 'PENDIENTE',
    lineas: [
        { nombreProducto: 'Libro XYZ', cantidad: 2, subtotal: 5000 }
    ],
    usuario: { nombre: 'Juan', apellido: 'Perez' },
    promociones: []
};

const setupWindow = () => {
    (window as any).triggerSileo = vi.fn();
    (window as any).showManagementLoader = vi.fn();
    (window as any).hideManagementLoader = vi.fn();
    // Mock URLSearchParams to return a valid id
    delete (window as any).location;
    (window as any).location = { search: '?id=sale-1', href: '' };
};

describe('EditSaleView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupWindow();
    });

    it('renders nothing (null) while loading', () => {
        (ManagementService.getPurchaseById as any).mockImplementation(
            () => new Promise(() => { }) // Never resolves
        );
        const { container } = render(<EditSaleView />);
        // While loading is true, component returns null
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the edit form with sale data after loading', async () => {
        (ManagementService.getPurchaseById as any).mockResolvedValue(mockSale);

        render(<EditSaleView />);

        await waitFor(() => {
            expect(screen.getByText('Editar Venta')).toBeDefined();
        });

        expect(screen.getByText('Estado de la Venta')).toBeDefined();
        expect(ManagementService.getPurchaseById).toHaveBeenCalledWith('sale-1');
    });

    it('shows status options on step 1', async () => {
        (ManagementService.getPurchaseById as any).mockResolvedValue(mockSale);

        render(<EditSaleView />);

        await waitFor(() => {
            expect(screen.getByText('Editar Venta')).toBeDefined();
        });

        expect(screen.getByText('Completado')).toBeDefined();
        expect(screen.getByText('Pendiente')).toBeDefined();
        expect(screen.getByText('Cancelado')).toBeDefined();
    });

    it('renders step labels in the stepper', async () => {
        (ManagementService.getPurchaseById as any).mockResolvedValue(mockSale);

        render(<EditSaleView />);

        await waitFor(() => {
            expect(screen.getByText('Estado de la Venta')).toBeDefined();
        });

        expect(screen.getByText('Pago y Entrega')).toBeDefined();
        expect(screen.getByText('Confirmación')).toBeDefined();
    });

    it('redirects and shows error when no ?id param is present', async () => {
        (window as any).location.search = '';

        const { act } = await import('@testing-library/react');
        render(<EditSaleView />);

        await act(async () => {
            await Promise.resolve();
        });

        expect((window as any).triggerSileo).toHaveBeenCalledWith('error', 'No se proporcionó un ID de venta');
    });
});
