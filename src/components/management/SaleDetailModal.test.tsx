import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SaleDetailModal from './SaleDetailModal';

const mockSale = {
    id: 'sale-12345',
    fechaHora: '2026-02-28T14:30:00Z',
    total: 3500.50,
    metodoPago: 'Mercado Pago',
    cantCuotas: 3,
    estado: 'COMPLETADO',
    tipoEntrega: 'ENVIO_DOMICILIO',
    usuario: {
        nombre: 'Juan',
        apellido: 'Pérez'
    },
    detalleEnvio: {
        direccion: 'Av. Siempre Viva 742',
        ciudad: 'Springfield',
        provincia: 'Buenos Aires',
        email: 'juan@perez.com',
        nombreCompleto: 'Juan Pérez',
        telefono: '123456',
        codigoPostal: '1234'
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
    it('renders sale details correctly', async () => {
        const onClose = vi.fn();
        render(<SaleDetailModal sale={mockSale as any} onClose={onClose} />);

        // Header and ID
        expect(screen.getByText(/Detalle de Venta/i)).toBeDefined();
        expect(screen.getByText(/SALE-12345/i)).toBeDefined();

        // Customer Info
        expect(screen.getByText(/Juan Pérez/i)).toBeDefined();
        expect(screen.getByText(/Mercado Pago/i)).toBeDefined();
        expect(screen.getByText(/3 cuotas/i)).toBeDefined();

        // Shipping
        // Shipping
        // Shipping
        expect(screen.getByText(/Av\. Siempre Viva 742/)).toBeDefined();

        // Items and Total
        expect(screen.getAllByText(/Zapatillas Pro/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText((_, element) => element?.textContent?.includes('3.500,50') || false).length).toBeGreaterThan(0);

        // Promotions
        expect(screen.getByText(/Descuento Admin/i)).toBeDefined();
        expect(screen.getAllByText(/500/).length).toBeGreaterThan(0);
    });

    it('renders physical sale message when no shipping details', () => {
        const physicalSale = { ...mockSale, detalleEnvio: null, tipoEntrega: 'RETIRO_LOCAL' };
        render(<SaleDetailModal sale={physicalSale as any} onClose={vi.fn()} />);

        expect(screen.getByText(/El cliente retira el pedido/i)).toBeDefined();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<SaleDetailModal sale={mockSale as any} onClose={onClose} />);

        const closeBtn = screen.getAllByRole('button')[0]; // Top close button
        if (closeBtn) fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalled();
    });
});
