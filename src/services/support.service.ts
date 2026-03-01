import { api } from "../lib/api";
import type { SupportMessageData, SupportMessageOutput } from '../types/support.types';

export const sendSupportMessage = async (data: SupportMessageData) => {
    return await api.post('support', { json: data }).json();
};

export const getSupportMessages = async (): Promise<SupportMessageOutput[]> => {
    const json = await api.get('support').json<{ data: SupportMessageOutput[] }>();
    return json.data;
};
