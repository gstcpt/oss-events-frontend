import { apiFetch } from "../api";
import { AppLogs } from "@/types/logs";

const API_URL = "/logs";

export const getLogs = async (): Promise<AppLogs[]> => {
  return await apiFetch(API_URL);
};

export const deleteLog = async (id: number): Promise<void> => {
  return await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });
};