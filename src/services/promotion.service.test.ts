import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as promotionService from './promotion.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('PromotionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch active promotions', async () => {
        const mockPromos = [{ id: '1', name: 'Sale' }];
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ data: mockPromos })
        });

        const result = await promotionService.getActivePromotions();

        expect(api.get).toHaveBeenCalledWith('promotions/active');
        expect(result).toEqual(mockPromos);
    });

    it('should fetch featured promotions', async () => {
        const mockPromos = [{ id: '2', name: 'Early Bird' }];
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ data: mockPromos })
        });

        const result = await promotionService.getFeaturedPromotions();

        expect(api.get).toHaveBeenCalledWith('promotions/featured');
        expect(result).toEqual(mockPromos);
    });

    it('should return empty array on fetch error', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockRejectedValueOnce(new Error('Network error'))
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await promotionService.getActivePromotions();

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
