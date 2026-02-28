import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn()
    }
}));

describe('AdminService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getStats', () => {
        it('should return stats on success', async () => {
            const mockStats = {
                totalRevenue: 1000,
                totalSales: 10,
                averageTicket: 100,
                activeUsers: 5,
                revenueTrend: 12.5,
                salesTrend: 8.2,
                avgTrend: 2.1,
                userTrend: 5.3
            };
            (api.get as any).mockReturnValue({
                json: vi.fn().mockResolvedValue({ data: mockStats })
            });

            const result = await AdminService.getStats();
            expect(result).toEqual(mockStats);
            expect(api.get).toHaveBeenCalledWith('admin/stats?period=month');
        });

        it('should return null on failure', async () => {
            (api.get as any).mockReturnValue({
                json: vi.fn().mockRejectedValue(new Error('Fetch error'))
            });

            const result = await AdminService.getStats();
            expect(result).toBeNull();
        });
    });

    describe('getAllPurchases', () => {
        it('should return purchases on success', async () => {
            const mockPurchases = [{ id: '1', total: 500 }];
            (api.get as any).mockReturnValue({
                json: vi.fn().mockResolvedValue({ data: mockPurchases })
            });

            const result = await AdminService.getAllPurchases();
            expect(result).toEqual(mockPurchases);
            expect(api.get).toHaveBeenCalledWith('admin/purchases');
        });

        it('should return empty array on failure', async () => {
            (api.get as any).mockReturnValue({
                json: vi.fn().mockRejectedValue(new Error('Fetch error'))
            });

            const result = await AdminService.getAllPurchases();
            expect(result).toEqual([]);
        });
    });
});
