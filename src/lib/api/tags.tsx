import { apiFetch } from "../api";
import { Tag, TagOptions } from "@/types/tags";
import { toast } from 'sonner';

const tagsEndpoint = "/tags";
export const createTag = async (data: Omit<Tag, "id">): Promise<Tag> => {
    try { return await apiFetch(tagsEndpoint, { method: "POST", body: JSON.stringify(data) }); }
    catch (error) {
        toast.error("Failed to create tag", { description: "Please check your input and try again." });
        throw error;
    }
};
export const getTags = async (currentUserId: number): Promise<Tag[]> => {
    try {
        const response = await apiFetch(`${tagsEndpoint}/list/${currentUserId}`, { method: "GET" });
        return response;
    }
    catch (error) {
        toast.error("Failed to get tags", { description: "Please try again." });
        throw error;
    }
};
export const getTag = async (id: number): Promise<Tag> => {
    try { return await apiFetch(`${tagsEndpoint}/${id}`); }
    catch (error) {
        toast.error("Failed to get tag", { description: "Please try again." });
        throw error;
    }
};
export const updateTag = async (id: number, data: Partial<Omit<Tag, "id">>): Promise<Tag> => {
    try { return await apiFetch(`${tagsEndpoint}/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
    catch (error) {
        toast.error("Failed to update tag", { description: "Please check your input and try again." });
        throw error;
    }
};
export const deleteTag = async (id: number): Promise<void> => {
    try { return await apiFetch(`${tagsEndpoint}/${id}`, { method: "DELETE" }); }
    catch (error) {
        toast.error("Failed to delete tag", { description: "Please try again." });
        throw error;
    }
};
export const getTagOptions = async (tagId: number): Promise<TagOptions[]> => {
    try { return await apiFetch(`/tag-options/tag/${tagId}`); }
    catch (error) {
        toast.error("Failed to get tag options", { description: "Please try again." });
        throw error;
    }
};
export const createTagOption = async (data: Omit<TagOptions, "id">): Promise<TagOptions> => {
    try { return await apiFetch("/tag-options", { method: "POST", body: JSON.stringify(data) }); }
    catch (error) {
        toast.error("Failed to create tag option", { description: "Please check your input and try again." });
        throw error;
    }
};
export const deleteTagOption = async (id: number): Promise<void> => {
    try { return await apiFetch(`/tag-options/${id}`, { method: "DELETE" }); }
    catch (error) {
        toast.error("Failed to delete tag option", { description: "Please try again." });
        throw error;
    }
};
export async function getTagsByCategory(categoryId: number) {
    try { return await apiFetch<Tag[]>(`${tagsEndpoint}/category/${categoryId}`); }
    catch (error) {
        toast.error("Failed to get tags by category", { description: "Please try again." });
        throw error;
    }
}