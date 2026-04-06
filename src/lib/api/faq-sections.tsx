import { apiFetch } from "../api";

export interface FaqSection {
    id: number;
    title: string;
    company_id?: number | null;
    status: number;
}

export const getFaqSections = async (): Promise<FaqSection[]> => {
    return await apiFetch('/faq-sections');
};

export const getFaqSection = async (id: number) => {
    return await apiFetch(`/faq-sections/${id}`);
};

export const createFaqSection = async (data: Omit<FaqSection, 'id'>) => {
    const { company_id, ...rest } = data;
    const apiData: any = { ...rest };
    if (company_id) apiData.companyId = company_id;
    return await apiFetch("/faq-sections", {
        method: "POST",
        body: JSON.stringify(apiData),
        headers: { "Content-Type": "application/json" },
    });
};

export const updateFaqSection = async (id: number, data: Partial<FaqSection>) => {
    const { company_id, ...rest } = data;
    const apiData: any = { ...rest };
    if (company_id) apiData.companyId = company_id;
    return await apiFetch(`/faq-sections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(apiData),
        headers: { "Content-Type": "application/json" },
    });
};

export const deleteFaqSection = async (id: number) => {
    return await apiFetch(`/faq-sections/${id}`, { method: "DELETE" });
};
