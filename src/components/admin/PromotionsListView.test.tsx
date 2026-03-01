import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromotionsListView from './PromotionsListView';
import { promotionService } from '../../services/promotion.service';

vi.mock('../../services/promotion.service', () => ({
    promotionService: {
        getAll: vi.fn(),
        delete: vi.fn(),
    }
}));

const getAllPromotionsAdmin = promotionService.getAll;

describe('PromotionsListView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock global loaders and notifications
        (window as any).showAdminLoader = vi.fn();
        (window as any).hideAdminLoader = vi.fn();
        (window as any).triggerSileo = vi.fn();
    });

    it('should render empty state if no promotions', async () => {
        (getAllPromotionsAdmin as any).mockResolvedValue([]);
        render(<PromotionsListView />);

        await waitFor(() => {
            expect(screen.getByText(/No hay promociones/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Gestioná las ofertas y beneficios/i)).toBeInTheDocument();
    });

    it('should render promotions cards correctly', async () => {
        const mockPromos = [
            {
                id: '1',
                nombre: 'Promo Verano',
                descripcion: 'Descuento de verano',
                fechaInicio: '2026-01-01T00:00:00.000Z',
                fechaFin: '2026-02-01T00:00:00.000Z',
                estado: 'ACTIVO',
                foto: null,
                destacado: true,
                tipoPromocion: 'NxM',
                cantCompra: 3,
                cantPaga: 2,
                porcentajeDescuentoSegunda: null,
                activo: true,
                prioridad: 1,
                alcance: 'GLOBAL'
            }
        ];
        (getAllPromotionsAdmin as any).mockResolvedValue({ data: mockPromos });

        render(<PromotionsListView />);

        await waitFor(() => {
            expect(screen.getByText('Promo Verano')).toBeInTheDocument();
        });

        expect(screen.getByText('Descuento de verano')).toBeInTheDocument();
        expect(screen.getByText('ACTIVO')).toBeInTheDocument();
        expect(screen.getByText('GLOBAL')).toBeInTheDocument();
        expect(screen.getByText('3 x 2')).toBeInTheDocument();
    });

    it('should handle error fetching promotions', async () => {
        (getAllPromotionsAdmin as any).mockRejectedValue(new Error('API error'));

        render(<PromotionsListView />);

        await waitFor(() => {
            expect((window as any).triggerSileo).toHaveBeenCalledWith('error', 'No se pudieron cargar las promociones');
        });

        expect(screen.getByText(/No hay promociones/i)).toBeInTheDocument();
    });
});
