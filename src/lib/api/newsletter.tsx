import { apiFetch } from "@/lib/api";
import { Newsletter, NewsletterFormData, NewsletterResponse, NewsletterStats } from "@/types/newsletter";
const NEWSLETTER_BASE_URL = "/newsletter";
export const newsletterApi = {
    getNewsletters: async (page: number = 1, limit: number = 10, search?: string): Promise<NewsletterResponse> => {
        try {
            const searchParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
            if (search) { searchParams.append("search", search); }
            const response = await apiFetch(`${NEWSLETTER_BASE_URL}?${searchParams}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch newsletters" }; }
    },
    getNewsletter: async (id: bigint): Promise<NewsletterResponse> => {
        try {
            const response = await apiFetch(`${NEWSLETTER_BASE_URL}/${id}`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch newsletter" }; }
    },
    createNewsletter: async (data: NewsletterFormData): Promise<NewsletterResponse> => {
        try {
            const response = await apiFetch(`${NEWSLETTER_BASE_URL}`, { method: "POST", body: JSON.stringify(data) });
            return response;
        } catch (error: any) {
            const errorMessage = error.message || "Failed to create newsletter subscription";
            return { success: false, error: errorMessage };
        }
    },
    updateNewsletter: async (id: bigint, data: NewsletterFormData): Promise<NewsletterResponse> => {
        try {
            const response = await apiFetch(`${NEWSLETTER_BASE_URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to update newsletter subscription" }; }
    },
    deleteNewsletter: async (id: bigint): Promise<NewsletterResponse> => {
        try {
            const response = await apiFetch(`${NEWSLETTER_BASE_URL}/${id}`, { method: "DELETE" });
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to delete newsletter subscription" }; }
    },
    getNewsletterStats: async (): Promise<{ success: boolean; data?: NewsletterStats; error?: string }> => {
        try {
            const response = await apiFetch(`${NEWSLETTER_BASE_URL}/stats`);
            return response;
        } catch (error: any) { return { success: false, error: error.message || "Failed to fetch newsletter statistics" }; }
    },
    exportNewsletters: async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await apiFetch(`${NEWSLETTER_BASE_URL}/export`, { headers });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to export newsletters');
            }
            const csvText = await res.text();
            const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0] + '_' + new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
            a.style.display = 'none';
            a.href = url;
            a.download = `newsletter_subscribers_${date}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return { success: true };
        } catch (error: any) { return { success: false, error: error.message || "Failed to export newsletters" }; }
    },
};