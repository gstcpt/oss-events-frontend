'use client';

import React, { useState, useEffect } from 'react';
import { TargetType } from '@/types/interactions';
import { toggleFavorite, getReactions } from '@/lib/api/interactions';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface FavoriteButtonProps {
    targetType: TargetType;
    targetId: number;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
    className?: string;
    onDark?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    targetType,
    targetId,
    isFavorite: propIsFavorite,
    onFavoriteToggle,
    className,
    onDark
}) => {
    const t = useTranslations("Interactions.favorite");
    const [isFavorite, setIsFavorite] = useState(propIsFavorite || false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { user } = useAuth();
    const isAuthenticated = !!user;

    useEffect(() => {
        if (propIsFavorite !== undefined) {
            setIsFavorite(propIsFavorite);
        }
    }, [propIsFavorite]);

    useEffect(() => {
        if (propIsFavorite !== undefined || !isAuthenticated) return;

        const fetchStatus = async () => {
            try {
                const data = await getReactions(targetType, targetId, user?.id);
                if (data && data.userReactions) {
                    setIsFavorite(data.userReactions.isFavorite);
                }
            } catch (error) {
                toast.error(t('failedToFetch'));
            }
        };

        fetchStatus();
    }, [targetType, targetId, user, propIsFavorite, isAuthenticated]);

    const handleToggleFavorite = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        const prevIsFavorite = isFavorite;
        setIsFavorite(!prevIsFavorite);

        try {
            await toggleFavorite(targetType, targetId);
            if (onFavoriteToggle) {
                onFavoriteToggle();
            }
        } catch (error) {
            setIsFavorite(prevIsFavorite);
            toast.error(t('failedToUpdate'));
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={cn(
                    "transition-colors",
                    isFavorite
                        ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 border-red-200"
                        : (onDark ? "text-white bg-white/10 hover:bg-white/20 border-white/20 hover:text-red-300" : "text-gray-500 hover:text-red-500"),
                    className
                )}
                aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
            >
                <Heart className={cn("h-5 w-5", isFavorite ? 'fill-current' : '')} />
            </Button>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                redirectTo={typeof window !== 'undefined' ? window.location.pathname : ''}
            />
        </>
    );
};