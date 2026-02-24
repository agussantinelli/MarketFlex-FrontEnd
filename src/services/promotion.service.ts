import { api } from "../lib/api";
import type { Promotion } from "../types/promotion.types";

export const getActivePromotions = async (): Promise<Promotion[]> => {
    try {
        const response: { data: Promotion[] } = await api.get('promotions/active').json();
        return response.data;
    } catch (error) {
        console.error("Error fetching active promotions:", error);
        return [];
    }
};

export const getFeaturedPromotions = async (): Promise<Promotion[]> => {
    try {
        const response: { data: Promotion[] } = await api.get('promotions/featured').json();
        return response.data;
    } catch (error) {
        console.error("Error fetching featured promotions:", error);
        return [];
    }
};

// Also keep the object export for backward compatibility if needed, 
// though we'll update the components to use named imports
export const promotionService = {
    getActivePromotions,
    getFeaturedPromotions
};

