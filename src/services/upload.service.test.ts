import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadService } from './upload.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        post: vi.fn(),
    }
}));

describe('uploadService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('uploadImage', () => {
        it('should upload an image and return the URL on success', async () => {
            const mockFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
            const mockUrl = 'https://cloudinary.com/uploaded.jpg';

            (api.post as any).mockReturnValue({
                json: vi.fn().mockResolvedValue({ status: 'success', url: mockUrl })
            });

            const result = await uploadService.uploadImage(mockFile);

            expect(api.post).toHaveBeenCalledWith('upload', expect.objectContaining({ body: expect.any(FormData) }));
            expect(result).toBe(mockUrl);
        });

        it('should use default folder "marketflex/promotions" when none is provided', async () => {
            const mockFile = new File(['img'], 'img.png', { type: 'image/png' });
            (api.post as any).mockReturnValue({
                json: vi.fn().mockResolvedValue({ status: 'success', url: 'https://cdn.test/img.png' })
            });

            await uploadService.uploadImage(mockFile);

            const callArg = (api.post as any).mock.calls[0][1];
            const formData: FormData = callArg.body;
            expect(formData.get('folder')).toBe('marketflex/promotions');
        });

        it('should use a custom folder when provided', async () => {
            const mockFile = new File(['img'], 'img.png', { type: 'image/png' });
            (api.post as any).mockReturnValue({
                json: vi.fn().mockResolvedValue({ status: 'success', url: 'https://cdn.test/img.png' })
            });

            await uploadService.uploadImage(mockFile, 'marketflex/products');

            const callArg = (api.post as any).mock.calls[0][1];
            const formData: FormData = callArg.body;
            expect(formData.get('folder')).toBe('marketflex/products');
        });

        it('should throw a user-friendly error when upload fails', async () => {
            const mockFile = new File(['img'], 'img.jpg', { type: 'image/jpeg' });
            (api.post as any).mockReturnValue({
                json: vi.fn().mockRejectedValue(new Error('500 error'))
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(uploadService.uploadImage(mockFile)).rejects.toThrow(
                'No se pudo subir la imagen. Por favor, intenta con un URL.'
            );
            consoleSpy.mockRestore();
        });

        it('should throw when the response status is not success', async () => {
            const mockFile = new File(['img'], 'img.jpg', { type: 'image/jpeg' });
            (api.post as any).mockReturnValue({
                json: vi.fn().mockResolvedValue({ status: 'error', url: '' })
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(uploadService.uploadImage(mockFile)).rejects.toThrow(
                'No se pudo subir la imagen. Por favor, intenta con un URL.'
            );
            consoleSpy.mockRestore();
        });
    });
});
