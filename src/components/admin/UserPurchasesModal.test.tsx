import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserPurchasesModal from './UserPurchasesModal';
import { AdminService } from '../../services/admin.service';

// Mock AdminService
vi.mock('../../services/admin.service', () => ({
    AdminService: {
        getUserPurchases: vi.fn()
    }
}));

const mockPurchases = [
    {
        id: 'p-1',
        fechaHora: '2026-02-28T14:30:00Z',
        total: 1500,
        metodoPago: 'cash',
        estado: 'COMPLETADO',
        cantCuotas: 1,
        lineas: [{ nombreProducto: 'Producto 1', cantidad: 1, subtotal: 1500 }]
    }
];

describe('UserPurchasesModal Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and renders purchases on mount', async () => {
        (AdminService.getUserPurchases as any).mockResolvedValue(mockPurchases);

        render(<UserPurchasesModal userId="u-1" userName="Juan" onClose={() => { }} />);

        expect(screen.getByText(/Compras de Juan/i)).toBeDefined();

        await waitFor(() => {
            expect(AdminService.getUserPurchases).toHaveBeenCalledWith('u-1');
            expect(screen.getByText(/\$1.500/)).toBeDefined();
            expect(screen.getByText(/Producto 1/)).toBeDefined();
        });
    });

    it('shows empty state when no purchases', async () => {
        (AdminService.getUserPurchases as any).mockResolvedValue([]);

        render(<UserPurchasesModal userId="u-1" userName="Juan" onClose={() => { }} />);

        await waitFor(() => {
            expect(screen.getByText(/aun no ha realizado ninguna compra/i)).toBeDefined();
        });
    });

    it('calls onClose when close button clicked', () => {
        const onClose = vi.fn();
        render(<UserPurchasesModal userId="u-1" userName="Juan" onClose={onClose} />);

        // The close button uses LuX icon, should be accessible via its container/title or role
        const closeBtn = screen.getByRole('button'); // In this modal, first button is close
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalled();
    });

    it('opens SaleDetailModal when "Ver detalle" is clicked', async () => {
        (AdminService.getUserPurchases as any).mockResolvedValue(mockPurchases);

        render(<UserPurchasesModal userId="u-1" userName="Juan" onClose={() => { }} />);

        await waitFor(() => {
            const detailBtn = screen.getByText(/Ver detalle/i);
            fireEvent.click(detailBtn);
        });

        // Check if SaleDetailModal elements appear
        expect(screen.getByText(/Detalle de Venta/i)).toBeDefined();
    });
});
