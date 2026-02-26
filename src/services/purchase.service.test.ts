import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPurchase, getMyPurchases, getPurchaseById } from './purchase.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        post: vi.fn(),
        get: vi.fn()
    }
}));

describe('Purchase Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('createPurchase should POST to purchases endpoint', async () => {
        const mockResponse = { status: 'success', data: { id: '1' }, message: 'ok' };
        (api.post as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockResponse)
        });

        const purchaseData: any = { items: [], envio: {} };
        const result = await createPurchase(purchaseData);

        expect(api.post).toHaveBeenCalledWith('purchases', { json: purchaseData });
        expect(result).toEqual(mockResponse);
    });

    it('getMyPurchases should GET purchases/my-purchases', async () => {
        const mockResponse = { status: 'success', data: [] };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockResponse)
        });

        const result = await getMyPurchases();

        expect(api.get).toHaveBeenCalledWith('purchases/my-purchases');
        expect(result).toEqual(mockResponse);
    });

    it('getPurchaseById should GET purchases/:id', async () => {
        const mockResponse = { status: 'success', data: { id: '1' } };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockResponse)
        });

        const result = await getPurchaseById('1');

        expect(api.get).toHaveBeenCalledWith('purchases/1');
        expect(result).toEqual(mockResponse);
    });
});
