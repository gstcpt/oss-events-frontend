import { AppSetting } from './app-settings';
import { User } from './users';
import { Company } from './companies';

export type MessageData = {
    id: number;
    source: string;
    email: string;
    sender_id: number;
    receiver_id: number;
    name: string;
    phone?: string;
    subject: string;
    message: string;
    status_for_sender: number;
    status_for_receiver: number;
    company_id: number;
    created_at: string;
    parent_message_id?: number | null;
}

export type MessageContact = {
    source: string;
    email: string;
    sender_id: number;
    receiver_id: number;
    name: string;
    phone?: string;
    subject: string;
    message: string;
    status_for_sender: number;
    status_for_receiver: number;
    company_id: number;
}

export type MessageInternal = {
    source: string;
    sender_id: number;
    receiver_id: number;
    subject: string;
    message: string;
    status_for_sender: number;
    status_for_receiver: number;
    company_id: number;
    parent_message_id?: number | null;
}

export type draftData = {
    sender_id: number;
    receiver_id: number;
    subject: string;
    message: string;
    parent_message_id?: number | null;
    source?: string;
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    status_for_sender?: number;
    status_for_receiver?: number;
    company_id?: number;
}

export type MessageFolder = 'inbox' | 'sent' | 'draft' | 'trash';