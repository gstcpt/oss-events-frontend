'use client';

import React, { useState, useEffect } from 'react';
import { TargetType } from '@/types/interactions';
import { Comment, Pagination } from '@/types/comments';
import { getComments, createComment, updateComment, deleteComment } from '@/lib/api/comments';
import { Button } from '@/components/ui/button';
import Textarea from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import moment from 'moment';
import { toast } from 'sonner';
import { Trash2, Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CommentSectionProps {
    targetType: TargetType;
    targetId: number;
    initialComments?: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ targetType, targetId, initialComments }) => {
    const t = useTranslations("Interactions.comments");
    const [comments, setComments] = useState<Comment[]>(initialComments || []);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { user } = useAuth();
    const isAuthenticated = !!user;

    const fetchComments = async (page = 1) => {
        try {
            const response = await getComments(targetType, targetId, page);
            if (response && response.success) {
                if (page === 1) { setComments(response.data); } else { setComments(prev => [...prev, ...response.data]); }
                setPagination(response.pagination);
            }
        } catch (error) { toast.error(t('failedToFetch')); }
    };

    useEffect(() => { 
        if (!initialComments || initialComments.length === 0) {
            fetchComments(); 
        }
    }, [targetType, targetId, initialComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await createComment({ targetType: targetType as any, targetId, content: newComment });
            if (response && response.success && response.comment) {
                setComments([response.comment, ...comments]);
                setNewComment('');
                toast.success(t('commentPosted'));
            } else { toast.error(t('failedToPost')); }
        } catch (error) { toast.error(t('errorPosting')); } finally { setIsSubmitting(false); }
    };

    const handleEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleUpdate = async (id: number) => {
        try {
            const response = await updateComment(id, editContent);
            if (response && response.success && response.comment) {
                setComments(comments.map(c => c.id === id ? response.comment! : c));
                setEditingId(null);
                toast.success(t('commentUpdated'));
            }
        } catch (e) { toast.error(t('failedToUpdate')); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('confirmDelete'))) return;
        try {
            const response = await deleteComment(id);
            if (response && response.success) {
                setComments(comments.filter(c => c.id !== id));
                toast.success(t('commentDeleted'));
            }
        } catch (e) { toast.error(t('failedToDelete')); }
    };

    return (
        <Card className="w-full mt-8">
            <CardHeader><CardTitle>{t('title')} ({pagination?.total || 0})</CardTitle></CardHeader>
            <CardContent>
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                        <Textarea placeholder={t('addComment')} value={newComment} onChange={(e) => setNewComment(e.target.value)} className="resize-none" />
                        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>{isSubmitting ? t('posting') : t('postComment')}</Button>
                    </form>
                ) : (
                    <div className="bg-gray-50 p-4 rounded-md mb-6 text-center">
                        <p className="text-gray-600 mb-2">{t('loginToJoin')}</p>
                        <Button variant="outline" onClick={() => setShowLoginModal(true)}>{t('login')}</Button>
                    </div>
                )}

                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className={`flex gap-4 p-3 rounded-lg ${comment.isDeleted ? 'bg-red-50 border border-red-100' : ''}`}>
                            <Avatar>
                                <AvatarImage src={comment.user?.avatar} />
                                <AvatarFallback>{comment.user?.firstname?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{comment.user ? `${comment.user.firstname} ${comment.user.lastname}` : t('unknownUser')}</span>
                                        {comment.isDeleted && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold  tracking-wider">{t('deleted')}</span>}
                                        <span className="text-xs text-gray-500">{moment(comment.createdAt).fromNow()} {comment.isEdited && ` ${t('edited')}`}</span>
                                    </div>
                                    {user && (Number(user.id) === Number(comment.userId) || Number(user.role_id) === 1 || Number(user.role_id) === 2) && !editingId && (
                                        <div className="flex gap-2">
                                            {Number(user.id) === Number(comment.userId) && !comment.isDeleted && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(comment)}><Edit2 className="h-3 w-3" /></Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => handleDelete(comment.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    )}
                                </div>

                                {editingId === comment.id ? (
                                    <div className="mt-2 space-y-2">
                                        <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleUpdate(comment.id)}>{t('save')}</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>{t('cancel')}</Button>
                                        </div>
                                    </div>
                                ) : (<p className={`whitespace-pre-wrap ${comment.isDeleted ? 'text-gray-500 italic' : 'text-gray-700'}`}>{comment.content}</p>)}
                            </div>
                        </div>
                    ))}

                    {pagination && pagination.page < pagination.pages && (<Button variant="link" className="w-full" onClick={() => fetchComments(pagination.page + 1)}>{t('loadMore')}</Button>)}

                    {comments.length === 0 && (<p className="text-center text-gray-500 py-8">{t('noComments')}</p>)}
                </div>
            </CardContent>

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} redirectTo={window.location.pathname} />
        </Card>
    );
};
