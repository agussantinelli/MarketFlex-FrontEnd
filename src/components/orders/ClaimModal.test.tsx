import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClaimModal from './ClaimModal';
import { claimsService } from '../../services/claims.service';

// Mock claims service
vi.mock('../../services/claims.service', () => ({
    claimsService: {
        create: vi.fn(),
    }
}));

describe('ClaimModal Component', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess,
        purchaseId: 'purchase-123',
        purchaseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock global window functions
        (window as any).triggerSileo = vi.fn();
    });

    it('no renderiza nada si isOpen es false', () => {
        const { container } = render(<ClaimModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renderiza los campos del formulario correctamente', () => {
        render(<ClaimModal {...defaultProps} />);
        expect(screen.getByText(/Realizar Reclamo/i)).toBeDefined();
        expect(screen.getByLabelText(/Motivo del Reclamo/i)).toBeDefined();
        expect(screen.getByLabelText(/Descripción Detallada/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Enviar Reclamo/i })).toBeDefined();
    });

    it('muestra advertencia si los campos están vacíos o son muy cortos', async () => {
        render(<ClaimModal {...defaultProps} />);

        const submitBtn = screen.getByRole('button', { name: /Enviar Reclamo/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect((window as any).triggerSileo).toHaveBeenCalledWith(
                'warning',
                expect.stringContaining('Completá todos los campos correctamente')
            );
        });
        expect(claimsService.create).not.toHaveBeenCalled();
    });

    it('llama al servicio y cierra el modal al enviar con éxito', async () => {
        vi.mocked(claimsService.create).mockResolvedValue({} as any);

        render(<ClaimModal {...defaultProps} />);

        fireEvent.change(screen.getByLabelText(/Motivo del Reclamo/i), {
            target: { value: 'Producto Dañado' }
        });
        fireEvent.change(screen.getByLabelText(/Descripción Detallada/i), {
            target: { value: 'La pantalla del producto llegó totalmente rota.' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Enviar Reclamo/i }));

        await waitFor(() => {
            expect(claimsService.create).toHaveBeenCalledWith({
                compraId: 'purchase-123',
                motivo: 'Producto Dañado',
                descripcion: 'La pantalla del producto llegó totalmente rota.'
            });
            expect((window as any).triggerSileo).toHaveBeenCalledWith(
                'success',
                expect.stringContaining('Reclamo registrado exitosamente')
            );
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('muestra error si el servicio falla', async () => {
        vi.mocked(claimsService.create).mockRejectedValue(new Error('API Error'));

        render(<ClaimModal {...defaultProps} />);

        fireEvent.change(screen.getByLabelText(/Motivo del Reclamo/i), {
            target: { value: 'Producto Dañado' }
        });
        fireEvent.change(screen.getByLabelText(/Descripción Detallada/i), {
            target: { value: 'La pantalla del producto llegó con un golpe.' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Enviar Reclamo/i }));

        await waitFor(() => {
            expect(claimsService.create).toHaveBeenCalled();
        }, { timeout: 2000 });

        await waitFor(() => {
            const spy = (window as any).triggerSileo;
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(
                'error',
                expect.stringContaining('Error al registrar el reclamo')
            );
        }, { timeout: 2000 });
        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('cierra el modal al cancelar', () => {
        render(<ClaimModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Cancelar'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('bloquea el envío y muestra advertencia si no pasaron 72 horas', () => {
        const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
        render(<ClaimModal {...defaultProps} purchaseDate={recentDate} />);

        expect(screen.getByText(/Deben pasar al menos 72 horas desde la compra/i)).toBeDefined();
        const submitBtn = screen.getByRole('button', { name: /Enviar Reclamo/i }) as HTMLButtonElement;
        expect(submitBtn.disabled).toBe(true);
    });
});
