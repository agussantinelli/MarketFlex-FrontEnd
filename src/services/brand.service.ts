import type { BrandsResponse, Brand } from "../types/brand.types";

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:5979/api";

export async function getBrands(): Promise<Brand[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/brands`);
        if (!response.ok) {
            throw new Error(`Error fetching brands: ${response.statusText}`);
        }
        const data: BrandsResponse = await response.json();
        return data.status === "success" ? data.data : [];
    } catch (error) {
        console.error("error fetching brands:", error);
        return [];
    }
}
