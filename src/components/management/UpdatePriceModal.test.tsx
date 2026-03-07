import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdatePriceModal from './UpdatePriceModal';
import { ManagementService } from '../../services/management.service';

// Mock del servicio de gestión
vi.mock('../../services/management.service', () => ({
    ManagementService: {
        updateProductPrice: vi.fn(),
    }
}));

describe('UpdatePriceModal Component', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        productId: 'prod-123',
        currentPrice: 1500,
        onSuccess: mockOnSuccess
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).triggerSileo = vi.fn();
    });

    it('no renderiza nada si isOpen es false', () => {
        const { container } = render(<UpdatePriceModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renderiza con el precio actual por defecto', () => {
        render(<UpdatePriceModal {...defaultProps} />);
        const input = screen.getByLabelText(/Nuevo Precio/i) as HTMLInputElement;
        expect(input.value).toBe('1500');
    });

    it('valida que el precio sea positivo', async () => {
        render(<UpdatePriceModal {...defaultProps} />);

        const input = screen.getByLabelText(/Nuevo Precio/i);
        fireEvent.change(input, { target: { value: '-10' } });

        fireEvent.click(screen.getByText('Guardar Precio'));

        expect((window as any).triggerSileo).toHaveBeenCalledWith('warning', 'Ingresá un precio válido.');
        expect(ManagementService.updateProductPrice).not.toHaveBeenCalled();
    });

    it('llama al servicio y muestra éxito al actualizar correctamente', async () => {
        vi.mocked(ManagementService.updateProductPrice).mockResolvedValue({ status: 'success', message: '' });

        render(<UpdatePriceModal {...defaultProps} />);

        const input = screen.getByLabelText(/Nuevo Precio/i);
        fireEvent.change(input, { target: { value: '2500.50' } });

        fireEvent.click(screen.getByText('Guardar Precio'));

        await waitFor(() => {
            expect(ManagementService.updateProductPrice).toHaveBeenCalledWith('prod-123', 2500.50);
            expect((window as any).triggerSileo).toHaveBeenCalledWith('success', 'Precio actualizado correctamente.');
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('muestra error si la actualización falla', async () => {
        vi.mocked(ManagementService.updateProductPrice).mockResolvedValue({
            status: 'error',
            message: 'Error al actualizar'
        });

        render(<UpdatePriceModal {...defaultProps} />);

        fireEvent.click(screen.getByText('Guardar Precio'));

        await waitFor(() => {
            expect((window as any).triggerSileo).toHaveBeenCalledWith('error', 'Error al actualizar');
        });
    });
});
