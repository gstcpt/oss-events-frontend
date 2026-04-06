"use client";
import { HomePageData } from "@/types/public/home";
import { apiFetch } from "../../api";
import { toast } from "sonner";

export const getHomePageData = async (userId?: number): Promise<HomePageData> => {
    try {
        const itemPath = userId ? `/public/home/items?userId=${userId}` : "/public/home/items";
        const providerPath = userId ? `/public/home/providers?userId=${userId}` : "/public/home/providers";
        
        const [stats, categories, providers, blogs, audienceStats, items, companyInfo] = await Promise.all([
            apiFetch("/public/home/stats"),
            apiFetch("/public/home/categories"),
            apiFetch(providerPath),
            apiFetch("/public/home/blogs"),
            apiFetch("/public/home/audience-stats"),
            apiFetch(itemPath),
            apiFetch("/public/home/company"),
        ]);

        return {
            stats: stats || {
                eventsCreated: 0,
                activeVendors: 0,
                activeServices: 0,
                categoriesCount: 0,
                blogPosts: 0,
                audienceCount: 0,
                newsletterSubscribers: 0,
            },
            categories: Array.isArray(categories) ? categories : [],
            providers: Array.isArray(providers) ? providers : [],
            blogs: Array.isArray(blogs) ? blogs : [],
            audienceStats: audienceStats || { totalEvents: 0, uniqueClients: 0, averageEventDuration: 0, averageServicesPerEvent: 0 },
            newsletterSubscribers: [],
            items: Array.isArray(items) ? items : [],
            companyInfo: companyInfo || undefined,
        };
    } catch (error) {
        toast.error("Error fetching home page data");
        return {
            stats: {
                eventsCreated: 0,
                activeVendors: 0,
                activeServices: 0,
                categoriesCount: 0,
                blogPosts: 0,
                audienceCount: 0,
                newsletterSubscribers: 0,
            },
            categories: [],
            providers: [],
            blogs: [],
            audienceStats: { totalEvents: 0, uniqueClients: 0, averageEventDuration: 0, averageServicesPerEvent: 0 },
            newsletterSubscribers: [],
            items: [],
        };
    }
};

export const submitNewsletter = async (email: string): Promise<any> => {
    try {
        const response = await apiFetch("/public/home/newsletter", {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
        });
        return response;
    } catch (error: any) {
        const errorMessage = error.message || "Failed to subscribe to newsletter";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
    }
};
