import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productService from './product.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('ProductService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch products with default parameters', async () => {
        const mockResponse = { status: 'success', data: [], pagination: {} };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce(mockResponse)
        });

        const result = await productService.getProducts();

        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('products?page=1&limit=20'));
        expect(result).toEqual(mockResponse);
    });

    it('should search products with query', async () => {
        const mockResponse = { status: 'success', data: [] };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce(mockResponse)
        });

        const result = await productService.searchProducts({ query: 'iphone' });

        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('products/search?q=iphone'));
        expect(result).toEqual(mockResponse);
    });

    it('should fetch featured products', async () => {
        const mockProducts = [{ id: '1', name: 'Product 1' }];
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ data: mockProducts })
        });

        const result = await productService.getFeaturedProducts();

        expect(api.get).toHaveBeenCalledWith('products/featured');
        expect(result).toEqual(mockProducts);
    });

    it('should fetch product by id', async () => {
        const mockProduct = { id: '1', name: 'Product 1' };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ data: mockProduct })
        });

        const result = await productService.getProductById('1');

        expect(api.get).toHaveBeenCalledWith('products/1');
        expect(result).toEqual(mockProduct);
    });

    it('should return null if getProductById fails', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockRejectedValueOnce(new Error('Not found'))
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await productService.getProductById('999');

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should fetch special sections (new arrivals, bestsellers, offers)', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({ data: [], pagination: {} })
        });

        await productService.getNewArrivals();
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('products/new-arrivals'));

        await productService.getBestsellers();
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('products/bestsellers'));

        await productService.getOffers();
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('products/offers'));
    });
});
