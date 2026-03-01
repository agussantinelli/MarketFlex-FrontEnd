import { api } from "../lib/api";
import type { SupportMessageData, SupportMessageOutput } from '../types/support.types';

export const sendSupportMessage = async (data: SupportMessageData) => {
    try {
        return await api.post('support', { json: data }).json();
    } catch (error) {
        console.error('Error sending support message:', error);
        throw error;
    }
};

export const getSupportMessages = async (): Promise<SupportMessageOutput[]> => {
    try {
        const json = await api.get('support').json<{ data: SupportMessageOutput[] }>();
        return json.data;
    } catch (error) {
        console.error('Error getting support messages:', error);
        throw error;
    }
};
