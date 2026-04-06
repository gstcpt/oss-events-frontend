export interface BlogAuthor {
    id: number;
    name: string;
    avatar?: string;
}

export interface BlogComment {
    id: number;
    comment: string;
    created_at: string;
    user: BlogAuthor | null;
}

export interface BlogMedia {
    id: number;
    file: string;
    media_type?: string;
}

export interface Blog {
    id: number;
    title: string;
    content: string;
    image?: string;
    date?: string;
    user_id: number;
    author: BlogAuthor | null;
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

export interface BlogDetail extends Blog {
    comments: BlogComment[];
    media: BlogMedia[];
}

export interface FeaturedBlog {
    id: number;
    title: string;
    content: string;
    image?: string;
    date?: string;
    author: {
        name: string;
    } | null;
    rating: number;
    reviewCount: number;
    views: number;
    shares: number;
    tags?: string[];
    categories?: string[];
}
