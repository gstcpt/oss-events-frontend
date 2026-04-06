export interface Newsletter {
    id: bigint;
    email: string;
    company_id?: bigint;
    created_at?: Date;
    updated_at?: Date;
    companies?: {
        id: bigint;
        title: string;
    };
}

export interface NewsletterFormData {
    email: string;
    company_id?: number;
}

export interface NewsletterResponse {
    success: boolean;
    data?: Newsletter[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    message?: string;
    error?: string;
}

export interface NewsletterStats {
    totalSubscribers: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
}
