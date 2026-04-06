import { API_URL } from "../api";
import { toast } from "sonner";

export const uploadCompanyLogo = async (file: File, companyId: number, companyName: string): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append("companyId", companyId.toString());
    formData.append("companyName", companyName);
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (token) {headers.Authorization = `Bearer ${token}`;}
    const response = await fetch(`${API_URL}/companies/upload/logo`, {method: "POST",headers,body: formData});
    if (!response.ok) {
        const errorText = await response.text();
        toast.error("Failed to upload logo: " + errorText);
        throw new Error("Failed to upload logo");
    }
    return response.json();
};
export const uploadCompanyFavicon = async (file: File, companyId: number, companyName: string): Promise<{ faviconUrl: string }> => {
    const formData = new FormData();
    formData.append("companyId", companyId.toString());
    formData.append("companyName", companyName);
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (token) {headers.Authorization = `Bearer ${token}`;}
    const response = await fetch(`${API_URL}/companies/upload/favicon`, {method: "POST",headers,body: formData});
    if (!response.ok) {
        const errorText = await response.text();
        toast.error("Failed to upload favicon: " + errorText);
        throw new Error("Failed to upload favicon");
    }
    return response.json();
};
export const uploadUserAvatar = async (formData: FormData, user: any): Promise<{ url: string }> => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (token) {headers.Authorization = `Bearer ${token}`;}
    const response = await fetch(`${API_URL}/users/upload/avatar`, {method: "POST",headers,body: formData});
    if (!response.ok) {
        const errorText = await response.text();
        toast.error("Failed to upload avatar: " + errorText);
        throw new Error("Failed to upload avatar");
    }
    return response.json();
};
export const uploadProviderLogo = async (formData: FormData, user: any): Promise<{ url: string }> => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (token) {headers.Authorization = `Bearer ${token}`;}
    const response = await fetch(`${API_URL}/providers/upload/logo`, {method: "POST",headers,body: formData});
    if (!response.ok) {
        const errorText = await response.text();
        toast.error("Failed to upload logo: " + errorText);
        throw new Error("Failed to upload logo");
    }
    return response.json();
};
export const uploadCategoryImage = async (file: File, categoryId: number, categoryTitle: string): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId.toString());
    formData.append("categoryTitle", categoryTitle);
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (token) {headers.Authorization = `Bearer ${token}`;}
    const response = await fetch(`${API_URL}/categories/upload/image`, {method: "POST",headers,body: formData,});
    if (!response.ok) {
        const errorText = await response.text();
        toast.error("Failed to upload image: " + errorText);
        throw new Error("Failed to upload image");
    }
    return response.json();
};