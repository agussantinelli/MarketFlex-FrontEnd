import { describe, it, expect, vi, beforeEach } from 'vitest';
import { brandService } from './brand.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('Brand Service (Frontend)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all brands', async () => {
        const mockData = { data: [{ id: '1', nombre: 'Brand A' }] };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockData)
        });

        const result = await brandService.getAll();
        expect(result).toEqual(mockData.data);
        expect(api.get).toHaveBeenCalledWith('brands');
    });

    it('should fetch products by brand', async () => {
        const mockData = { data: [{ id: 'p1', nombre: 'Product 1' }] };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockData)
        });

        const result = await brandService.getProducts('1');
        expect(result).toEqual(mockData.data);
        expect(api.get).toHaveBeenCalledWith('brands/1/products');
    });

    it('should create a brand', async () => {
        const mockBrand = { id: '1', nombre: 'New Brand' };
        (api.post as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({ data: mockBrand })
        });

        const result = await brandService.create('New Brand');
        expect(result).toEqual(mockBrand);
        expect(api.post).toHaveBeenCalledWith('brands', { json: { nombre: 'New Brand' } });
    });

    it('should update a brand', async () => {
        const mockBrand = { id: '1', nombre: 'Updated Brand' };
        (api.patch as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({ data: mockBrand })
        });

        const result = await brandService.update('1', 'Updated Brand');
        expect(result).toEqual(mockBrand);
        expect(api.patch).toHaveBeenCalledWith('brands/1', { json: { nombre: 'Updated Brand' } });
    });

    it('should delete a brand', async () => {
        (api.delete as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({ success: true })
        });

        await brandService.delete('1');
        expect(api.delete).toHaveBeenCalledWith('brands/1');
    });
});
