import { TagOptions } from "./tags";

export interface Form {
    id: number;
    title: string;
    company_id?: number;
    category_id?: number;
    status?: number;
    company_title?: string;
    category_title?: string;
    created_at?: string;
    updated_at?: string;
    form_lines?: formLines[];
}

export interface formLines {
    id: number;
    form_id: number;
    label: string;
    icon?: string;
    type: string;
    tag_id?: number;
    positionv?: number;
    positionh?: number;
    required?: boolean;
    form_line_options?: formLineOptions[];
    line_id?: string;
}

export interface formLineOptions {
    id: number;
    form_line_id: number;
    tag_option_id?: number;
    tag_option_value?: string;
    tagOptions?: TagOptions;
}

export interface formItem {
    id: number;
    form_id: number;
    item_id: number;
}
