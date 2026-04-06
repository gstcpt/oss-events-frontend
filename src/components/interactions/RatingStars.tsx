'use client';

import React, { useState, useEffect } from 'react';
import { TargetType } from '@/types/interactions';
import { rateTarget, getReactions } from '@/lib/api/interactions';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import { useTranslations } from 'next-intl';

interface RatingStarsProps {
    targetType: TargetType;
    targetId: number;
    onRate?: () => void;
    userRating?: number;
    avgRating?: number;
    totalRatings?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
    targetType, 
    targetId, 
    onRate,
    userRating: initialUserRating,
    avgRating: initialAvgRating,
    totalRatings: initialTotalRatings
}) => {
    const t = useTranslations("Interactions.rating");
    const [userRating, setUserRating] = useState<number | null>(initialUserRating || null);
    const [avgRating, setAvgRating] = useState(initialAvgRating || 0);
    const [totalRatings, setTotalRatings] = useState(initialTotalRatings || 0);
    const [isLoading, setIsLoading] = useState(!initialAvgRating && initialAvgRating !== 0);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { user } = useAuth();
    const isAuthenticated = !!user;
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (((initialAvgRating !== undefined && initialTotalRatings !== undefined) && (initialUserRating !== undefined || !user)) || hasFetched) {
             if (initialAvgRating !== undefined) setAvgRating(initialAvgRating);
             if (initialTotalRatings !== undefined) setTotalRatings(initialTotalRatings);
             setUserRating(initialUserRating || null);
             setIsLoading(false);
             return;
        }

        const fetchStats = async () => {
            setHasFetched(true);
            setIsLoading(true);
            try {
                const data = await getReactions(targetType, targetId, user?.id);
                if (data) {
                    setAvgRating(data.avgRating);
                    setTotalRatings(data.totalRatings);
                    if (data.userReactions) {
                        setUserRating(data.userReactions.userRating);
                    }
                }
            } catch (error) {
                toast.error(t('failedToFetch'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [targetType, targetId, user?.id, initialAvgRating, initialTotalRatings, initialUserRating]);

    const handleRate = async (value: number) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        const previousRating = userRating;
        const previousAvg = avgRating;
        const previousTotal = totalRatings;

        // Optimistic update
        setUserRating(value);
        const newTotal = previousRating ? totalRatings : totalRatings + 1;
        const newSum = (avgRating * totalRatings) - (previousRating || 0) + value;
        const newAvg = newTotal > 0 ? newSum / newTotal : 0;

        setAvgRating(newAvg);
        setTotalRatings(newTotal);

        try {
            const response = await rateTarget(targetType, targetId, value);
            if (response && response.success) {
                setAvgRating(response.avgRating || newAvg);
                setTotalRatings(response.totalRatings || newTotal);
                setUserRating(response.userRating || value);
                toast.success(t('ratingSubmitted'));
                if (onRate) onRate();
            } else {
                throw new Error(response?.message || 'Rating failed');
            }
        } catch (error) {
            setUserRating(previousRating);
            setAvgRating(previousAvg);
            setTotalRatings(previousTotal);
            toast.error(t('failedToSubmit'));
        }
    };

    if (isLoading) {
        return <div className="h-6 w-32 bg-gray-100 animate-pulse rounded"></div>;
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <div className="flex items-center space-x-1" onMouseLeave={() => setHoverRating(null)}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                        disabled={!isAuthenticated && false} // Let verify on click
                        aria-label={t('rateStars', { count: star })}
                        type="button"
                    >
                        <Star
                            className={`h-5 w-5 ${(hoverRating !== null ? star <= hoverRating : star <= (userRating || 0))
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">{t('votes', { rating: avgRating.toFixed(1), count: totalRatings })}</span>
            </div>
            {userRating && <span className="text-xs text-gray-500">{t('yourRating', { rating: userRating })}</span>}

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                redirectTo={window.location.pathname}
            />
        </div>
    );
};