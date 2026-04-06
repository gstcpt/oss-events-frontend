import { apiFetch } from "../api";
import { AppSetting } from "@/types/app-settings";

const APP_SETTING = "/app-settings";

export const createAppSetting = async (data: Omit<AppSetting, "id">): Promise<AppSetting> => { try { return await apiFetch(APP_SETTING, { method: "POST", body: JSON.stringify(data) }); } catch (error) { throw error; } };
export const getAppSettings = async (): Promise<{ appSettings: AppSetting[] }> => { try { return await apiFetch(APP_SETTING); } catch (error) { throw error; } };
export const getAppSettingsByFamille = async (famille: string): Promise<AppSetting[]> => { try { return await apiFetch(`${APP_SETTING}/famille/${famille}`); } catch (error) { throw error; } };
export const getAppSetting = async (id: number): Promise<AppSetting> => { try { return await apiFetch(`${APP_SETTING}/${id}`); } catch (error) { throw error; } };
export const updateAppSetting = async (id: number, data: Partial<Omit<AppSetting, "id">>): Promise<AppSetting> => { try { return await apiFetch(`${APP_SETTING}/${id}`, { method: "PATCH", body: JSON.stringify(data) }); } catch (error) { throw error; } };
export const deleteAppSetting = async (id: number): Promise<void> => { try { await apiFetch(`${APP_SETTING}/${id}`, { method: "DELETE" }); } catch (error) { throw error; } };