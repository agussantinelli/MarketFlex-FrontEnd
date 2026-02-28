import { api } from "../lib/api";
import type { SupportMessageData, SupportMessageOutput } from '../types/support.types';

export const sendSupportMessage = async (data: SupportMessageData) => {
    try {
        const response = await api.post('support', { json: data });
        return await response.json();
    } catch (error) {
        console.error('Error al enviar mensaje de soporte:', error);
        throw error;
    }
};

export const getSupportMessages = async (): Promise<SupportMessageOutput[]> => {
    try {
        const response = await api.get('support');
        const json = await response.json<{ data: SupportMessageOutput[] }>();
        return json.data;
    } catch (error) {
        console.error('Error al obtener mensajes de soporte:', error);
        throw error;
    }
};
