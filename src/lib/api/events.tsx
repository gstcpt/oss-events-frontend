import { apiFetch } from "../api";
import { Event, EventLine, EventStatistics } from "@/types/events";
import { Company } from "@/types/companies";
import { User } from "@/types/users";
import { Item } from "@/types/items";

export const getAllEvents = async () => { return await apiFetch<Event[]>("/events"); };
export const getClientsByCompany2 = async (companyId: number) => { return await apiFetch<User[]>(`/companies/${companyId}/clients`); };
export const createEvent = async (event: Partial<Event>) => { return await apiFetch<{ event: Event }>("/events", { method: "POST", body: JSON.stringify(event) }); };
export const updateEvent = async (id: number, event: Partial<Event>) => { return await apiFetch<{ event: Event }>(`/events/${id}`, { method: "PATCH", body: JSON.stringify(event) }); };
export const deleteEvent = async (id: number) => { return await apiFetch(`/events/${id}`, { method: "DELETE" }); };
export const getAllEventLines = async () => { return await apiFetch<EventLine[]>("/event-lines"); };
export const createEventLine = async (eventLine: Partial<EventLine>) => { return await apiFetch<{ eventLine: EventLine }>("/event-lines", { method: "POST", body: JSON.stringify(eventLine) }); };
export const updateEventLine = async (id: number, eventLine: Partial<EventLine>) => { return await apiFetch<{ eventLine: EventLine }>(`/event-lines/${id}`, { method: "PATCH", body: JSON.stringify(eventLine) }); };
export const deleteEventLine = async (id: number) => { return await apiFetch(`/event-lines/${id}`, { method: "DELETE" }); };
export const getEventStatistics = async (eventId: number) => { return await apiFetch<EventStatistics>(`/events/${eventId}/stats`); };
export const createComplexEvent = async (
    companyId: number,
    clientId: number,
    eventStartDate: string,
    eventEndDate: string,
    title: string,
    category: string,
    guests: number,
    description: string,
    itemsWithDates: Array<{
        itemId: number;
        itemStartDate: string;
        itemEndDate: string;
        priceHt: number;
        tvaValue: number;
        discount: number;
    }>
) => { return await apiFetch<{ event: Event }>("/events/complex", { method: "POST", body: JSON.stringify({ companyId, clientId, eventStartDate, eventEndDate, title, category, guests, description, itemsWithDates }) }); };
export const updateComplexEvent = async (
    eventId: number,
    companyId: number,
    clientId: number,
    eventStartDate: string,
    eventEndDate: string,
    title: string,
    category: string,
    guests: number,
    description: string,
    itemsWithDates: Array<{
        id?: number;
        itemId: number;
        itemStartDate: string;
        itemEndDate: string;
        priceHt: number;
        tvaValue: number;
        discount: number;
        status?: number;
    }>
) => { return await apiFetch<{ event: Event }>(`/events/complex/${eventId}`, { method: "PATCH", body: JSON.stringify({ companyId, clientId, eventStartDate, eventEndDate, title, category, guests, description, itemsWithDates }) }); };
export const getCompanies = async () => { return await apiFetch<Company[]>("/companies"); };
export const getClientsByCompany = async (currentUser: any) => { return await apiFetch<User[]>("/users/clients/list", { method: "POST", body: JSON.stringify({ currentUser }) }); };
export const getAvailableItems = async (companyId: number) => { return await apiFetch<Item[]>("/items", { method: "GET" }); };