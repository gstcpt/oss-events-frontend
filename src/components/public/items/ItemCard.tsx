"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Heart, Share2, Eye, Calendar, Check, Hash } from "lucide-react";
import { PublicItem } from "@/types/public/items";
import { createPublicItemInteraction } from "@/lib/api/public/items";
import { toast } from "sonner";
import { useEventCart } from "@/context/EventCartContext";
import AddedToPlanModal from "@/components/public/items/AddedToPlanModal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface ItemCardProps {
    item: PublicItem;
    viewType?: 'grid' | 'list';
    onQuickView?: (item: PublicItem) => void;
    isProviderDetail?: boolean;
}

export default function ItemCard({ item, viewType = 'grid', onQuickView, isProviderDetail }: ItemCardProps) {
    const t = useTranslations("ItemCard");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const { addToCart } = useEventCart();
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [showRatingTooltip, setShowRatingTooltip] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Initialize like and rating state from interactions
    useEffect(() => {
        const reactions = item.userReactions || (item as any).user_reactions || (item.stats as any)?.userReactions;
        if (reactions) {
            setIsLiked(Boolean(reactions.isLiked || reactions.isFavorite));
            if (reactions.userRating || reactions.user_rating) {
                setUserRating(Number(reactions.userRating || reactions.user_rating));
            }
        } else {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token && item.interactions) {
                const userLike = item.interactions.find(int => (int.type === 'LIKE' || int.type === 'HEART' || int.type === 'FAVORITE') && (int.value === 'true' || int.value === '1'));
                if (userLike) setIsLiked(true);

                const userRate = item.interactions.find(int => int.type === 'RATING' && int.value);
                if (userRate) setUserRating(Number(userRate.value));
            }
        }
    }, [item.interactions, item.userReactions, (item as any).user_reactions, (item.stats as any)?.userReactions]);

    // Calculate average rating from stats or interactions
    const calculateAverageRating = (): number => {
        const avg = (item.stats as any)?.avgRating || (item as any).rating || (item as any).avgRating || (item as any).average_rating || 0;
        if (typeof avg === 'number' && avg > 0) return Number(avg.toFixed(1));

        if (!item.interactions || item.interactions.length === 0) return 0;
        const ratings = item.interactions
            .filter((int) => int.type === 'RATING' && int.value)
            .map((int) => Number(int.value))
            .filter((val) => !isNaN(val) && val > 0);
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, val) => acc + val, 0);
        return Number((sum / ratings.length).toFixed(1));
    };

    const averageRating = calculateAverageRating();

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
            if (!token) {
                toast.error(t('pleaseLoginToLike'));
                return;
            }

            const newValue = !isLiked;
            setIsLiked(newValue);
            await createPublicItemInteraction(item.id, 'Like', String(newValue), token);
            toast.success(newValue ? t('addedToLikes') : t('removedFromLikes'));
        } catch (error) {
            setIsLiked(!isLiked);
            toast.error(t('failedToUpdateLike'));
        }
    };

    const handleRating = async (rating: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
            if (!token) {
                toast.error(t('pleaseLoginToRate'));
                return;
            }

            setUserRating(rating);
            await createPublicItemInteraction(item.id, 'Rating', String(rating), token);
            toast.success(rating === 1 ? t('ratedStars', { rating }) : t('ratedStarsPlural', { rating }));
        } catch (error) {
            toast.error(t('failedToSubmitRating'));
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: item.description || '',
                    url: window.location.origin + `/items/${item.id}`,
                });
                if (token) {
                    await createPublicItemInteraction(item.id, 'Share', '1', token);
                }
            } catch (error) {
                // User cancelled share or error occurred
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.origin + `/items/${item.id}`);
                if (token) {
                    await createPublicItemInteraction(item.id, 'Share', '1', token);
                }
                toast.success(t('linkCopied'));
            } catch (error) {
                toast.error(t('failedToCopyLink'));
            }
        }
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onQuickView) onQuickView(item);
    };

    const handleAddToPlan = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(item);
        setShowConfirmation(true);
    };

    return (
        <>
            <div className={cn("group bg-white rounded-xl shadow-xl shadow-footer/5 border border-[#ece9e0] hover:border-[var(--primary)]/30 transition-all duration-500 overflow-hidden relative flex flex-col", viewType === 'list' ? 'md:flex-row gap-6' : 'h-full')}>
                {/* Image Section (Top in grid, Left in list) */}
                <div className={cn("relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center transition-all duration-500 group-hover:shadow-inner", viewType === 'grid' ? "aspect-square" : "w-1/3 aspect-square shrink-0")}>
                    {/* Favorite Button (Top Right) */}
                    <button onClick={handleLike} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg transition-all active:scale-90 hover:bg-[var(--primary)] hover:text-white" aria-label={t("like")}>
                        <Heart className={cn("w-4 h-4 transition-colors", isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400')} />
                    </button>

                    {averageRating > 0 && (
                        <div className="absolute top-4 left-4 z-20 group/rating">
                            <div className="px-3 py-1.5 bg-amber-500/90 backdrop-blur-md rounded-full shadow-lg flex items-center gap-1.5 border border-white/20 transition-all group-hover/rating:px-4">
                                <Star className="w-3.5 h-3.5 fill-white text-white" />
                                <span className="text-xs font-bold text-white leading-none">{averageRating % 1 === 0 ? averageRating.toFixed(0) : averageRating.toFixed(1)}</span>
                            </div>

                            {/* Interactive Stars Backdrop */}
                            <div className="absolute top-0 left-0 h-full opacity-0 pointer-events-none group-hover/rating:opacity-100 group-hover/rating:pointer-events-auto transition-opacity duration-300 flex items-center gap-1 px-4 bg-amber-500 rounded-full shadow-xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={(e) => handleRating(star, e)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-1 transition-transform hover:scale-125">
                                        <Star className={cn("w-3.5 h-3.5 transition-colors", (hoverRating || userRating || 0) >= star ? "fill-white text-white" : "text-white/40")} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Link href={`/items/${item.id}`} className="w-full h-full block transform transition-transform duration-700 group-hover:scale-105">
                        <Image
                            width={500}
                            height={500}
                            alt={item.title}
                            src={item.image || item.cover || item.item_media?.[0]?.file || (item.item_media?.[0] as any)?.media || "/images/default.jpg"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/images/default.jpg"; }}
                        />
                    </Link>

                    {/* Quick View & Share (Bottom Left Overlay) */}
                    <div className="absolute bottom-4 left-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={handleQuickView} className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-slate-500 hover:bg-[var(--primary)] hover:text-white transition-all shadow-md" title={t("quickView")}>
                            <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={handleShare} className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-slate-500 hover:bg-[var(--primary)] hover:text-white transition-all shadow-md" title={t("share")}>
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col p-6">
                    <div className="mb-4">
                        <Link href={`/items/${item.id}`}><h3 className="text-xl font-bold text-[var(--footer)] mb-2 hover:text-[var(--primary)] transition-colors line-clamp-1">{item.title}</h3></Link>

                        {/* Categories as Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">{item.item_category?.[0]?.categories?.title || tCommon("service")}</span>
                            {item.code && (<span className="px-3 py-1 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Hash className="w-2.5 h-2.5 text-[var(--primary)]" />{item.code}</span>)}
                        </div>

                        <p className="text-[#7a7a68] text-sm line-clamp-2 leading-relaxed h-[2.5rem]">{item.description || t('defaultDescription')}</p>
                    </div>

                    {/* Footer Row: Price & Action */}
                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">{tCommon("price")}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-[var(--footer)]">{item.price ? Number(item.price).toLocaleString() : "---"}</span>
                                <span className="text-sm font-semibold text-slate-400">{tCommon("currency")}</span>
                            </div>
                        </div>

                        <button onClick={handleAddToPlan} className="flex-shrink-0 px-6 py-3.5 bg-[var(--footer)] hover:bg-[var(--primary)] text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-black/5 active:scale-95 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {t("addToPlan")}
                        </button>
                    </div>
                </div>
            </div>

            <AddedToPlanModal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} />
        </>
    );
}
