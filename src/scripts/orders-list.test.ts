import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initOrdersList } from './orders-list';
import * as purchaseService from '../services/purchase.service';

vi.mock('../services/purchase.service', () => ({
    getMyPurchases: vi.fn()
}));

// Mock CSS module
vi.mock('../pages/orders/styles/orders-list.module.css', () => ({
    default: {
        orderCard: 'orderCard',
        orderIconWrapper: 'orderIconWrapper',
        orderInfo: 'orderInfo',
        orderDate: 'orderDate',
        orderStats: 'orderStats',
        orderTotal: 'orderTotal',
        orderItemsCount: 'orderItemsCount',
        viewDetailBtn: 'viewDetailBtn',
        emptyText: 'emptyText'
    }
}));

describe('Orders List Script', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = `
            <div id="orders-loading" style="display: block;">Loading...</div>
            <div id="orders-empty" style="display: none;">Empty</div>
            <div id="orders-list" style="display: none;"></div>
        `;
    });

    it('should display empty message if no orders exist', async () => {
        (purchaseService.getMyPurchases as any).mockResolvedValue({ data: [] });

        await initOrdersList();

        const loading = document.getElementById('orders-loading');
        const empty = document.getElementById('orders-empty');

        expect(loading?.style.display).toBe('none');
        expect(empty?.style.display).toBe('block');
    });

    it('should render a list of orders if data is returned', async () => {
        const mockDate = new Date().toISOString();
        (purchaseService.getMyPurchases as any).mockResolvedValue({
            data: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    fechaHora: mockDate,
                    total: 1000.50,
                    lineas: [{ cantidad: 2 }, { cantidad: 1 }] // 3 items total
                }
            ]
        });

        await initOrdersList();

        const list = document.getElementById('orders-list');
        expect(list?.style.display).toBe('flex');

        // Assert content
        const innerHTML = list?.innerHTML || '';
        expect(innerHTML).toContain('Orden #123E4567');
        expect(innerHTML).toContain('1.000'); // Because 1000.5 formatted as es-AR
        expect(innerHTML).toContain('3 artículos');
    });

    it('should display error message on API failure', async () => {
        (purchaseService.getMyPurchases as any).mockRejectedValue(new Error('Network error'));

        await initOrdersList();

        const loading = document.getElementById('orders-loading');
        expect(loading?.innerHTML).toContain('No pudimos cargar tus compras');
    });
});
