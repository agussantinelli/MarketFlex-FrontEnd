import { api } from '../lib/api';
import type { Claim } from '../types/claims.types';

export const claimsService = {
    getAll: async (): Promise<Claim[]> => {
        const response = await api.get('claims').json<{ status: string; data: Claim[] }>();
        return response.data;
    }
};
