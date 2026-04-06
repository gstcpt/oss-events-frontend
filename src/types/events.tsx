import { Item } from "./items";

export interface Event {
    id: number;
    client_id: number;
    start_date: string;
    end_date: string;
    company_id: number;
    status: number;
    title: string;
    category?: string;
    guests?: number;
    description?: string;
    created_at?: string;
    updated_at?: string;
    client?: {
        id: number;
        firstname: string;
        lastname: string;
        phone: string;
        email: string;
    };
    event_lines?: EventLine[];
}

export interface EventLine {
    id: number;
    title?: string;
    event_id: number;
    item_id: number;
    start_date: string;
    end_date: string;
    price_ht: number;
    tva_value: number;
    price_ttc: number;
    discount: number;
    events?: Event;
    items?: Item;
}

export interface EventStatistics {
    event_id: number;
    event_title: string;
    items_used: number;
    unique_items_used: number;
    total_price: number;
    items_with_details: Array<{
        item: Item;
        event_line: EventLine;
        media_count: number;
        occupation_count: number;
        price_ht: number;
        tva_value: number;
        discount: number;
        price_ttc: number;
        final_price: number;
        start_date: string;
        end_date: string;
    }>;
    start_date: string | null;
    end_date: string | null;
    event_duration_days: number;
}
