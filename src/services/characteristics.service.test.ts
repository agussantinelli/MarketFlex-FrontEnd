import { describe, it, expect, vi, beforeEach } from 'vitest';
import { characteristicsService } from './characteristics.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn().mockReturnThis(),
        post: vi.fn().mockReturnThis(),
        patch: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('CharacteristicsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockCharacteristics = [
        { id: '1', nombre: 'Material', productCount: 5 },
        { id: '2', nombre: 'Color', productCount: 3 }
    ];

    it('should fetch all characteristics successfully', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockCharacteristics })
        });

        const result = await characteristicsService.getAll();

        expect(api.get).toHaveBeenCalledWith('characteristics');
        expect(result).toEqual(mockCharacteristics);
    });

    it('should create a characteristic successfully', async () => {
        const newChar = { id: '3', nombre: 'Talle' };
        (api.post as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'success', data: newChar })
        });

        const result = await characteristicsService.create('Talle');

        expect(api.post).toHaveBeenCalledWith('characteristics', {
            json: { nombre: 'Talle' }
        });
        expect(result).toEqual(newChar);
    });

    it('should fetch products by characteristic successfully', async () => {
        const mockProducts = [
            { id: 'p1', nombre: 'Product 1', foto: null, valor: 'Cotton' }
        ];
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockProducts })
        });

        const result = await characteristicsService.getProducts('1');

        expect(api.get).toHaveBeenCalledWith('characteristics/1/products');
        expect(result).toEqual(mockProducts);
    });

    it('should update a characteristic successfully', async () => {
        const updatedChar = { id: '1', nombre: 'Material Updated' };
        (api.patch as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'success', data: updatedChar })
        });

        const result = await characteristicsService.update('1', 'Material Updated');

        expect(api.patch).toHaveBeenCalledWith('characteristics/1', {
            json: { nombre: 'Material Updated' }
        });
        expect(result).toEqual(updatedChar);
    });

    it('should delete a characteristic successfully', async () => {
        (api.delete as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce({ status: 'success' })
        });

        await characteristicsService.delete('1');

        expect(api.delete).toHaveBeenCalledWith('characteristics/1');
    });
});
