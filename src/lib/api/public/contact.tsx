import { toast } from "sonner";
import { apiFetch } from "../../api";

export const getPublicContact = async (url: string) => {
    try {
        return await apiFetch(`/public/contact?url=${encodeURIComponent(url)}`);
    } catch (error) {
        toast.error('Failed to fetch public contact');
    }
};