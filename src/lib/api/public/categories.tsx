import { API_URL } from "../../api";
import { PublicCategory, CategoryItemsResponse } from "@/types/public/categories";

const CATEGORIES_BASE_URL = "/public/categories";

export const getPublicCategories = async (): Promise<PublicCategory[]> => {
    try {
        const res = await fetch(`${API_URL}${CATEGORIES_BASE_URL}`);
        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : []; } catch { data = []; }
        if (!res.ok) { throw new Error(`Failed to fetch categories: ${res.status} ${text}`); }
        return data;
    } catch (error) { throw error; }
};
export const getPublicCategoryById = async (id: number): Promise<PublicCategory> => {
    try {
        const res = await fetch(`${API_URL}${CATEGORIES_BASE_URL}/${id}`);
        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
        if (!res.ok) { throw new Error(`Failed to fetch category: ${res.status} ${text}`); }
        return data;
    } catch (error) { throw error; }
};
export const getPublicCategoryItems = async (categoryId: number, page: number = 1, limit: number = 10, search: string = "", sortBy: string = "relevance", tags: number[] = [], categories: number[] = []): Promise<CategoryItemsResponse> => {
    try {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search, sortBy, tags: tags.join(",") });
        if (categories && categories.length > 0) { params.set('category', categories.join(',')); }
        const res = await fetch(`${API_URL}${CATEGORIES_BASE_URL}/${categoryId}/items?${params}`);
        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
        if (!res.ok) { throw new Error(`Failed to fetch category items: ${res.status} ${text}`); }
        return data;
    } catch (error) { throw error; }
};

export const trackCategoryView = async (id: number, sessionId: number, visitorId: number): Promise<void> => {
    await fetch(`${API_URL}${CATEGORIES_BASE_URL}/${id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, visitorId })
    });
};

export const trackCategoryShare = async (id: number, platform: string): Promise<void> => {
    await fetch(`${API_URL}${CATEGORIES_BASE_URL}/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform })
    });
};
