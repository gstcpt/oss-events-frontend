import { apiFetch } from "@/lib/api";

const FAQ_BASE_URL = "/public/faq";

export async function getPublicFAQs(origin: string): Promise<any> {
    try {
        const response = await apiFetch(`${FAQ_BASE_URL}/${encodeURIComponent(origin)}`);
        return response;
    } catch (error) { throw new Error("Failed to fetch public FAQs"); }
}
