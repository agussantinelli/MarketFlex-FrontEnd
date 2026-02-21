import { api } from '../lib/api';
import type { SupportMessageData } from '../types/support.types';

export const sendSupportMessage = async (data: SupportMessageData) => {
    try {
        const response = await api.post('support', { json: data });
        return await response.json();
    } catch (error) {
        console.error('Error al enviar mensaje de soporte:', error);
        throw error;
    }
};
