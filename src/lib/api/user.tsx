import { apiFetch } from "../api";
import { User } from "@/types/users";

let USER_API = "/users";

export const createModerator = async (data: any, currentUser: any) => apiFetch("${USER_API}/admins", { method: "POST", body: JSON.stringify({ ...data, currentUser }) });
export const createAdmin = async (data: any, currentUser: any) => apiFetch("${USER_API}/admins", { method: "POST", body: JSON.stringify({ ...data, currentUser }) });
export const createProvider = async (data: any, currentUser: any) => apiFetch("${USER_API}/providers", { method: "POST", body: JSON.stringify({ ...data, currentUser }) });
export const createClient = async (data: any, currentUser: any) => apiFetch("${USER_API}/clients", { method: "POST", body: JSON.stringify({ ...data, currentUser }) });

export const createUser = async (data: any) => apiFetch("${USER_API}", { method: "POST", body: JSON.stringify(data) });

export async function getCompanyUsers(company_id: number) { return apiFetch(`${USER_API}/company/${company_id}`) as Promise<User[]>; }
export async function getCompanyUsers2(company_id: number): Promise<User[]> { return apiFetch(`${USER_API}/company/${company_id}`); }
export const getProvidersByCompany = async (company_id: number) => apiFetch(`${USER_API}/providers/listByCompany/${company_id}`);

export const getAllUsers = async () => apiFetch(`${USER_API}`);
export const getUserById = async (id: number) => apiFetch(`${USER_API}/${id}`);

export const getAdmins = async (id: number) => apiFetch(`${USER_API}/admins/list/${id}`, { method: "GET" });
export const getModerators = async (id: number) => apiFetch(`${USER_API}/admins/list/${id}`, { method: "GET" });
export const getProviders = async (id: number) => apiFetch(`${USER_API}/providers/list/${id}`, { method: "GET" });
export const getClients = async (id: number) => apiFetch(`${USER_API}/clients/list/${id}`, { method: "GET" });
export const getMyProfile = async (id: number) => apiFetch(`${USER_API}/profile/me/${id}`, { method: "GET" });

export const getRoles = async () => apiFetch("/roles");
export const getCompanies = async () => apiFetch("/companies");

export const getUsers = async (user: User | null) => {
    if (!user) return [];
    if (user.role === 'Root') { return apiFetch(`${USER_API}`); }
    return apiFetch(`${USER_API}/company/${user.company_id}`);
};

export const updateAdmin = async (id: number, data: any, currentUser: any) => apiFetch(`${USER_API}/admins/${id}`, { method: "PATCH", body: JSON.stringify({ ...data, currentUser }) });
export const updateModerator = async (id: number, data: any, currentUser: any) => apiFetch(`${USER_API}/admins/${id}`, { method: "PATCH", body: JSON.stringify({ ...data, currentUser }) });
export const updateProvider = async (id: number, data: any, currentUser: any) => apiFetch(`${USER_API}/providers/${id}`, { method: "PATCH", body: JSON.stringify({ ...data, currentUser }) });
export const updateClient = async (id: number, data: any, currentUser: any) => apiFetch(`${USER_API}/clients/${id}`, { method: "PATCH", body: JSON.stringify({ ...data, currentUser }) });
export const updateUser = async (id: number, data: any) => apiFetch(`${USER_API}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const updateMyProfile = async (currentUser: any, data: any) => apiFetch("${USER_API}/profile/me", { method: "PATCH", body: JSON.stringify({ ...data, currentUser }) });

export const deleteUser = async (id: number) => apiFetch(`${USER_API}/${id}`, { method: "DELETE" });