import { User } from "./users";
import { EventLine } from "./events";
import { Tag, TagOptions } from "./tags";
import { ReactionsData } from "./interactions";

export interface Item {
    id: number;
    title: string;
    image: string;
    description?: string;
    price?: number;
    provider_id?: number;
    company_id?: number;
    status?: number;
    cover: string;
    code: string;
    created_at?: string;
    updated_at?: string;
    item_sections?: ItemSection[];
    reactions?: ReactionsData;
}

export interface ItemCategory {
    id: number;
    item_id: number;
    category_id: number;
}

export interface ItemMedia {
    id: number;
    file: string;
    media_type: string;
    item_id: number;
    company_id: number;
}

export interface ItemSection {
    id: number;
    item_id: number;
    label: string;
    type: string;
    tag_id?: number;
    positionv?: number;
    positionh?: number;
    required?: boolean;
    value?: string;
    item_section_options?: ItemSectionOption[];
    tags?: Tag;
}

export interface ItemSectionOption {
    id: number;
    item_section_id: number;
    option_value?: string;
    tag_option_id?: number;
    selected?: boolean;
    tag_options?: TagOptions;
}

export interface ItemOccupation {
    id: number;
    item_id: number;
    event_line_id: number;
    start_date: string;
    end_date: string;
    items: Item;
    event_lines: EventLine;
}

export interface Interaction {
    id: number;
    item_id: number;
    user_id: number;
    type: string;
    value: string;
    items: Item;
    users: User;
}