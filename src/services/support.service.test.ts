import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendSupportMessage, getSupportMessages } from './support.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        post: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('SupportService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('sendSupportMessage', () => {
        it('should send support message successfully', async () => {
            const mockData = { nombre: 'Agus', email: 'a@a.com', asunto: 'Test', mensaje: 'Hello' };
            const mockResponse = { status: 'success' };
            (api.post as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce(mockResponse)
            });

            const result = await sendSupportMessage(mockData as any);

            expect(api.post).toHaveBeenCalledWith('support', expect.objectContaining({ json: mockData }));
            expect(result).toEqual(mockResponse);
        });

        it('should throw error if post fails', async () => {
            (api.post as any).mockReturnValue({
                json: vi.fn().mockRejectedValueOnce(new Error('Server error'))
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(sendSupportMessage({} as any)).rejects.toThrow('Server error');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('getSupportMessages', () => {
        it('should fetch all support messages successfully', async () => {
            const mockMessages = [{ id: '1', asunto: 'Test' }];
            (api.get as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce({ data: mockMessages })
            });

            const result = await getSupportMessages();

            expect(api.get).toHaveBeenCalledWith('support');
            expect(result).toEqual(mockMessages);
        });

        it('should throw error if get fails', async () => {
            (api.get as any).mockReturnValue({
                json: vi.fn().mockRejectedValueOnce(new Error('Server error'))
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(getSupportMessages()).rejects.toThrow('Server error');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
