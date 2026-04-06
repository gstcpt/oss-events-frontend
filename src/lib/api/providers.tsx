import { apiFetch } from "../api";

export const getProviders = async () => {
  try {
    const response = await apiFetch("/public/providers", { method: "GET" });
    const result = Array.isArray(response) ? response : [];
    return result;
  } catch (error) { return []; }
};

export const getProvider = async (id: number, userId?: number) => {
  try {
    const url = userId ? `/public/providers/${id}?userId=${userId}` : `/public/providers/${id}`;
    const response = await apiFetch(url, { method: "GET" });
    return response;
  } catch (error) { throw error; }
};

// Deprecated - keeping for backward compatibility
export const getProviderByUserId = async (userId: number, currentUser: any) => {
  return apiFetch(`/providers/user/${userId}`, { method: "GET" });
};

// Deprecated - keeping for backward compatibility
export const createProvider = async (data: any, currentUser: any) => {
  return apiFetch("/providers", { method: "POST", body: JSON.stringify(data) });
};

// Deprecated - keeping for backward compatibility
export const updateProvider = async (id: number, data: any, currentUser: any) => {
  return apiFetch(`/providers/${id}`, { method: "PATCH", body: JSON.stringify(data) });
};

// Deprecated - keeping for backward compatibility
export const deleteProvider = async (id: number, currentUser: any) => {
  return apiFetch(`/providers/${id}`, { method: "DELETE" });
};

export const trackProviderView = async (id: number, sessionId: number, visitorId: number) => { await apiFetch(`/public/providers/${id}/view`, { method: "POST", body: JSON.stringify({ sessionId, visitorId }) }); };

export const trackProviderShare = async (id: number, platform: string) => {
  await apiFetch(`/public/providers/${id}/share`, { method: "POST", body: JSON.stringify({ platform }) });
};

export const updateOpeningHours = async (providerId: number, hours: any[]) => {
  return apiFetch(`/providers/${providerId}/opening-hours`, { method: "PATCH", body: JSON.stringify(hours) });
};

export const updateExceptions = async (providerId: number, exceptions: any[]) => {
  return apiFetch(`/providers/${providerId}/exceptions`, { method: "PATCH", body: JSON.stringify(exceptions) });
};
