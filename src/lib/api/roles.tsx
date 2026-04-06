import { apiFetch } from '../api';
import { Role } from '@/types/roles';

const API_URL = '/roles';

export const getRoles = async (): Promise<Role[]> => {
  const roles = await apiFetch(API_URL);
  return roles.map((role: any) => ({
    ...role,
    permissions: role.role_permission ? role.role_permission.map((rp: any) => rp.permissions).filter(Boolean) : [],
  }));
};

export const createRole = async (data: { title: string; permissionIds?: number[] }): Promise<Role> => {
  return await apiFetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateRole = async (id: number, data: Partial<Omit<Role, 'id'>>): Promise<Role> => {
  return await apiFetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteRole = async (id: number): Promise<void> => {
  return await apiFetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
};