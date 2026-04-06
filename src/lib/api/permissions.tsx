import { apiFetch } from '../api';
import { Permission } from '@/types/permissions';

const API_URL = '/permissions';

export const getPermissions = async (): Promise<{permissions: Permission[]}> => {
  return await apiFetch(API_URL);
};

export const createPermission = async (data: Omit<Permission, 'id'>): Promise<Permission> => {
  return await apiFetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePermission = async (id: number, data: Partial<Omit<Permission, 'id'>>): Promise<Permission> => {
  return await apiFetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deletePermission = async (id: number): Promise<void> => {
  return await apiFetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
};