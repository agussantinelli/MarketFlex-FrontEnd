import { api } from "../lib/api";
import type {
    Promotion,
    CreatePromotionInput,
    PromotionsResponse,
    SinglePromotionResponse
} from "../types/promotion.types";

export const getActivePromotions = async (): Promise<Promotion[]> => {
    try {
        const response = await api.get("promotions/active").json<any>();
        return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
        console.error('Error fetching active promotions:', error);
        return [];
    }
};

export const getFeaturedPromotions = async (): Promise<Promotion[]> => {
    try {
        const response = await api.get("promotions/featured").json<any>();
        return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
        console.error('Error fetching featured promotions:', error);
        return [];
    }
};

export const promotionService = {
    getAll: async (page: number = 1, limit: number = 10): Promise<PromotionsResponse> => {
        return await api.get(`promotions/admin?page=${page}&limit=${limit}`).json<PromotionsResponse>();
    },

    getById: async (id: string): Promise<SinglePromotionResponse> => {
        return await api.get(`promotions/${id}`).json<SinglePromotionResponse>();
    },

    create: async (data: CreatePromotionInput): Promise<SinglePromotionResponse> => {
        return await api.post("promotions", { json: data }).json<SinglePromotionResponse>();
    },

    update: async (id: string, data: Partial<CreatePromotionInput>): Promise<SinglePromotionResponse> => {
        return await api.patch(`promotions/${id}`, { json: data }).json<SinglePromotionResponse>();
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`promotions/${id}`);
    },

    toggleStatus: async (id: string): Promise<SinglePromotionResponse> => {
        return await api.patch(`promotions/${id}/status`).json<SinglePromotionResponse>();
    }
};
