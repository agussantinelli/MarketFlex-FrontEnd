import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCategories } from './category.service';
import { api } from '../lib/api';

// Mock the api library
vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn()
    }
}));

describe('CategoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch categories successfully', async () => {
        const mockCategories = [{ id: '1', name: 'Electronics' }, { id: '2', name: 'Books' }];
        const mockJson = vi.fn().mockResolvedValue({ status: 'success', data: mockCategories });
        (api.get as any).mockReturnValue({ json: mockJson });

        const categories = await getCategories();

        expect(api.get).toHaveBeenCalledWith('categories');
        expect(categories).toEqual(mockCategories);
    });

    it('should return an empty array and log error if fetch fails', async () => {
        const mockJson = vi.fn().mockRejectedValue(new Error('API Error'));
        (api.get as any).mockReturnValue({ json: mockJson });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const categories = await getCategories();

        expect(categories).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith("Error fetching categories:", expect.any(Error));
        consoleSpy.mockRestore();
    });
});
