import { apiFetch } from "../api";
import { TermsConditions } from "@/types/terms-conditions";

export const getTermsConditions = async (): Promise<TermsConditions[]> => {
    return await apiFetch('/terms-conditions');
};

export const getTermsCondition = async (id: number) => {
    return await apiFetch(`/terms-conditions/${id}`);
};

export const createTermsConditions = async (terms: Omit<TermsConditions, 'id'>) => {
    const { company_id, ...restTerms } = terms as any;
    const termsForApi: any = {
        ...restTerms,
    };
    
    if ((typeof company_id === 'number' && !isNaN(company_id)) || (typeof company_id === 'string' && !isNaN(Number(company_id)))) {
        termsForApi.companyId = typeof company_id === 'string' ? Number(company_id) : company_id;
    }
    
    return await apiFetch("/terms-conditions", { 
        method: "POST", 
        body: JSON.stringify(termsForApi),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const updateTermsConditions = async (id: number, terms: Partial<TermsConditions>) => {
    const { company_id, ...restTerms } = terms as any;
    const termsForApi: any = {
        ...restTerms,
    };
    
    if ((typeof company_id === 'number' && !isNaN(company_id)) || (typeof company_id === 'string' && !isNaN(Number(company_id)))) {
        termsForApi.companyId = typeof company_id === 'string' ? Number(company_id) : company_id;
    }
    
    return await apiFetch(`/terms-conditions/${id}`, { 
        method: "PATCH", 
        body: JSON.stringify(termsForApi),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const deleteTermsConditions = async (id: number) => {
    return await apiFetch(`/terms-conditions/${id}`, { method: "DELETE" });
};