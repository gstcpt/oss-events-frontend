import { apiFetch } from "@/lib/api";

const BASE_URL = "/public/privacy-policy";

export async function getPublicPrivacyPolicy(origin: string): Promise<any> {
    try {
        const response = await apiFetch(`${BASE_URL}/${encodeURIComponent(origin)}`);
        return response;
    } catch (error) { throw new Error("Failed to fetch public privacy policy"); }
}
