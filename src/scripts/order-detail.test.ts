import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initOrderDetail } from './order-detail';
import * as purchaseService from '../services/purchase.service';

vi.mock('../services/purchase.service', () => ({
    getPurchaseById: vi.fn()
}));

// Mock CSS module
vi.mock('../pages/orders/styles/order-detail.module.css', () => ({
    default: {
        promoRow: 'promoRow',
        promoLabel: 'promoLabel',
        productInfoCell: 'productInfoCell',
        productName: 'productName',
        itemPromoBadge: 'itemPromoBadge'
    }
}));

describe('Order Detail Script', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup initial DOM
        document.body.innerHTML = `
            <div id="detail-loading" style="display: block;"></div>
            <div id="detail-content" style="display: none;"></div>
            <div id="detail-error" style="display: none;"></div>
            
            <h1 id="order-id-title"></h1>
            <p id="order-date-full"></p>
            
            <div id="order-subtotal-amount"></div>
            <div id="promos-container"></div>
            <div id="order-total-amount"></div>
            
            <div id="ship-name"></div>
            <div id="ship-address"></div>
            <div id="ship-location"></div>
            <div id="ship-phone"></div>
            
            <div id="pay-method"></div>
            <div id="cuotas-row" style="display: none;"></div>
            <div id="pay-cuotas"></div>
            
            <table>
                <tbody id="order-items-body"></tbody>
            </table>
        `;

        // Mock window location
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/orders/123e4567'
            },
            writable: true
        });
    });

    it('should show error view if order is not found', async () => {
        (purchaseService.getPurchaseById as any).mockResolvedValue({ data: null });

        await initOrderDetail();

        const loading = document.getElementById('detail-loading');
        const error = document.getElementById('detail-error');

        expect(loading?.style.display).toBe('none');
        expect(error?.style.display).toBe('block');
    });

    it('should show error view on API rejection', async () => {
        (purchaseService.getPurchaseById as any).mockRejectedValue(new Error('Server down'));

        await initOrderDetail();

        const loading = document.getElementById('detail-loading');
        const error = document.getElementById('detail-error');

        expect(loading?.style.display).toBe('none');
        expect(error?.style.display).toBe('block');
    });

    it('should render order details successfully', async () => {
        const mockOrder = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            fechaHora: new Date().toISOString(),
            total: 1500,
            metodoPago: 'card',
            cantCuotas: 3,
            detalleEnvio: {
                nombreCompleto: 'Test User',
                direccion: 'Avenida Siempre Viva 742',
                ciudad: 'Springfield',
                provincia: 'State',
                codigoPostal: '1234',
                telefono: '555-0100'
            },
            lineas: [
                {
                    productoId: 'p1',
                    nombreProducto: 'Test Product 1',
                    cantidad: 2,
                    precioUnitario: 500,
                    subtotal: 1000
                }
            ],
            promociones: [
                {
                    nombre: 'Descuento Especial',
                    montoDescuento: 500
                }
            ]
        };

        (purchaseService.getPurchaseById as any).mockResolvedValue({ data: mockOrder });

        await initOrderDetail();

        const title = document.getElementById('order-id-title');
        const total = document.getElementById('order-total-amount');
        const shipName = document.getElementById('ship-name');
        const shipAddress = document.getElementById('ship-address');
        const payMethod = document.getElementById('pay-method');
        const cuotasRow = document.getElementById('cuotas-row');
        const cuotasVal = document.getElementById('pay-cuotas');
        const promos = document.getElementById('promos-container');
        const items = document.getElementById('order-items-body');

        expect(title?.textContent).toContain('123E4567');
        expect(total?.textContent).toContain('1.500');
        expect(shipName?.textContent).toBe('Test User');
        expect(shipAddress?.textContent).toBe('Avenida Siempre Viva 742');
        expect(payMethod?.textContent).toBe('Tarjeta de Crédito');
        expect(cuotasRow?.style.display).toBe('flex');
        expect(cuotasVal?.textContent).toBe('3 cuotas');
        expect(promos?.innerHTML || '').toContain('Descuento Especial');
        expect(items?.innerHTML || '').toContain('Test Product 1');
    });
});
