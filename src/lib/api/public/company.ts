import { apiFetch } from "@/lib/api";

export interface CompanyInfo {
    id: string;
    ste_title?: string;
    logo?: string;
    favicon?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    about?: string;
}

export const getPublicCompany = async (companyId: string | number): Promise<CompanyInfo> => {
    try {
        const data = await apiFetch<CompanyInfo>(`/companies/public/${companyId}`);
        return data;
    } catch (error) {
        throw error;
    }
};
