import { apiFetch } from "@/lib/api";
import { Visitor, Session, PageView, PageEvent, DailyAggregate, AudienceStats, AudienceResponse } from "@/types/reports";

const RAPPORTS_BASE_URL = "/raports";
const AUDIENCE_BASE_URL = "/audience";

export const getCompanies = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/companies`); };
export const getCompaniesStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/companies-stats`); };
export const getSubscriptions = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/subscriptions`); };
export const getSubscriptionsStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/subscriptions-stats`); };
export const getUsers = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/users`); };
export const getUsersStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/users-stats`); };
export const getUsersPerRole = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/users-per-role`); };
export const getUsersPerRoleAndStatus = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/users-per-role-and-status`); };
export const getProviders = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/providers`); };
export const getClients = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/clients`); };
export const getAdmins = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/admins`); };
export const getCategories = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/categories`); };
export const getCategoriesStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/categories-stats`); };
export const getTags = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/tags`); };
export const getTagsStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/tags-stats`); };
export const getItems = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/items`); };
export const getItemsStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/items-stats`); };
export const getMedia = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/media`); };
export const getMediaStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/media-stats`); };
export const getEvents = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/events`); };
export const getEventsStats = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/events-stats`); };
export const getEventsPerCategory = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/events-per-category`); };
export const getEventsByMonth = async (user: any) => { return await apiFetch(`${RAPPORTS_BASE_URL}/events-by-month`); };

export const audienceApi = {
    createVisitor: async (payload: {
        clientId: string;
        userId?: number;
        userAgent?: string;
        device?: string;
        os?: string;
        browser?: string;
        locale?: string;
        ipHash?: string;
    }) => { return await apiFetch(`${AUDIENCE_BASE_URL}/visitors`, { method: "POST", body: JSON.stringify(payload) }); },
    createSession: async (payload: {
        visitorId: number;
        sessionUuid: string;
        entryUrl?: string;
        entryResource?: string;
        entryResourceId?: number;
        referrer?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
    }) => { return await apiFetch(`${AUDIENCE_BASE_URL}/sessions`, { method: "POST", body: JSON.stringify(payload) }); },
    createPageView: async (payload: {
        sessionId: number;
        visitorId: number;
        userId?: number;
        resourceType?: string;
        resourceId?: number;
        path: string;
        title?: string;
        query?: any;
        durationMs?: number;
        scrollDepthPct?: number;
        interactions?: number;
        isBounce?: boolean;
        meta?: any;
    }) => { return await apiFetch(`${AUDIENCE_BASE_URL}/page-views`, { method: "POST", body: JSON.stringify(payload) }); },
    getVisitors: async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }): Promise<AudienceResponse> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append("page", params.page.toString());
            if (params?.limit) queryParams.append("limit", params.limit.toString());
            if (params?.startDate) queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/visitors?${queryParams}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch visitors" }; }
    },
    getVisitor: async (id: number): Promise<AudienceResponse> => {
        try {
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/visitors/${id}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch visitor" }; }
    },
    getSessions: async (params?: {
        visitorId?: number;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<AudienceResponse> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.visitorId) queryParams.append("visitorId", params.visitorId.toString());
            if (params?.page) queryParams.append("page", params.page.toString());
            if (params?.limit) queryParams.append("limit", params.limit.toString());
            if (params?.startDate) queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/sessions?${queryParams}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch sessions" }; }
    },
    getSession: async (id: number): Promise<AudienceResponse> => {
        try {
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/sessions/${id}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch session" }; }
    },
    getPageViews: async (params?: {
        sessionId?: number;
        resourceType?: string;
        resourceId?: number;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<AudienceResponse> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.sessionId) queryParams.append("sessionId", params.sessionId.toString());
            if (params?.resourceType) queryParams.append("resourceType", params.resourceType);
            if (params?.resourceId) queryParams.append("resourceId", params.resourceId.toString());
            if (params?.page) queryParams.append("page", params.page.toString());
            if (params?.limit) queryParams.append("limit", params.limit.toString());
            if (params?.startDate) queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/page-views?${queryParams}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch page views" }; }
    },
    getPageView: async (id: number): Promise<AudienceResponse> => {
        try {
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/page-views/${id}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch page view" }; }
    },
    getPageViewByResource: async (resourceType: string, resourceId: number): Promise<AudienceResponse> => {
        try {
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/page-views/${resourceType}/${resourceId}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch page view by resource" }; }
    },
    getPageEvents: async (pageViewId?: number): Promise<AudienceResponse> => {
        try {
            const queryParams = pageViewId ? `?pageViewId=${pageViewId}` : "";
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/page-events${queryParams}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch page events" }; }
    },
    getDailyAggregates: async (params?: {
        resourceType?: string;
        resourceId?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<AudienceResponse> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.resourceType) queryParams.append("resourceType", params.resourceType);
            if (params?.resourceId) queryParams.append("resourceId", params.resourceId.toString());
            if (params?.startDate) queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/daily-aggregates?${queryParams}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch daily aggregates" }; }
    },
    getAudienceStats: async (params?: {
        startDate?: string;
        endDate?: string;
        resourceType?: string;
        resourceId?: number;
    }): Promise<{ success: boolean; data?: AudienceStats; error?: string }> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.startDate) queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);
            if (params?.resourceType) queryParams.append("resourceType", params.resourceType);
            if (params?.resourceId) queryParams.append("resourceId", params.resourceId.toString());
            const response = await apiFetch(`${AUDIENCE_BASE_URL}/stats?${queryParams}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch audience statistics" }; }
    },
    exportAudienceData: async (type: "visitors" | "sessions" | "page-views", params?: { startDate?: string; endDate?: string }, user?: any): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("type", type);
            if (params?.startDate) queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);
            const response = await apiFetch<any>(`/audience/export?${queryParams.toString()}`, { method: "GET", responseType: "blob" });
            if (response instanceof Blob) {
                const filename = `${type}_${new Date().toISOString().split("T")[0]}_${new Date().toLocaleTimeString().replace(/:/g, "-")}.xlsx`;
                return { success: true, blob: response, filename };
            }
            if (response && response.ok) {
                const blob = await response.blob();
                const disposition = response.headers.get("Content-Disposition");
                let filename = `${type}_${new Date().toISOString().split("T")[0]}_${new Date().toLocaleTimeString().replace(/:/g, "-")}.xlsx`;
                if (disposition && disposition.includes("filename=")) {
                    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
                    if (filenameMatch && filenameMatch[1]) { filename = filenameMatch[1]; }
                }
                return { success: true, blob, filename };
            }
            throw new Error(response?.error || "Export failed: No response or error from server");
        } catch (error: any) { return { success: false, error: error.message || "Failed to export audience data" }; }
    },
};