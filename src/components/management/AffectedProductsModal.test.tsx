import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AffectedProductsModal from './AffectedProductsModal';
import { promotionService } from '../../services/promotion.service';

// Mock the promotion service
vi.mock('../../services/promotion.service', () => ({
    promotionService: {
        getAffectedProducts: vi.fn(),
    }
}));

// Mock getImageUrl to just return the string
vi.mock('../../lib/url', () => ({
    getImageUrl: (url: string) => url
}));

describe('AffectedProductsModal Component', () => {
    const mockOnClose = vi.fn();
    const defaultProps = {
        promotionId: 'promo-123',
        promotionName: 'Super Descuento',
        onClose: mockOnClose
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup sileo mock for error testing
        (window as any).triggerSileo = vi.fn();
    });

    it('renders loading state initially', () => {
        // Return an unresolved promise to keep it in loading state
        vi.mocked(promotionService.getAffectedProducts).mockReturnValue(new Promise(() => { }));

        render(<AffectedProductsModal {...defaultProps} />);

        expect(screen.getByText(/Cargando productos/i)).toBeDefined();
        expect(screen.getByText(/Super Descuento/i)).toBeDefined();
    });

    it('renders empty state when no products are returned', async () => {
        vi.mocked(promotionService.getAffectedProducts).mockResolvedValue({ data: [] });

        render(<AffectedProductsModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText(/No hay productos activos afectados/i)).toBeDefined();
        });
    });

    it('renders a list of products successfully', async () => {
        const mockProducts = [
            { id: '1', nombre: 'Zapatilla Nike', categoria: 'Calzado', marca: 'Nike', foto: 'nike.jpg' },
            { id: '2', nombre: 'Remera Adidas', categoria: 'Ropa', marca: 'Adidas', foto: null }
        ];
        vi.mocked(promotionService.getAffectedProducts).mockResolvedValue({ data: mockProducts });

        render(<AffectedProductsModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Zapatilla Nike')).toBeDefined();
            expect(screen.getByText('Remera Adidas')).toBeDefined();
            expect(screen.getByText('Mostrando 2 productos')).toBeDefined();
        });
    });

    it('triggers Sileo error notification when API fails', async () => {
        vi.mocked(promotionService.getAffectedProducts).mockRejectedValue(new Error('API Error'));

        render(<AffectedProductsModal {...defaultProps} />);

        await waitFor(() => {
            expect((window as any).triggerSileo).toHaveBeenCalledWith('error', 'No se pudieron cargar los productos afectados');
            // Should show empty state after error
            expect(screen.getByText(/No hay productos activos afectados/i)).toBeDefined();
        });
    });

    it('calls onClose when close button is clicked', async () => {
        vi.mocked(promotionService.getAffectedProducts).mockResolvedValue({ data: [] });

        render(<AffectedProductsModal {...defaultProps} />);

        const closeBtn = screen.getAllByRole('button')[0] as HTMLElement | null;
        if (closeBtn) {
            fireEvent.click(closeBtn);
        }

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside the modal content', async () => {
        vi.mocked(promotionService.getAffectedProducts).mockResolvedValue({ data: [] });

        const { container } = render(<AffectedProductsModal {...defaultProps} />);

        // Find the overlay element and click it
        const overlay = container.firstChild as HTMLElement | null;
        if (overlay) {
            fireEvent.click(overlay);
        }

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
