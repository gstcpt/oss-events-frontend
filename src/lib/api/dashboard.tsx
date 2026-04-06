import { apiFetch } from "../api";

export const getDashboard = async (currentUser: any) => {
    return await apiFetch("/dashboard", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getTopItems = async (currentUser: any) => {
    return await apiFetch("/dashboard/top-items", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getTopCategories = async (currentUser: any) => {
    return await apiFetch("/dashboard/top-categories", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getTopTags = async (currentUser: any) => {
    return await apiFetch("/dashboard/top-tags", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getRevenues = async (currentUser: any) => {
    return await apiFetch("/dashboard/revenues", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getLastItems = async (currentUser: any) => {
    return await apiFetch("/dashboard/last-items", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getLastProviders = async (currentUser: any) => {
    return await apiFetch("/dashboard/last-providers", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getLastClients = async (currentUser: any) => {
    return await apiFetch("/dashboard/last-clients", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getLastEvents = async (currentUser: any) => {
    return await apiFetch("/dashboard/last-events", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getStats = async (currentUser: any) => {
    return await apiFetch("/dashboard/stats", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getUpcomingEvents = async (currentUser: any) => {
    return await apiFetch("/dashboard/upcoming-events", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getRecentEvents = async (currentUser: any) => {
    return await apiFetch("/dashboard/recent-events", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getEventsPerMonth = async (currentUser: any) => {
    return await apiFetch("/dashboard/events-per-month", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getEventTypes = async (currentUser: any) => {
    return await apiFetch("/dashboard/event-types", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getRevenuePerMonth = async (currentUser: any) => {
    return await apiFetch("/dashboard/revenue-per-month", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};

export const getCompanyAddress = async (currentUser: any) => {
    return await apiFetch("/dashboard/company-address", {
        method: "GET",
        headers: {
            "X-User-Id": currentUser?.id?.toString() || "",
            "X-User-Role": currentUser?.role || "",
            "X-Company-Id": currentUser?.company_id?.toString() || "",
        },
    });
};