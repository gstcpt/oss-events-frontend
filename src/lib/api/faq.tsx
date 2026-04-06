import { apiFetch } from "../api";
import { FAQ } from "@/types/faq";

export const getFAQs = async (): Promise<FAQ[]> => { return await apiFetch('/faq'); };
export const getFAQ = async (id: number) => { return await apiFetch(`/faq/${id}`); };
export const createFAQ = async (faq: Omit<FAQ, 'id'>) => {
    const { faq_order, company_id, section_id, ...restFaq } = faq as any;
    const faqForApi: any = { ...restFaq, faqOrder: faq_order, sectionId: section_id };
    if ((typeof company_id === 'number' && !isNaN(company_id)) || (typeof company_id === 'string' && !isNaN(Number(company_id)))) { faqForApi.companyId = typeof company_id === 'string' ? Number(company_id) : company_id; }
    return await apiFetch("/faq", { method: "POST", body: JSON.stringify(faqForApi), headers: { "Content-Type": "application/json" } });
};
export const updateFAQ = async (id: number, faq: Partial<FAQ>) => {
    const { faq_order, company_id, section_id, ...restFaq } = faq as any;
    const faqForApi: any = { ...restFaq, faqOrder: faq_order, sectionId: section_id };
    if ((typeof company_id === 'number' && !isNaN(company_id)) || (typeof company_id === 'string' && !isNaN(Number(company_id)))) { faqForApi.companyId = typeof company_id === 'string' ? Number(company_id) : company_id; }
    return await apiFetch(`/faq/${id}`, { method: "PATCH", body: JSON.stringify(faqForApi), headers: { "Content-Type": "application/json" } });
};
export const deleteFAQ = async (id: number) => { return await apiFetch(`/faq/${id}`, { method: "DELETE" }); };