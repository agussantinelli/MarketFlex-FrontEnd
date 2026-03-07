import { api } from '../lib/api';
import type { Claim } from '../types/claims.types';

export const claimsService = {
    getAll: async (): Promise<Claim[]> => {
        const response = await api.get('claims').json<{ status: string; data: Claim[] }>();
        return response.data;
    },
    create: async (data: { compraId: string; motivo: string; descripcion: string }): Promise<Claim> => {
        const response = await api.post('claims', { json: data }).json<{ status: string; data: Claim }>();
        return response.data;
    }
};
