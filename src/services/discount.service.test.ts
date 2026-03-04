import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discountService } from './discount.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn(),
        delete: vi.fn(),
    }
}));

describe('discountService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all discounts successfully', async () => {
            const mockDiscounts = [
                { id: 'd1', nombre: '10% OFF', porcentaje: 10, montoFijo: null, fechaInicio: '2026-01-01', fechaFin: '2026-12-31', estado: 'ACTIVO' as const },
            ];
            (api.get as any).mockReturnValue({
                json: vi.fn().mockResolvedValue({ status: 'success', data: mockDiscounts })
            });

            const result = await discountService.getAll();

            expect(api.get).toHaveBeenCalledWith('discounts');
            expect(result).toEqual(mockDiscounts);
        });

        it('should throw error if request fails', async () => {
            (api.get as any).mockReturnValue({
                json: vi.fn().mockRejectedValue(new Error('Network error'))
            });

            await expect(discountService.getAll()).rejects.toThrow('Network error');
        });
    });

    describe('delete', () => {
        it('should call the delete endpoint with the correct ID', async () => {
            (api.delete as any).mockResolvedValue(undefined);

            await discountService.delete('d1');

            expect(api.delete).toHaveBeenCalledWith('discounts/d1');
        });

        it('should throw error if delete fails', async () => {
            (api.delete as any).mockRejectedValue(new Error('Delete failed'));

            await expect(discountService.delete('d1')).rejects.toThrow('Delete failed');
        });
    });
});
