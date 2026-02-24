import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterService } from './filter.service';

describe('FilterService', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should fetch categories successfully', async () => {
        const mockCategories = [{ id: '1', name: 'Electronics' }];
        const mockResponse = {
            ok: true,
            json: async () => ({ status: 'success', data: mockCategories })
        };
        (fetch as any).mockResolvedValueOnce(mockResponse);

        const categories = await filterService.getCategories();

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/categories'));
        expect(categories).toEqual(mockCategories);
    });

    it('should fetch subcategories successfully', async () => {
        const mockSubcategories = [{ id: '1', name: 'Phones' }];
        const mockResponse = {
            ok: true,
            json: async () => ({ status: 'success', data: mockSubcategories })
        };
        (fetch as any).mockResolvedValueOnce(mockResponse);

        const subcategories = await filterService.getSubcategories();

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/subcategories'));
        expect(subcategories).toEqual(mockSubcategories);
    });

    it('should return empty arrays and log error if fetch fails', async () => {
        (fetch as any).mockRejectedValue(new Error('Fetch error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const categories = await filterService.getCategories();
        const subcategories = await filterService.getSubcategories();

        expect(categories).toEqual([]);
        expect(subcategories).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledTimes(2);
        consoleSpy.mockRestore();
    });
});
