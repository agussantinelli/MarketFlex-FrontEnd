import { api } from "../lib/api";
import type { Purchase, CreatePurchaseRequest } from '../types/purchase.types';

export const createPurchase = async (purchaseData: CreatePurchaseRequest): Promise<{ status: string, data: Purchase, message: string }> => {
    return await api.post('purchases', { json: purchaseData }).json();
};

export const getMyPurchases = async (): Promise<{ status: string, data: Purchase[] }> => {
    return await api.get('purchases/my-purchases').json();
};

export const getPurchaseById = async (id: string): Promise<{ status: string, data: Purchase }> => {
    return await api.get(`purchases/${id}`).json();
};
