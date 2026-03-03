import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SaleDetailModal from './SaleDetailModal';

const mockSale = {
    id: 'sale-12345',
    fechaHora: '2026-02-28T14:30:00Z',
    total: 3500.50,
    metodoPago: 'card',
    cantCuotas: 3,
    estado: 'COMPLETADO',
    usuario: {
        nombre: 'Juan',
        apellido: 'Pérez'
    },
    detalleEnvio: {
        calle: 'Av. Siempre Viva',
        numero: '742',
        ciudad: 'Springfield',
        provincia: 'Buenos Aires'
    },
    lineas: [
        { nombreProducto: 'Zapatillas Pro', cantidad: 2, subtotal: 3000 },
        { nombreProducto: 'Medias Sport', cantidad: 1, subtotal: 500.50 }
    ],
    promociones: [
        { nombre: 'Descuento Admin', montoDescuento: 500 }
    ]
};

describe('SaleDetailModal Component', () => {
    it('renders sale details correctly', () => {
        const onClose = vi.fn();
        render(<SaleDetailModal sale={mockSale as any} onClose={onClose} />);

        // Header and ID
        expect(screen.getByText(/Detalle de Venta/i)).toBeDefined();
        expect(screen.getByText(/SALE-12345/i)).toBeDefined();

        // Customer Info
        expect(screen.getByText(/Juan Pérez/i)).toBeDefined();
        expect(screen.getByText(/Tarjeta/i)).toBeDefined();
        expect(screen.getByText(/3 cuotas/i)).toBeDefined();

        // Shipping
        expect(screen.getByText(/Av. Siempre Viva 742/i)).toBeDefined();

        // Items and Total
        expect(screen.getByText(/Zapatillas Pro/i)).toBeDefined();
        expect(screen.getByText(/3.500,50/)).toBeDefined(); // Total formatting

        // Promotions
        expect(screen.getByText(/Descuento Admin/i)).toBeDefined();
        expect(screen.getByText(/500/)).toBeDefined();
    });

    it('renders physical sale message when no shipping details', () => {
        const physicalSale = { ...mockSale, detalleEnvio: null };
        render(<SaleDetailModal sale={physicalSale as any} onClose={vi.fn()} />);

        expect(screen.getByText(/Sin detalles de envío/i)).toBeDefined();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<SaleDetailModal sale={mockSale as any} onClose={onClose} />);

        const closeBtn = screen.getAllByRole('button')[0]; // Top close button
        if (closeBtn) fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalled();
    });
});
