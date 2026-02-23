import { api } from "../lib/api";
import type { Promotion } from "../types/promotion.types";

export const getFeaturedPromotions = async (): Promise<Promotion[]> => {
    try {
        const response: { data: Promotion[] } = await api
            .get("promotions/featured")
            .json();
        return response.data;
    } catch (error) {
        console.error("Error fetching featured promotions:", error);
        return [];
    }
};
