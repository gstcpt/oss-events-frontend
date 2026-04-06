import { Category } from './categories';

export interface Tag {
    id: number;
    icon?: string;
    title: string;
    type?: string;
    filter_option?: number;
    company_id?: number;
    status?: number;
    tag_options?: TagOptions[];
    category_tags?: CategoryTag[];
    companies?: { id: number; title: string };
}

export interface TagOptions {
    id: number;
    tag_id: number;
    option_value?: string;
}

export interface TagOption {
  id: number;
  tag_id: number;
  option_value?: string;
}

export interface TableConfig {
    rows: number;
    columns: number;
    sideHeaders: string[];
    topHeaders: string[];
}

export interface TableCellData {
    row: number;
    col: number;
    value: string;
}

export interface CategoryTag {
    id: number;
    category_id: number;
    tag_id: number;
    categories: Category;
}