import { apiFetch } from "../api";
import { Module } from "@/types/modules";

const API_URL = "/modules";

export const getModules = async (): Promise<{ modules: Module[] }> => {
    try {
        return await apiFetch(API_URL);
    } catch (error) {
        throw new Error("Failed to fetch modules");
    }
};
export const createModule = async (title: string, code: string): Promise<Module> => {
    try {
        return await apiFetch(API_URL, { method: "POST", body: JSON.stringify({ title, code }) });
    } catch (error) {
        throw new Error("Failed to create module");
    }
};
export const updateModule = async (id: number, title: string, code: string): Promise<Module> => {
    try {
        return await apiFetch(`${API_URL}/${id}`, { method: "PATCH", body: JSON.stringify({ title, code }) });
    } catch (error) {
        throw new Error("Failed to update module");
    }
};
export const deleteModule = async (id: number): Promise<void> => {
    try {
        return await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });
    } catch (error) {
        throw new Error("Failed to delete module");
    }
};
