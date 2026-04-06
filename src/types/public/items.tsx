import { PublicCategory } from "./categories";
import { Tag } from "../tags";

export interface TagFilterOption {
    id: number;
    option_value: string;
}

export interface TagFilter {
    id: number;
    icon: string | null;
    title: string;
    type: string | null;
    tag_options: TagFilterOption[];
}

export interface ItemSection {
    id: number;
    item_id: number;
    icon: string;
    label: string;
    type: string;
    positionv?: number;
    positionh?: number;
    tags?: Tag;
    item_section_options?: {
        id: number;
        item_section_id: number;
        form_line_id: number;
        option_value?: string;
        selected?: boolean;
        tagOptions?: {
            id: number;
            tag_id: number;
            title?: string;
            option_value?: string;
        };
    }[];
}

export interface PublicItem {
    id: number;
    verified?: boolean;
    code?: string;
    title: string;
    image?: string;
    cover?: string;
    description?: string;
    price?: number;
    provider_id?: number;
    company_id?: number;
    status: number;
    item_category?: {
        id: number;
        item_id: number;
        category_id: number;
        categories?: PublicCategory;
    }[];
    item_media?: {
        id: number;
        file: string;
        media_type?: string;
        item_id?: number;
        company_id?: number;
    }[];
    users?: {
        id: number;
        firstname?: string;
        lastname?: string;
        email?: string;
        avatar?: string;
        provider_info?: {
            id: number;
            user_id?: number;
            category_id?: number;
            categories?: PublicCategory;
            type_provider?: string;
            ste_title?: string;
            logo?: string;
            tarification?: string;
            email?: string;
            phone_number?: string;
            whatsapp?: string;
            fix_phone?: string;
            fax?: string;
            country?: string;
            city?: string;
            postal_code?: string;
            street?: string;
            department?: string;
            map_location?: string;
            website?: string;
            facebook?: string;
            instagram?: string;
            tiktok?: string;
            youtube?: string;
            experience?: number;
            foudation_date?: string;
            policy?: string;
            about?: string;
            payment_en_especes?: number;
            payment_virement?: number;
            payment_par_cheque?: number;
            country_id?: number;
            governorate_id?: number;
            municipality_id?: number;
            countries?: {
                id: number;
                name: string;
            };
            governorates?: {
                id: number;
                name: string;
            };
            municipalities?: {
                id: number;
                name: string;
                code: string;
            };
            provider_opening_hour?: {
                id: number;
                providerId: number;
                dayOfWeek: number;
                startTime: string;
                endTime: string;
                isActive: boolean;
            }[];
            provider_opening_exception?: {
                id: number;
                providerId: number;
                date: string;
                startTime?: string;
                endTime?: string;
                isClosed: boolean;
                note?: string;
            }[];
        }[];
    };
    item_sections?: ItemSection[];
    interactions?: {
        id: number;
        item_id?: number;
        user_id?: number;
        type?: string;
        value?: string;
    }[];
    stats?: {
        likes: number;
        dislikes: number;
        avgRating: number;
        totalRatings: number;
        views: number;
        shares: number;
        favorites: number;
    };
    comments?: any[]; // You might want to define a proper type for comments
    userReactions?: {
        isLiked: boolean;
        isDisliked: boolean;
        userRating: number | null;
        isFavorite: boolean;
    };
    similarItems?: PublicItem[];
    // Dynamic/Extended properties
    provider?: any[];
    provider_email?: string;
    rating?: number;
    reviewCount?: number;
    average_rating?: number;
}