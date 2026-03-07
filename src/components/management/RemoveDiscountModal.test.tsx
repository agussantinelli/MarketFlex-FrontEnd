import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RemoveDiscountModal from './RemoveDiscountModal';
import { ManagementService } from '../../services/management.service';

// Mock del servicio de gestión
vi.mock('../../services/management.service', () => ({
    ManagementService: {
        removeDirectDiscount: vi.fn(),
    }
}));

describe('RemoveDiscountModal Component', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess,
        productId: 'prod-123',
        discountId: 'disc-456'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('no renderiza nada si isOpen es false', () => {
        const { container } = render(<RemoveDiscountModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renderiza el mensaje de confirmación correctamente', () => {
        render(<RemoveDiscountModal {...defaultProps} />);
        expect(screen.getByText(/¿Estás seguro que deseas quitar el descuento actual/i)).toBeDefined();
        expect(screen.getByText('Quitar Descuento')).toBeDefined();
    });

    it('llama al servicio y cierra el modal al confirmar con éxito', async () => {
        vi.mocked(ManagementService.removeDirectDiscount).mockResolvedValue({ status: 'success', message: '' });

        render(<RemoveDiscountModal {...defaultProps} />);

        fireEvent.click(screen.getByText('Quitar Descuento'));

        await waitFor(() => {
            expect(ManagementService.removeDirectDiscount).toHaveBeenCalledWith('prod-123', 'disc-456');
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('muestra un mensaje de error si la API falla', async () => {
        vi.mocked(ManagementService.removeDirectDiscount).mockResolvedValue({
            status: 'error',
            message: 'Error de conexión'
        });

        render(<RemoveDiscountModal {...defaultProps} />);

        fireEvent.click(screen.getByText('Quitar Descuento'));

        await waitFor(() => {
            expect(screen.getByText('Error de conexión')).toBeDefined();
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    it('cierra el modal al hacer clic en cancelar', () => {
        render(<RemoveDiscountModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Cancelar'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
