import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBrands } from './brand.service';

describe('BrandService', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should fetch brands successfully', async () => {
        const mockBrands = [{ id: '1', name: 'Brand A' }, { id: '2', name: 'Brand B' }];
        const mockResponse = {
            ok: true,
            json: async () => ({ status: 'success', data: mockBrands })
        };
        (fetch as any).mockResolvedValueOnce(mockResponse);

        const brands = await getBrands();

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/brands'));
        expect(brands).toEqual(mockBrands);
    });

    it('should return an empty array if status is not success', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ status: 'error', message: 'Something went wrong' })
        };
        (fetch as any).mockResolvedValueOnce(mockResponse);

        const brands = await getBrands();

        expect(brands).toEqual([]);
    });

    it('should return an empty array and log error if fetch fails', async () => {
        const mockResponse = {
            ok: false,
            statusText: 'Not Found'
        };
        (fetch as any).mockResolvedValueOnce(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const brands = await getBrands();

        expect(brands).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should return an empty array and log error if fetch throws', async () => {
        (fetch as any).mockRejectedValueOnce(new Error('Network error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const brands = await getBrands();

        expect(brands).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
