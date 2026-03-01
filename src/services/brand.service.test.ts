import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBrands } from './brand.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('BrandService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch brands successfully', async () => {
        const mockBrands = [{ id: '1', name: 'Brand A' }, { id: '2', name: 'Brand B' }];
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockBrands })
        });

        const brands = await getBrands();

        expect(api.get).toHaveBeenCalledWith('brands');
        expect(brands).toEqual(mockBrands);
    });

    it('should return an empty array if status is not success', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'error', message: 'Something went wrong' })
        });

        const brands = await getBrands();

        expect(brands).toEqual([]);
    });

    it('should return an empty array and log error if fetch fails', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockRejectedValueOnce(new Error('API Failure'))
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const brands = await getBrands();

        expect(brands).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should return an empty array and log error if fetch throws', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockRejectedValueOnce(new Error('Network error'))
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const brands = await getBrands();

        expect(brands).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
