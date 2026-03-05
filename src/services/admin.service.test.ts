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

    describe('createProduct', () => {
        it('should return success and data', async () => {
            const mockData = { id: 'new-id', nombre: 'Test Prod' };
            (api.post as any) = vi.fn().mockReturnValue({
                json: vi.fn().mockResolvedValue({ status: 'success', data: mockData })
            });

            const result = await AdminService.createProduct({ nombre: 'Test Prod' });
            expect(result.status).toBe('success');
            expect(result.data).toEqual(mockData);
            expect(api.post).toHaveBeenCalledWith('admin/products', { json: { nombre: 'Test Prod' } });
        });

        it('should handle API errors', async () => {
            (api.post as any) = vi.fn().mockReturnValue({
                json: vi.fn().mockRejectedValue({
                    response: { json: vi.fn().mockResolvedValue({ message: 'Validation failed' }) }
                })
            });

            const result = await AdminService.createProduct({});
            expect(result.status).toBe('error');
            expect(result.message).toBe('Validation failed');
        });
    });

    describe('generateTags', () => {
        it('should return success and tags', async () => {
            const mockTags = ['tag1', 'tag2'];
            (api.post as any) = vi.fn().mockReturnValue({
                json: vi.fn().mockResolvedValue({ status: 'success', data: mockTags })
            });

            const result = await AdminService.generateTags('Test', 'Desc');
            expect(result.status).toBe('success');
            expect(result.data).toEqual(mockTags);
            expect(api.post).toHaveBeenCalledWith('admin/generate-tags', { json: { nombre: 'Test', descripcion: 'Desc' }, timeout: 60000 });
        });

        it('should handle API errors', async () => {
            (api.post as any) = vi.fn().mockReturnValue({
                json: vi.fn().mockRejectedValue({
                    response: { json: vi.fn().mockResolvedValue({ message: 'AI error' }) }
                })
            });

            const result = await AdminService.generateTags('Test', 'Desc');
            expect(result.status).toBe('error');
            expect(result.message).toBe('AI error');
        });
    });
});
