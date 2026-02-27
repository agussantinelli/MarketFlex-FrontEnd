import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initAdminDashboard } from './admin-dashboard';
import { AdminService } from '../services/AdminService';

vi.mock('../services/AdminService');
vi.mock('../pages/admin/styles/dashboard.module.css', () => ({
    default: {
        orderId: 'orderId',
        userCell: 'userCell',
        userAvatar: 'userAvatar',
        amount: 'amount',
        completado: 'completado'
    }
}));

describe('admin-dashboard', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="statsGrid"></div>
            <div id="stat-value-0">0</div>
            <div id="stat-value-1">0</div>
            <div id="stat-value-2">0</div>
            <div id="stat-value-3">0</div>
            <table id="transactions-body"></table>
        `;
        vi.clearAllMocks();
    });

    it('should update stats on initialization', async () => {
        const mockStats = { totalRevenue: 1000, totalSales: 10, averageTicket: 100, activeUsers: 5 };
        (AdminService.getStats as any).mockResolvedValue(mockStats);
        (AdminService.getAllPurchases as any).mockResolvedValue([]);

        await initAdminDashboard();

        expect(document.getElementById('stat-value-0')?.textContent).toBe('$1,000.00');
        expect(document.getElementById('stat-value-1')?.textContent).toBe('10');
        expect(document.getElementById('stat-value-2')?.textContent).toBe('$100.00');
        expect(document.getElementById('stat-value-3')?.textContent).toBe('5');
    });

    it('should update transactions table with real data', async () => {
        (AdminService.getStats as any).mockResolvedValue(null);
        const mockPurchases = [
            {
                id: '123456789',
                fechaHora: '2026-02-26T12:00:00Z',
                total: 500,
                estado: 'Completado',
                usuario: { nombre: 'Test', apellido: 'User' }
            }
        ];
        (AdminService.getAllPurchases as any).mockResolvedValue(mockPurchases);

        await initAdminDashboard();

        const tableBody = document.getElementById('transactions-body');
        expect(tableBody?.innerHTML).toContain('#12345678');
        expect(tableBody?.innerHTML).toContain('Test User');
        expect(tableBody?.innerHTML).toContain('$500.00');
        expect(tableBody?.innerHTML).toContain('Completado');
    });
});
