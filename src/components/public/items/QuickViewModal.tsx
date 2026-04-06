"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, Phone, Mail, ExternalLink, Calendar, Star, Info, LayoutGrid, CheckCircle2 } from "lucide-react";
import { PublicItem } from "@/types/public/items";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useEventCart } from "@/context/EventCartContext";
import AddedToPlanModal from "@/components/public/items/AddedToPlanModal";
import { FavoriteButton } from "@/components/interactions/FavoriteButton";
import { ReactionButtons } from "@/components/interactions/ReactionButtons";

interface QuickViewModalProps {
    item: PublicItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickViewModal({ item, isOpen, onClose }: QuickViewModalProps) {
    const t = useTranslations("QuickViewModal");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const { addToCart } = useEventCart();
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (!isOpen || !item) return null;

    const handleAddToCart = () => {
        addToCart(item);
        setShowConfirmation(true);
    };

    const priceValue = item.price ? Number(item.price) : 0;

    // Robust provider data extraction
    const provider = (item as any)?.provider?.[0] || item.users?.provider_info?.[0] || (item as any).provider_info?.[0] || (item as any).provider;
    const providerInfo = provider || item.users?.provider_info?.[0] || (item as any).provider_info?.[0];

    const ratingValue = (item.stats as any)?.avgRating || (item as any).rating || (item as any).avgRating || (item.stats as any)?.average_rating || (item as any).average_rating || 0;
    const ratingCount = (item.stats as any)?.totalRatings || (item.stats as any)?.reviewCount || (item as any).reviewCount || (item as any).reviews?.length || 0;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-[var(--footer)]/40 backdrop-blur-md transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal Container */}
                <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full h-full max-h-[85vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">

                    {/* LEFT: Media Section */}
                    <div className="md:w-1/2 relative bg-slate-50 flex flex-col">
                        <div className="relative flex-1 overflow-hidden group">
                            <Image
                                src={item.image || item.cover || item.item_media?.[0]?.file || (item.item_media?.[0] as any)?.media || "/images/default.jpg"}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />

                            {/* Glass Badge Top-Left */}
                            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                <span className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white text-[10px] font-bold text-[var(--footer)] uppercase tracking-widest shadow-sm">
                                    {item.item_category?.[0]?.categories?.title || (item as any).category?.title || tCommon("service")}
                                </span>
                                {item.code && (
                                    <span className="px-4 py-2 bg-[var(--footer)]/80 backdrop-blur-md rounded-2xl border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest shadow-sm flex items-center gap-2">
                                        <Info className="w-3 h-3 text-[var(--primary)]" />
                                        {item.code}
                                    </span>
                                )}
                            </div>

                            {/* Floating Close Button (Mobile Only) */}
                            <button
                                onClick={onClose}
                                className="md:hidden absolute top-6 right-6 z-[110] w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95"
                            >
                                <X className="w-6 h-6 text-slate-800" />
                            </button>
                        </div>

                        {/* Mobile bottom info summary ? or hidden */}
                    </div>

                    {/* RIGHT: Content Section */}
                    <div className="md:w-1/2 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                        {/* Header - Sticky */}
                        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--footer)] line-clamp-1 leading-tight">{item.title}</h2>
                            <button
                                onClick={onClose}
                                className="hidden md:flex w-10 h-10 rounded-full hover:bg-slate-50 transition-colors items-center justify-center text-slate-400 hover:text-red-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 flex-1">
                            {/* Price & Rating Row */}
                            <div className="flex items-center justify-between gap-4 p-6 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{tCommon('price')}</p>
                                    <div className="flex items-baseline gap-1.5">
                                        {priceValue > 0 ? (
                                            <>
                                                <span className="text-3xl font-bold text-[var(--footer)]">{priceValue.toLocaleString()}</span>
                                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{tCommon('currency')}</span>
                                            </>
                                        ) : (
                                            <span className="text-xl font-bold text-[var(--primary)] italic">{t('contactForPricing')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{tCommon('rating')}</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-bold text-[var(--footer)] leading-none">
                                                {ratingValue > 0 ? Number(ratingValue).toFixed(1) : "---"}
                                            </span>
                                            {ratingCount > 0 && (
                                                <span className="text-[10px] text-slate-400 font-bold">({ratingCount} {tCommon('reviews')})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interactions Row */}
                            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tCommon('interactions')}</div>
                                <div className="flex items-center gap-3">
                                    <FavoriteButton
                                        targetType="ITEM"
                                        targetId={item.id}
                                        isFavorite={(item.stats as any)?.userReactions?.isFavorite}
                                    />
                                    <ReactionButtons
                                        targetType="ITEM"
                                        targetId={item.id}
                                        stats={item.stats as any}
                                        userReactions={(item.stats as any)?.userReactions}
                                    />
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest border-l-2 border-[var(--primary)] pl-3">
                                    {t('description')}
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">
                                    {item.description || t('noDescription')}
                                </p>
                            </div>

                            {/* Provider Card Mini */}
                            {provider && (
                                <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-sm shadow-black/5 hover:border-[var(--primary)]/20 transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-50 overflow-hidden relative">
                                            {provider.logo ? (
                                                <Image src={provider.logo} alt="Logo" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-[var(--primary)] uppercase">{(provider.ste_title || 'P')[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--footer)] flex items-center gap-2 leading-none mb-1">
                                                {provider.ste_title || (provider.first_name ? `${provider.first_name} ${provider.last_name}` : t('serviceProvider'))}
                                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                            </h4>
                                            <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                <MapPin size={10} strokeWidth={3} className="text-slate-300" />
                                                {providerInfo?.municipalities?.name
                                                    ? `${providerInfo.governorates?.name || ''}, ${providerInfo.municipalities.name}`
                                                    : (providerInfo?.city || providerInfo?.location || (item as any).provider_city || (item as any).provider_location || tCommon('location_na'))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {provider.phone_number && (
                                            <a href={`tel:${provider.phone_number}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-[var(--primary)]/5 transition-colors group/link">
                                                <Phone className="w-4 h-4 text-slate-400 group-hover/link:text-[var(--primary)]" />
                                                <span className="text-[11px] font-bold text-slate-600 truncate">{provider.phone_number}</span>
                                            </a>
                                        )}
                                        {providerInfo.email && (
                                            <a href={`mailto:${providerInfo.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-[var(--primary)]/5 transition-colors group/link">
                                                <Mail className="w-4 h-4 text-slate-400 group-hover/link:text-[var(--primary)]" />
                                                <span className="text-[11px] font-bold text-slate-600 truncate">{providerInfo.email}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="sticky bottom-0 z-20 p-8 pt-4 bg-gradient-to-t from-white via-white to-transparent flex flex-col sm:flex-row gap-4">
                            <Link href={`/items/${item.id}`} className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full py-7 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    {tCommon('view_details')}
                                </Button>
                            </Link>
                            <Button
                                onClick={handleAddToCart}
                                className="flex-[1.5] py-7 rounded-xl bg-[var(--footer)] hover:bg-[var(--primary)] text-white font-bold shadow-xl shadow-footer/5 transition-all flex items-center justify-center gap-3"
                            >
                                <Calendar className="w-4 h-4" />
                                {tCommon('add_to_plan')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <AddedToPlanModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
            />
        </>
    );
}
