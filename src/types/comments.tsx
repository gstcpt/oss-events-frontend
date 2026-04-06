export interface CommentUser {
    id: number;
    firstname?: string;
    lastname?: string;
    name?: string;
    avatar?: string;
}

export interface Comment {
    id: number;
    userId: number;
    targetType: 'CATEGORY' | 'ITEM' | 'PROVIDER' | 'BLOG';
    targetId: number;
    content: string;
    isEdited: boolean;
    editedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    user?: CommentUser;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface CommentsResponse {
    success: boolean;
    data: Comment[];
    pagination: Pagination;
}

export interface CommentResponse {
    success: boolean;
    comment?: Comment;
    message?: string;
}

export interface CreateCommentPayload {
    targetType: 'CATEGORY' | 'ITEM' | 'PROVIDER' | 'BLOG';
    targetId: number;
    content: string;
}
