import { apiFetch } from '../api';
import { Subscription } from '@/types/subscriptions';

const SUBSCRIPTION_API = '/subscriptions';

export const createSubscription = async (data: Omit<Subscription, 'id'>): Promise<Subscription> => { return await apiFetch(`${SUBSCRIPTION_API}`, { method: 'POST', body: JSON.stringify(data) }); };
export const getSubscriptions = async (): Promise<Subscription[]> => { return await apiFetch(`${SUBSCRIPTION_API}`, { method: 'GET' }); };
export const getSubscription = async (id: number): Promise<Subscription> => { return await apiFetch(`${SUBSCRIPTION_API}/${id}`); };
export const updateSubscription = async (id: number, data: Partial<Omit<Subscription, 'id'>>): Promise<Subscription> => { return await apiFetch(`${SUBSCRIPTION_API}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); };
export const deleteSubscription = async (id: number): Promise<void> => { return await apiFetch(`${SUBSCRIPTION_API}/${id}`, { method: 'DELETE' }); };