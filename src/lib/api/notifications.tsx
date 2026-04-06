import { apiFetch } from "../api";
import { Notification } from "../../types/notifications";

export const create = async (notification: Notification) => {return await apiFetch(`/notifications`, {method: "POST", body: JSON.stringify(notification)});};
export const findAllNotificationByUser = async (userId: number, page: number = 1, limit: number = 15) => {
  const params = new URLSearchParams({page: String(page), limit: String(limit)}).toString();
  return await apiFetch(`/notifications/user/${userId}?${params}`);
};
export const countAllByUser = async (userId: number) => {return await apiFetch(`/notifications/user/${userId}/count-all`);};
export const findLast5NotificationByUser = async (userId: number) => {return await apiFetch(`/notifications/user/${userId}/last-5`);};
export const markNotificationAsReadById = async (notificationId: number) => {return await apiFetch(`/notifications/${notificationId}/read`, {method: "PATCH"});};
export const markNotificationAsUnreadById = async (notificationId: number) => {return await apiFetch(`/notifications/${notificationId}/unread`, {method: "PATCH"});};
export const markAllNotificationAsReadById = async (userId: number) => {return await apiFetch(`/notifications/user/${userId}/read-all`, {method: "PATCH"});};
export const countUnreadNotificationsByUser = async (userId: number) => { return await apiFetch(`/notifications/user/${userId}/unread-count`); };