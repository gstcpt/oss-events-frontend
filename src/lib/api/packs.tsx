import { apiFetch } from '../api';
import { Pack, PackLine } from '@/types/packs';

export const createPack = async (data: Omit<Pack, 'id'>): Promise<Pack> => {return await apiFetch('/packs', {method: 'POST', body: JSON.stringify(data)});};
export const getPacks = async (): Promise<Pack[]> => {return await apiFetch('/packs');};
export const getPack = async (id: number): Promise<Pack> => {return await apiFetch(`${'/packs'}/${id}`, {method: 'GET'});}
export const updatePack = async (id: number, data: Partial<Omit<Pack, 'id'>>): Promise<Pack> => {return await apiFetch(`${'/packs'}/${id}`, {method: 'PATCH', body: JSON.stringify(data)});};
export const deletePack = async (id: number): Promise<void> => { return await apiFetch(`${'/packs'}/${id}`, { method: 'DELETE' }); };

export const getPackLines = async (packId: number): Promise<PackLine[]> => { return await apiFetch(`/pack-lines/${packId}`, { method: 'GET' }); };
export const createPackLine = async (data: Omit<PackLine, 'id'>): Promise<PackLine> => {return await apiFetch('/pack-lines', {method: 'POST', body: JSON.stringify(data)});};
export const updatePackLine = async (id: number, data: Partial<Omit<PackLine, 'id'>>): Promise<PackLine> => { return await apiFetch(`/pack-lines/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); };
export const deletePackLine = async (id: number): Promise<void> => { return await apiFetch(`/pack-lines/${id}`, { method: 'DELETE' }); };
