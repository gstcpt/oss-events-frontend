export type TargetType = 'CATEGORY' | 'ITEM' | 'PROVIDER' | 'BLOG' | 'category' | 'item' | 'provider' | 'blog';
export type ReactionType = 'LIKE' | 'DISLIKE' | 'RATING' | 'FAVORITE' | 'Like' | 'Dislike' | 'Rating' | 'Favorite';

export interface Reaction {
    id: number;
    userId: number;
    companyId?: number;
    targetType: TargetType;
    targetId: number;
    type: ReactionType;
    value?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReactionStats {
    likes: number;
    dislikes: number;
    favorites: number;
    avgRating: number;
    totalRatings: number;
    views: number;
    shares: number;
    comments: number;
}

export interface ReactionsData extends ReactionStats {
    userReactions: UserReactions;
}

export interface UserReactions {
    isLiked: boolean;
    isDisliked: boolean;
    userRating: number | null;
    isFavorite: boolean;
}

export interface InteractionResponse {
    success: boolean;
    isLiked?: boolean;
    isDisliked?: boolean;
    isFavorite?: boolean;
    userRating?: number;
    totalLikes?: number;
    totalDislikes?: number;
    avgRating?: number;
    totalRatings?: number;
    message?: string;
}