'use client';

import React, { useState, useEffect } from 'react';
import { TargetType, ReactionStats, UserReactions } from '@/types/interactions';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import { toggleLike, toggleDislike, getReactions } from '@/lib/api/interactions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ReactionButtonsProps {
    targetType: TargetType;
    targetId: number;
    stats?: ReactionStats;
    userReactions?: UserReactions;
    onReaction?: () => void;
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
    targetType,
    targetId,
    stats,
    userReactions,
    onReaction
}) => {
    const t = useTranslations("Interactions.reactions");
    const [likes, setLikes] = useState(stats?.likes || 0);
    const [dislikes, setDislikes] = useState(stats?.dislikes || 0);
    const [isLiked, setIsLiked] = useState<boolean>(Boolean(userReactions?.isLiked));
    const [isDisliked, setIsDisliked] = useState<boolean>(Boolean(userReactions?.isDisliked));
    const [isLoading, setIsLoading] = useState(!stats); // If stats provided, not loading
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { user } = useAuth();
    const isAuthenticated = !!user;

    // Sync state with props if they change (e.g. parent refetch)
    useEffect(() => {
        if (stats) {
            setLikes(stats.likes);
            setDislikes(stats.dislikes);
            setIsLoading(false);
        }
    }, [stats]);

    useEffect(() => {
        if (userReactions) {
            // Sync local state with props whenever they change
            const liked = !!userReactions.isLiked;
            const disliked = !!userReactions.isDisliked;
            setIsLiked(liked);
            setIsDisliked(disliked);
        }
    }, [userReactions?.isLiked, userReactions?.isDisliked]);

    const [hasFetched, setHasFetched] = useState(false);
    
    // Fetch reaction data on mount if not provided
    useEffect(() => {
        // If we have stats OR if there is no user logged in (and we have stats), skip fetch
        if ((stats && (userReactions || !user)) || hasFetched) {
            if (stats) setIsLoading(false);
            return;
        }

        const fetchReactions = async () => {
            setHasFetched(true);
            setIsLoading(true);
            try {
                const data = await getReactions(targetType, targetId, user?.id);
                if (data) {
                    setLikes(data.likes);
                    setDislikes(data.dislikes);
                    if (data.userReactions) {
                        setIsLiked(data.userReactions.isLiked);
                        setIsDisliked(data.userReactions.isDisliked);
                    }
                }
            } catch (error) {
                toast.error(t('failedToLoad'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchReactions();
    }, [targetType, targetId, user?.id, stats, userReactions]);

    // Optimistic updates
    const handleLike = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        const wasLiked = isLiked;
        const wasDisliked = isDisliked;
        const prevLikes = likes;
        const prevDislikes = dislikes;

        setIsLiked(!wasLiked);
        setLikes(wasLiked ? likes - 1 : likes + 1);

        if (wasDisliked) {
            setIsDisliked(false);
            setDislikes(dislikes - 1);
        }

        try {
            const response = await toggleLike(targetType, targetId);
            if (response && response.success !== undefined) {
                // Update with server response if valid
                // Actually relying on parent refetch is safer if onReaction is provided
                if (onReaction) onReaction();
            }
        } catch (error) {
            setIsLiked(wasLiked);
            setIsDisliked(wasDisliked);
            setLikes(prevLikes);
            setDislikes(prevDislikes);
            toast.error(t('failedToToggleLike'));
        }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        const wasLiked = isLiked;
        const wasDisliked = isDisliked;
        const prevLikes = likes;
        const prevDislikes = dislikes;

        setIsDisliked(!wasDisliked);
        setDislikes(wasDisliked ? dislikes - 1 : dislikes + 1);

        if (wasLiked) {
            setIsLiked(false);
            setLikes(likes - 1);
        }

        try {
            const response = await toggleDislike(targetType, targetId);
            if (response && response.success !== undefined) {
                if (onReaction) onReaction();
            }
        } catch (error) {
            setIsLiked(wasLiked);
            setIsDisliked(wasDisliked);
            setLikes(prevLikes);
            setDislikes(prevDislikes);
            toast.error(t('failedToToggleDislike'));
        }
    };

    if (isLoading) {
        return <div className="h-8 w-32 bg-gray-100 animate-pulse rounded"></div>;
    }

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                    "flex items-center gap-2 transition-colors border",
                    isLiked ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
            >
                <ThumbsUp className={cn("h-4 w-4", isLiked ? 'fill-emerald-600' : '')} />
                <span>{likes}</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={handleDislike}
                className={cn(
                    "flex items-center gap-2 transition-colors border",
                    isDisliked ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
            >
                <ThumbsDown className={cn("h-4 w-4", isDisliked ? 'fill-blue-600' : '')} />
                <span>{dislikes}</span>
            </Button>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                redirectTo={typeof window !== 'undefined' ? window.location.pathname : ''}
            />
        </div>
    );
};