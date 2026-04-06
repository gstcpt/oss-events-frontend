import { apiFetch } from "@/lib/api";

const BASE_URL = "/public/terms-conditions";

export async function getPublicTermsConditions(origin: string): Promise<any> {
    try {
        const response = await apiFetch(`${BASE_URL}/${encodeURIComponent(origin)}`);
        return response;
    } catch (error) { throw new Error("Failed to fetch public terms and conditions"); }
}
