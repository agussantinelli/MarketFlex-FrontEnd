import { api } from "../lib/api";
import type { BrandsResponse, Brand } from "../types/brand.types";

export async function getBrands(): Promise<Brand[]> {
    try {
        const data = await api.get('brands').json<BrandsResponse>();
        return data.status === "success" ? data.data : [];
    } catch (error) {
        console.error("error fetching brands:", error);
        return [];
    }
}
