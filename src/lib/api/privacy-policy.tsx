import { apiFetch } from "../api";
import { PrivacyPolicy } from "@/types/privacy-policy";

export const getPrivacyPolicies = async (): Promise<PrivacyPolicy[]> => { return await apiFetch('/privacy-policy'); };
export const getPrivacyPolicy = async (id: number) => { return await apiFetch(`/privacy-policy/${id}`); };
export const createPrivacyPolicy = async (policy: Omit<PrivacyPolicy, 'id'>) => {
    const { company_id, ...restPolicy } = policy as any;
    const policyForApi: any = { ...restPolicy };
    if ((typeof company_id === 'number' && !isNaN(company_id)) || (typeof company_id === 'string' && !isNaN(Number(company_id)))) { policyForApi.companyId = typeof company_id === 'string' ? Number(company_id) : company_id; }
    return await apiFetch("/privacy-policy", { method: "POST", body: JSON.stringify(policyForApi), headers: { "Content-Type": "application/json" } });
};
export const updatePrivacyPolicy = async (id: number, policy: Partial<PrivacyPolicy>) => {
    const { company_id, ...restPolicy } = policy as any;
    const policyForApi: any = { ...restPolicy };
    if ((typeof company_id === 'number' && !isNaN(company_id)) || (typeof company_id === 'string' && !isNaN(Number(company_id)))) { policyForApi.companyId = typeof company_id === 'string' ? Number(company_id) : company_id; }
    return await apiFetch(`/privacy-policy/${id}`, { method: "PATCH", body: JSON.stringify(policyForApi), headers: { "Content-Type": "application/json" } });
};
export const deletePrivacyPolicy = async (id: number) => { return await apiFetch(`/privacy-policy/${id}`, { method: "DELETE" }); };