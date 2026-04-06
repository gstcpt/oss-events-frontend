import { Tag } from "../tags";
import { PublicItem } from "./items";

export interface PublicCategory {
    id: number;
    title: string;
    head_category_id?: number | null;
    image: string;
    description?: string | null;
    company_id?: number | null;
    status: number;
    item_category?: Array<{ item_id: number; category_id: number; }>;
    children?: PublicCategory[];
    category_tags?: {
        id: number;
        category_id: number;
        tag_id: number;
        tags?: Tag;
    }[];
    parent_category?: PublicCategory;
}

export interface CategoryItemsResponse {
    items: PublicItem[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}