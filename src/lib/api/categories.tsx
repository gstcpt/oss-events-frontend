import { apiFetch } from '../api';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types/categories';

export const getAllCategories = async (): Promise<Category[]> => {return apiFetch('/categories');};

export const getCategoryById = async (id: number): Promise<Category> => {return apiFetch(`/categories/${id}`);};

export const createCategory = async (data: CreateCategoryData): Promise<{ message: string; category: Category }> => {return apiFetch('/categories', {method: 'POST', body: JSON.stringify(data)});};

export const updateCategory = async (id: number, data: UpdateCategoryData): Promise<{ message: string; category: Category }> => {return apiFetch(`/categories/${id}`, {method: 'PATCH', body: JSON.stringify(data)});};

export const deleteCategory = async (id: number): Promise<{ message: string; category: Category }> => {return apiFetch(`/categories/${id}`, {method: 'DELETE'});};

export const getCategoriesByCompany = async (companyId: number): Promise<Category[]> => {
  return apiFetch(`/categories/company/${companyId}`);
};

export const getMainCategories = async (): Promise<Category[]> => {
  const categories = await getAllCategories();
  return categories.filter(category => !category.head_category_id);
};

export const getSubCategories = async (parentId: number): Promise<Category[]> => {
  const categories = await getAllCategories();
  return categories.filter(category => category.head_category_id == parentId);
};

export const getCategories = async (user: any): Promise<Category[]> => {
  const companyId = user?.company_id;
  const path = companyId ? `/categories/company/${companyId}` : '/categories';
  return await apiFetch(path);
};