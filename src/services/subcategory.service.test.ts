import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSubcategories } from './subcategory.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('SubcategoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch subcategories successfully', async () => {
        const mockSub = [{ id: '1', name: 'Tech' }];
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockSub })
        });

        const result = await getSubcategories();

        expect(api.get).toHaveBeenCalledWith('subcategories');
        expect(result).toEqual(mockSub);
    });

    it('should return empty array on error', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockRejectedValueOnce(new Error('Offline'))
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await getSubcategories();

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
