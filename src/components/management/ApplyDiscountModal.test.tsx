import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplyDiscountModal from './ApplyDiscountModal';
import { ManagementService } from '../../services/management.service';

// Mock del servicio de gestión
vi.mock('../../services/management.service', () => ({
    ManagementService: {
        applyDirectDiscount: vi.fn(),
    }
}));

describe('ApplyDiscountModal Component', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        productId: 'prod-123',
        onSuccess: mockOnSuccess
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).triggerSileo = vi.fn();
    });

    it('no renderiza nada si isOpen es false', () => {
        const { container } = render(<ApplyDiscountModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renderiza correctamente el formulario cuando está abierto', () => {
        render(<ApplyDiscountModal {...defaultProps} />);
        expect(screen.getByText('Aplicar Descuento Directo')).toBeDefined();
        expect(screen.getByLabelText(/Nombre de la Oferta/i)).toBeDefined();
        expect(screen.getByLabelText(/Tipo/i)).toBeDefined();
        expect(screen.getByLabelText(/Valor/i)).toBeDefined();
    });

    it('muestra advertencia si los campos están vacíos al enviar', async () => {
        render(<ApplyDiscountModal {...defaultProps} />);

        const submitBtn = screen.getByText('Aplicar Descuento');
        fireEvent.click(submitBtn);

        expect((window as any).triggerSileo).toHaveBeenCalledWith('warning', expect.any(String));
        expect(ManagementService.applyDirectDiscount).not.toHaveBeenCalled();
    });

    it('valida que la fecha de fin sea posterior a la de inicio', async () => {
        render(<ApplyDiscountModal {...defaultProps} />);

        fireEvent.change(screen.getByLabelText(/Nombre de la Oferta/i), { target: { value: 'Oferta Test' } });
        fireEvent.change(screen.getByLabelText(/Valor/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Inicio/i), { target: { value: '2026-05-20T10:00' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Fin/i), { target: { value: '2026-05-19T10:00' } });

        const submitBtn = screen.getByText('Aplicar Descuento');
        fireEvent.click(submitBtn);

        expect((window as any).triggerSileo).toHaveBeenCalledWith('warning', 'La fecha de fin debe ser posterior a la de inicio.');
    });

    it('llama al servicio y ejecuta onSuccess al aplicar descuento con éxito', async () => {
        vi.mocked(ManagementService.applyDirectDiscount).mockResolvedValue({ status: 'success', message: '' });

        render(<ApplyDiscountModal {...defaultProps} />);

        fireEvent.change(screen.getByLabelText(/Nombre de la Oferta/i), { target: { value: 'Hot Sale' } });
        fireEvent.change(screen.getByLabelText(/Valor/i), { target: { value: '15' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Inicio/i), { target: { value: '2026-06-01T00:00' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Fin/i), { target: { value: '2026-06-30T23:59' } });

        const submitBtn = screen.getByText('Aplicar Descuento');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(ManagementService.applyDirectDiscount).toHaveBeenCalledWith('prod-123', expect.objectContaining({
                nombre: 'Hot Sale',
                valor: 15
            }));
            expect((window as any).triggerSileo).toHaveBeenCalledWith('success', 'Descuento aplicado correctamente.');
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('muestra error si la API falla', async () => {
        vi.mocked(ManagementService.applyDirectDiscount).mockResolvedValue({
            status: 'error',
            message: 'Error de servidor'
        });

        render(<ApplyDiscountModal {...defaultProps} />);

        fireEvent.change(screen.getByLabelText(/Nombre de la Oferta/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/Valor/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Inicio/i), { target: { value: '2026-01-01T00:00' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Fin/i), { target: { value: '2026-01-02T00:00' } });

        fireEvent.click(screen.getByText('Aplicar Descuento'));

        await waitFor(() => {
            expect((window as any).triggerSileo).toHaveBeenCalledWith('error', 'Error de servidor');
        });
    });
});
