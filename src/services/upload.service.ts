import { api } from '../lib/api';

export const uploadService = {
    async uploadImage(file: File, folder: string = 'marketflex/promotions'): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        try {
            // Note: We need a backend endpoint that receives this FormData and uses CloudinaryService
            const response = await api.post('upload', {
                body: formData
            }).json<{ status: string; url: string }>();

            if (response.status === 'success') {
                return response.url;
            }
            throw new Error('Fallback to error catch');
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('No se pudo subir la imagen. Por favor, intenta con un URL.');
        }
    }
};
