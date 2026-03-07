import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewClaimsModal from './ViewClaimsModal';

describe('ViewClaimsModal Component', () => {
    const mockOnClose = vi.fn();
    const mockClaims = [
        {
            nroReclamo: 1,
            motivo: 'Producto dañado',
            descripcion: 'El producto llegó con la caja rota.',
            respuesta: 'Estamos revisando el caso.',
            estado: 'PENDIENTE',
            fecha: new Date().toISOString()
        }
    ];

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        claims: mockClaims,
        purchaseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
    };

    it('no renderiza nada si isOpen es false', () => {
        const { container } = render(<ViewClaimsModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renderiza la lista de reclamos correctamente', () => {
        render(<ViewClaimsModal {...defaultProps} />);
        expect(screen.getByRole('heading', { name: /Tus Reclamos/i, level: 2 })).toBeTruthy();
        expect(screen.getByText(/Reclamo #1/i)).toBeTruthy();
        expect(screen.getByText(/Producto dañado/i)).toBeTruthy();
        expect(screen.getByText(/El producto llegó con la caja rota./i)).toBeTruthy();
        expect(screen.getByText(/Estamos revisando el caso./i)).toBeTruthy();
        expect(screen.getByText(/PENDIENTE/i)).toBeTruthy();
    });

    it('muestra nota sobre las 72hs si la compra es reciente', () => {
        const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
        render(<ViewClaimsModal {...defaultProps} purchaseDate={recentDate} />);
        expect(screen.getByText(/Deben pasar 72hs desde la compra para iniciar nuevos reclamos/i)).toBeDefined();
    });

    it('llama a onClose al hacer clic en cerrar', () => {
        render(<ViewClaimsModal {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
