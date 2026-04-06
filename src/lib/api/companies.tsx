import { apiFetch } from "../api";
import { Company } from "@/types/companies";
import { toast } from 'sonner';

const COMPANY = "/companies";

export const getCompanyByUrl = async (url: string) => {
    try {
        const company = await apiFetch(`${COMPANY}/public/url?url=${encodeURIComponent(url)}`);
        if (company) { return company; }
    } catch (error) { toast.error('Failed to fetch company by URL "' + url + '", falling back to default: ' + error); }
};

export async function getAllCompanies() { try { return await apiFetch(COMPANY); } catch (error) { toast.error('Failed to fetch companies: ' + error); } }
export const getCompanies = async (): Promise<Company[]> => { return await apiFetch(COMPANY); }
export async function createCompany(data: Partial<Company>) { return apiFetch(COMPANY, { method: "POST", body: JSON.stringify(data) }); }
export async function updateCompany(id: number, data: Partial<Company>) { return apiFetch(`${COMPANY}/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export async function deleteCompany(id: number) { return apiFetch(`${COMPANY}/${id}`, { method: "DELETE" }); }
export async function getCompanyById(id: number) { return apiFetch(`${COMPANY}/${id}`); }
export async function getCompanyByIdPublic(id: number) { return apiFetch(`/companies/public/${id}`); }
export async function getCompanySettings(companyId: number) { return apiFetch(`/company-settings/company/${companyId}`); }
export async function updateCompanySettings(id: number, data: any) { return apiFetch(`/company-settings/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export async function createCompanySettings(data: any) { return apiFetch("/company-settings", { method: "POST", body: JSON.stringify(data) }); }
export async function deleteCompanySettings(id: number) { return apiFetch(`/company-settings/${id}`, { method: "DELETE" }); }
export async function getAppSettings() { return apiFetch("/app-settings"); }
export async function getAllUsers() { return apiFetch("/users"); }