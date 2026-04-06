import { apiFetch } from "../api";
import { CommentsResponse, CommentResponse, CreateCommentPayload } from "@/types/comments";
import { TargetType } from "@/types/interactions";

// Helper for public endpoints (get/post)
const getPublicEndpoint = (targetType: TargetType, targetId: number) => {
    let path = targetType.toLowerCase() + 's';
    if (targetType === 'CATEGORY') path = 'categories';
    return `/public/${path}/${targetId}/comments`;
};

// Helper for comment-specific endpoints (put/delete)
const getCommentEndpoint = (commentId: number) => {
    return `/comments/${commentId}`;
};

export const getComments = async (targetType: TargetType, targetId: number, page: number = 1, limit: number = 20) => {
    return await apiFetch<CommentsResponse>(
        `${getPublicEndpoint(targetType, targetId)}?page=${page}&limit=${limit}`,
        { method: "GET" }
    );
};

export const createComment = async (payload: CreateCommentPayload) => {
    return await apiFetch<CommentResponse>(
        getPublicEndpoint(payload.targetType, payload.targetId),
        {
            method: "POST",
            body: JSON.stringify({ content: payload.content })
        }
    );
};

export const updateComment = async (commentId: number, content: string) => {
    return await apiFetch<CommentResponse>(
        getCommentEndpoint(commentId),
        {
            method: "PUT",
            body: JSON.stringify({ content })
        }
    );
};

/**
 * DELETE /comments/:id
 * This performs a hard-delete for Root users and a soft-delete for Admin users.
 */
export const deleteComment = async (commentId: number) => {
    return await apiFetch<CommentResponse>(
        getCommentEndpoint(commentId),
        { method: "DELETE" }
    );
};

/** 
 * PATCH /comments/:id 
 * Partially update a comment (e.g. soft delete, restore, or content change).
 */
export const patchComment = async (commentId: number, payload: any) => {
    return await apiFetch<CommentResponse>(
        getCommentEndpoint(commentId),
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        }
    );
};
