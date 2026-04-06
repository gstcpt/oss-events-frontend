export interface Blog {
    id: number;
    title: string;
    content: string;
    image?: string;
    date?: string;
    user_id: number;
    company_id?: number;
    company?: Company;
    status?: string;
    blog_media?: BlogMedia[];
    blogTags?: BlogTag[];
    blogCategories?: BlogCategory[];
    users?: User;
    companies?: Company;
    stats?: BlogStats;
    comments?: BlogComment[];
    user_rating?: number;
}
export interface BlogStats {
    likes: number;
    dislikes: number;
    favorites: number;
    ratings: {
        total: number;
        count: number;
        average: number;
    };
    comments: number;
    views: number;
    shares?: number;
}
export interface User {
    id: number;
    firstname?: string;
    lastname?: string;
    avatar?: string;
    username: string;
    email: string;
}

export interface Company {
    id: number;
    name?: string;
}

export interface BlogMedia {
    id: number;
    file: string;
    media_type?: string;
    blog_id?: number;
    company_id?: number;
}

export interface BlogComment {
    id: number;
    blog_id: number;
    user_id: number;
    content: string;
    created_at: string;
    users?: User;
}

export interface BlogRating {
    id: number;
    blog_id: number;
    user_id: number;
    rating: number;
}

export interface BlogTag {
    id: number;
    blog_id: number;
    tag_title: string;
}

export interface BlogCategory {
    id: number;
    blog_id: number;
    category_title: string;
}

export interface BlogLike {
    id: number;
    blog_id: number;
    user_id: number;
}