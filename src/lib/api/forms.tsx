import { apiFetch } from "../api";
import { Form } from "@/types/forms";
const formsEndpoint = "/forms";
export async function getForms() {
    try {
        return await apiFetch<Form[]>(formsEndpoint);
    } catch (error) {
        throw error;
    }
}
export async function getForm(formId: number) {
    try {
        return await apiFetch<Form>(formsEndpoint + "/" + formId);
    } catch (error) {
        throw error;
    }
}
export const createForm = async (form: Omit<Form, "id">): Promise<Form> => {
    return await apiFetch("/forms", { method: "POST", body: JSON.stringify(form) });
};
export const updateForm = async (form: Partial<Form>): Promise<Form> => {
    if (!form.id) {
        throw new Error("Form ID is required for updating.");
    }
    const { id, ...updateData } = form;
    return await apiFetch(`/forms/${id}`, { method: "PATCH", body: JSON.stringify(updateData) });
};
export const deleteForm = async (formId: number): Promise<void> => {
    try {
        await apiFetch<Form>(formsEndpoint + "/" + formId, { method: "DELETE" });
    } catch (error) {
        throw error;
    }
};
