import { PublicItem } from "./items";

export interface HomePageStats {
    eventsCreated: number;
    activeVendors: number;
    activeServices: number;
    categoriesCount: number;
    blogPosts: number;
    audienceCount: number;
    newsletterSubscribers: number;
}
export interface Category {
    id: number;
    title: string;
    description: string;
    image: string;
    status: number;
    company_id: number;
    created_at?: string;
    updated_at?: string;
    item_category: Array<{ item_id: number; }>;
    children?: Array<{ item_category: Array<{ item_id: number; }> }>;
}
export interface Provider {
    id: number;
    user_id: number;
    category_id: number;
    ste_title: string;
    tarification: string;
    email: string;
    phone_number: string;
    whatsapp: string;
    fix_phone: string;
    fax: string;
    country: string;
    city: string;
    postal_code: string;
    street: string;
    department: string;
    map_location: string;
    website: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    experience: string;
    foundation_date: string;
    policy: string;
    payment_en_especes: number;
    payment_virement: number;
    payment_par_cheque: number;
    about: string;
    type_provider: number;
    logo: string;
    country_id: number;
    governorate_id: number;
    municipality_id: number;

    created_at: string;
    updated_at: string;
    users?: {
        items?: Array<any>;
    };
}
export interface Blog {
    id: number;
    title: string;
    content: string;
    image: string;
    date: string;
    user_id: number;
    author: {
        id: number;
        name: string;
        avatar?: string;
    } | null;
    likes: number;
    dislikes?: number;
    views: number;
    shares: number;
    rating: number;
    reviewCount: number;
    commentCount: number;
    company_id: number;
    status: number;
    created_at: string;
    updated_at: string;
    tags?: string[];
    categories?: string[];
}
export interface AudienceStat {
    totalEvents: number;
    uniqueClients: number;
    averageEventDuration: number;
    averageServicesPerEvent: number;
}
export interface NewsletterSubscriber {
    email: string;
    created_at: string;
}
export interface CompanyInfo {
    id: number;
    title: string;
    description: string;
    logo: string;
    contact: string;
    url: string;
}
export interface HomePageData {
    stats: HomePageStats;
    categories: Category[];
    providers: Provider[];
    blogs: Blog[];
    audienceStats: AudienceStat;
    newsletterSubscribers: NewsletterSubscriber[];
    items?: PublicItem[];
    companyInfo?: CompanyInfo;
}