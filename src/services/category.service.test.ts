import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from './category.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('Category Service (Frontend)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all categories', async () => {
        const mockData = { data: [{ id: '1', nombre: 'Electronics' }] };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockData)
        });

        const result = await categoryService.getCategories();
        expect(result).toEqual(mockData.data);
        expect(api.get).toHaveBeenCalledWith('categories');
    });

    it('should fetch products by category', async () => {
        const mockData = { data: [{ id: 'p1', nombre: 'Product 1' }] };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockData)
        });

        const result = await categoryService.getProductsByCategory('1');
        expect(result).toEqual(mockData.data);
        expect(api.get).toHaveBeenCalledWith('categories/1/products');
    });

    it('should create a category', async () => {
        const mockCategory = { id: '1', nombre: 'New Category' };
        (api.post as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({ data: mockCategory })
        });

        const result = await categoryService.createCategory('New Category');
        expect(result).toEqual(mockCategory);
        expect(api.post).toHaveBeenCalledWith('categories', { json: { nombre: 'New Category' } });
    });

    it('should update a category', async () => {
        const mockCategory = { id: '1', nombre: 'Updated Category' };
        (api.patch as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({ data: mockCategory })
        });

        const result = await categoryService.updateCategory('1', 'Updated Category');
        expect(result).toEqual(mockCategory);
        expect(api.patch).toHaveBeenCalledWith('categories/1', { json: { nombre: 'Updated Category' } });
    });

    it('should delete a category', async () => {
        (api.delete as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({ status: 'success' })
        });

        const result = await categoryService.deleteCategory('1');
        expect(result).toBe(true);
        expect(api.delete).toHaveBeenCalledWith('categories/1');
    });
});
