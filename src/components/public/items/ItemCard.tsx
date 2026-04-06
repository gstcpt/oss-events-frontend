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
import { TiltCard, Reveal, Floating } from "@/components/ui/Motion3D";
import { motion, AnimatePresence } from "framer-motion";

interface ItemCardProps {
    item: PublicItem;
    viewType?: 'grid' | 'list';
    onQuickView?: (item: PublicItem) => void;
    isProviderDetail?: boolean;
    className?: string;
}

export default function ItemCard({ item, viewType = 'grid', onQuickView, isProviderDetail, className }: ItemCardProps) {
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
    const [isHovered, setIsHovered] = useState(false);

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
            if (!token) { toast.error(t('pleaseLoginToLike')); return; }
            const newValue = !isLiked;
            setIsLiked(newValue);
            await createPublicItemInteraction(item.id, 'Like', String(newValue), token);
            toast.success(newValue ? t('addedToLikes') : t('removedFromLikes'));
        } catch (error) { setIsLiked(!isLiked); toast.error(t('failedToUpdateLike')); }
    };

    const handleRating = async (rating: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
            if (!token) { toast.error(t('pleaseLoginToRate')); return; }
            setUserRating(rating);
            await createPublicItemInteraction(item.id, 'Rating', String(rating), token);
            toast.success(rating === 1 ? t('ratedStars', { rating }) : t('ratedStarsPlural', { rating }));
        } catch (error) { toast.error(t('failedToSubmitRating')); }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        if (navigator.share) {
            try {
                await navigator.share({ title: item.title, text: item.description || '', url: window.location.origin + `/items/${item.id}` });
                if (token) await createPublicItemInteraction(item.id, 'Share', '1', token);
            } catch {}
        } else {
            try {
                await navigator.clipboard.writeText(window.location.origin + `/items/${item.id}`);
                if (token) await createPublicItemInteraction(item.id, 'Share', '1', token);
                toast.success(t('linkCopied'));
            } catch { toast.error(t('failedToCopyLink')); }
        }
    };

    const handleQuickView = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (onQuickView) onQuickView(item); };

    const handleAddToPlan = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); addToCart(item); setShowConfirmation(true); };

    return (
        <>
            <TiltCard 
                intensity={8} 
                glare 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn("h-full", className)}
            >
                <div className={cn("group bg-white rounded-3xl shadow-xl shadow-black/5 border border-[#ece9e0] hover:border-[var(--primary)]/30 transition-all duration-700 overflow-hidden relative flex flex-col", viewType === 'list' ? 'md:flex-row gap-8 p-4' : 'h-full')}>
                    
                    {/* Image Section */}
                    <div className={cn("relative overflow-hidden bg-slate-50 flex items-center justify-center rounded-2xl", viewType === 'grid' ? "aspect-[4/5]" : "w-1/2 aspect-square md:aspect-auto shrink-0")}>
                        
                        {/* Rating Badge */}
                        <motion.div 
                            className="absolute top-4 left-4 z-20"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center gap-1.5 border border-slate-100">
                                <Star className={cn("w-3.5 h-3.5", averageRating > 0 ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                                <span className={cn("text-xs font-bold leading-none", averageRating > 0 ? "text-[var(--footer)]" : "text-slate-400")}>
                                    {averageRating > 0 ? averageRating.toFixed(1) : "New"}
                                </span>
                            </div>
                        </motion.div>

                        {/* Favorite Button */}
                        <motion.button 
                            onClick={handleLike} 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Heart className={cn("w-4 h-4 transition-colors", isLiked ? 'fill-red-500 text-red-500' : '')} />
                        </motion.button>

                        <Link href={`/items/${item.id}`} className="w-full h-full block group/img overflow-hidden">
                            <motion.div 
                                className="w-full h-full"
                                animate={{ scale: isHovered ? 1.1 : 1 }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                            >
                                <Image
                                    width={600}
                                    height={600}
                                    alt={item.title}
                                    src={item.image || item.cover || item.item_media?.[0]?.file || (item.item_media?.[0] as any)?.media || "/images/default.jpg"}
                                    className="w-full h-full object-cover transition-transform duration-700"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/default.jpg"; }}
                                />
                            </motion.div>
                        </Link>

                        {/* Hover Overlay Actions */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/20 pointer-events-none"
                                />
                            )}
                        </AnimatePresence>
                        
                        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center z-20">
                            <motion.div 
                                className="flex gap-2"
                                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                            >
                                <button onClick={handleQuickView} className="w-10 h-10 rounded-full bg-white text-slate-500 hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl flex items-center justify-center active:scale-90">
                                    <Eye className="w-4 h-6" />
                                </button>
                                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white text-slate-500 hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl flex items-center justify-center active:scale-90">
                                    <Share2 className="w-4 h-6" />
                                </button>
                            </motion.div>
                            
                            <motion.div animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}>
                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--footer)] shadow-xl">
                                    {item.item_category?.[0]?.categories?.title || "Item"}
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col p-6 pt-7 text-left">
                        <Link href={`/items/${item.id}`}>
                            <h3 className="text-xl font-bold text-[var(--footer)] mb-3 group-hover:text-[var(--primary)] transition-colors leading-snug line-clamp-2">
                                {item.title}
                            </h3>
                        </Link>
                        
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--background)] rounded-full border border-[#ece9e0]">
                                <MapPin className="w-3 h-3 text-[var(--primary)]" />
                                <span className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-wider">Tunis, TN</span>
                            </div>
                        </div>

                        <p className="text-[#a1a194] text-[13px] leading-relaxed line-clamp-2 mb-6">
                            {item.description || t('defaultDescription')}
                        </p>

                        {/* Price & Action */}
                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{tCommon("starting_from")}</span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black text-[var(--footer)] tracking-tighter">
                                        {item.price ? Number(item.price).toLocaleString() : "---"}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">{tCommon("currency")}</span>
                                </div>
                            </div>

                            <motion.button 
                                onClick={handleAddToPlan}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="h-14 px-7 bg-[var(--footer)] hover:bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-footer/10 active:shadow-inner flex items-center gap-3"
                            >
                                <Calendar className="w-4 h-4" />
                                {t("addToPlan")}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </TiltCard>

            <AddedToPlanModal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} />
        </>
    );
}
