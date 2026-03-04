import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subcategoryService } from './subcategory.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    }
}));

describe('subcategoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getSubcategories', () => {
        it('should fetch subcategories successfully', async () => {
            const mockSubs = [
                { categoriaId: '1', nroSubcategoria: 1, nombre: 'Tech', productCount: 3 }
            ];
            (api.get as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockSubs })
            });

            const result = await subcategoryService.getSubcategories('1');

            expect(api.get).toHaveBeenCalledWith('subcategories', expect.objectContaining({ searchParams: { categoriaId: '1' } }));
            expect(result).toEqual(mockSubs);
        });

        it('should throw error if request fails', async () => {
            (api.get as any).mockReturnValue({
                json: vi.fn().mockRejectedValueOnce(new Error('Network error'))
            });

            await expect(subcategoryService.getSubcategories('1')).rejects.toThrow('Network error');
        });
    });

    describe('createSubcategory', () => {
        it('should create subcategory successfully', async () => {
            const mockNew = { categoriaId: '1', nroSubcategoria: 1, nombre: 'Nueva Sub' };
            (api.post as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockNew })
            });

            const result = await subcategoryService.createSubcategory('1', 'Nueva Sub');

            expect(api.post).toHaveBeenCalledWith('subcategories', expect.objectContaining({ json: { categoriaId: '1', nombre: 'Nueva Sub' } }));
            expect(result).toEqual(mockNew);
        });
    });

    describe('updateSubcategory', () => {
        it('should update subcategory successfully', async () => {
            const mockUpdated = { categoriaId: '1', nroSubcategoria: 1, nombre: 'Updated' };
            (api.patch as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockUpdated })
            });

            const result = await subcategoryService.updateSubcategory('1', 1, 'Updated');

            expect(api.patch).toHaveBeenCalledWith('subcategories/1/1', expect.objectContaining({ json: { nombre: 'Updated' } }));
            expect(result).toEqual(mockUpdated);
        });
    });

    describe('deleteSubcategory', () => {
        it('should return true on successful delete', async () => {
            (api.delete as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce({ status: 'success' })
            });

            const result = await subcategoryService.deleteSubcategory('1', 1);

            expect(api.delete).toHaveBeenCalledWith('subcategories/1/1');
            expect(result).toBe(true);
        });

        it('should return false on failed delete', async () => {
            (api.delete as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce({ status: 'error' })
            });

            const result = await subcategoryService.deleteSubcategory('1', 1);
            expect(result).toBe(false);
        });
    });
});
