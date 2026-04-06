import { apiFetch } from "../api";
import { Reaction, ReactionsData, TargetType, InteractionResponse } from "@/types/interactions";

const getEndpoint = (targetType: TargetType, targetId: number, action: string) => {
    let path = targetType.toLowerCase() + 's';
    if (targetType === 'CATEGORY') path = 'categories';
    return `/public/${path}/${targetId}/${action}`;
};

export const toggleLike = async (targetType: TargetType, targetId: number) => {
    return await apiFetch<InteractionResponse>(getEndpoint(targetType, targetId, 'like'), { method: "POST" });
};

export const toggleDislike = async (targetType: TargetType, targetId: number) => {
    return await apiFetch<InteractionResponse>(getEndpoint(targetType, targetId, 'dislike'), { method: "POST" });
};

export const toggleFavorite = async (targetType: TargetType, targetId: number) => {
    return await apiFetch<InteractionResponse>(getEndpoint(targetType, targetId, 'favorite'), { method: "POST" });
};

export const rateTarget = async (targetType: TargetType, targetId: number, value: number) => {
    return await apiFetch<InteractionResponse>(getEndpoint(targetType, targetId, 'rate'), {
        method: "POST",
        body: JSON.stringify({ value })
    });
};

export const getReactions = async (targetType: TargetType, targetId: number, userId?: number) => {
    const endpoint = getEndpoint(targetType, targetId, 'reactions');
    const url = userId ? `${endpoint}?userId=${userId}` : endpoint;
    return await apiFetch<ReactionsData>(url, { method: "GET" });
};

export const getUserFavorites = async (targetType?: TargetType, page: number = 1, limit: number = 20) => {
    let url = `/interactions/favorites?page=${page}&limit=${limit}`;
    if (targetType) {
        url += `&targetType=${targetType}`;
    }
    return await apiFetch(url, { method: "GET" });
};

export const getUserHistory = async () => {
    return await apiFetch<any[]>('/interactions/history', { method: "GET" });
};