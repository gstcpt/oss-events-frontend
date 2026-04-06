import { apiFetch } from "@/lib/api";
import { PublicItem, TagFilter } from "@/types/public/items";
const ITEMS_BASE_URL = "/public/items";
export const getPublicItems = async (params: { userId?: number; page?: number; limit?: number; search?: string; categoryIds?: number[]; sortBy?: string } = {}): Promise<{ items: PublicItem[]; totalCount: number }> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.userId) queryParams.set('userId', params.userId.toString());
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.limit) queryParams.set('limit', params.limit.toString());
        if (params.search) queryParams.set('search', params.search);
        if (params.sortBy) queryParams.set('sortBy', params.sortBy);
        if (params.categoryIds && params.categoryIds.length > 0) { queryParams.set('categoryIds', params.categoryIds.join(',')); }
        const path = `${ITEMS_BASE_URL}?${queryParams.toString()}`;
        const data = await apiFetch<{ items: PublicItem[]; totalCount: number }>(path);
        return { items: Array.isArray(data?.items) ? data.items : [], totalCount: data?.totalCount || 0 };
    } catch (error) { return { items: [], totalCount: 0 }; }
};
export const getCategoryFilters = async (categoryIds?: number[]): Promise<TagFilter[]> => {
    try {
        const queryParams = categoryIds && categoryIds.length > 0 ? `?categoryIds=${categoryIds.join(',')}` : '';
        const data = await apiFetch<TagFilter[]>(`${ITEMS_BASE_URL}/filters/tags${queryParams}`);
        return Array.isArray(data) ? data : [];
    } catch (error) { return []; }
};
export const getPublicItemById = async (id: number, userId?: number): Promise<PublicItem> => { try { return await apiFetch<PublicItem>(userId ? `${ITEMS_BASE_URL}/${id}?userId=${userId}` : `${ITEMS_BASE_URL}/${id}`); } catch (error) { return {} as PublicItem; } };
export const getPublicItemInteractions = async (id: number): Promise<any> => { try { return await apiFetch(`${ITEMS_BASE_URL}/${id}/interaction-stats`); } catch (error) { return {}; } };
export const getPublicItemSimilarItems = async (id: number): Promise<PublicItem[]> => {
    try {
        const data = await apiFetch<PublicItem[]>(`${ITEMS_BASE_URL}/${id}/similar-items`);
        return Array.isArray(data) ? data : [];
    } catch (error) { return []; }
};
export const getPublicItemComments = async (id: number): Promise<any[]> => {
    try {
        const data = await apiFetch<any[]>(`${ITEMS_BASE_URL}/${id}/comments`);
        return Array.isArray(data) ? data : [];
    } catch (error) { return []; }
};
export const createPublicItemInteraction = async (itemId: number, type: string, value: string, token?: string): Promise<void> => { await apiFetch(`${ITEMS_BASE_URL}/${itemId}/interactions`, { method: "POST", body: JSON.stringify({ type, value }) }); };
export const trackItemView = async (itemId: number, sessionId: number, visitorId: number): Promise<void> => { await apiFetch(`${ITEMS_BASE_URL}/${itemId}/view`, { method: "POST", body: JSON.stringify({ sessionId, visitorId }) }); };
export const trackItemShare = async (itemId: number, platform: string): Promise<void> => { await apiFetch(`${ITEMS_BASE_URL}/${itemId}/share`, { method: "POST", body: JSON.stringify({ platform }) }); };