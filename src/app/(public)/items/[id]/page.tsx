"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
    ArrowLeft, Building2, Heart, MapPin, Star, Users, Phone, Globe, Mail,
    Facebook, Instagram, X, Check, Youtube, PhoneCall, Eye, ThumbsUp,
    ThumbsDown, MessageCircle, Share2, ChevronLeft, ChevronRight, Calendar, Plus,
    Music2, Clock, Briefcase
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getPublicItemById, trackItemShare } from "@/lib/api/public/items";
import { PublicItem, ItemSection } from "@/types/public/items";
import { useAuth } from "@/context/AuthContext";
import DisplayIcon from "@/components/ui/DisplayIcon";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { ReactionButtons } from "@/components/interactions/ReactionButtons";
import { RatingStars } from "@/components/interactions/RatingStars";
import { CommentSection } from "@/components/interactions/CommentSection";
import { FavoriteButton } from "@/components/interactions/FavoriteButton";
import { ShareButton } from "@/components/interactions/ShareButton";
import { useViewTracker } from "@/lib/tracking/view-tracker";
import { useEventCart } from "@/context/EventCartContext";
import AddedToPlanModal from "@/components/public/items/AddedToPlanModal";
import ItemCard from "@/components/public/items/ItemCard";
import QuickViewModal from "@/components/public/items/QuickViewModal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import MediaGallery from "@/components/ui/MediaGallery";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollProgressBar, TiltCard, Reveal, Stagger, StaggerItem, ParticleField, Floating, CountUp } from "@/components/ui/Motion3D";

// Dynamic import for Map
const LeafletMapPicker = dynamic(() => import('@/components/ui/LeafletMapPicker'), {
    ssr: false,
    loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-xl" />
});

/* ═══════════════════════════════════════════════════
   HELPER: SECTION RENDERER
   ═══════════════════════════════════════════════════ */
function SectionContent({ section, t }: { section: ItemSection, t: any }) {
    const opts = section.item_section_options || [];

    if (section.type === 'range') {
        const cfg = opts[0]?.option_value || '';
        if (typeof cfg !== 'string') return <span className="text-[#7a7a68]/70 italic">{t("not_specified")}</span>;
        const parts = cfg.split(',').map(p => p.split(':'));
        const map = Object.fromEntries(parts.filter(p => p.length === 2));
        const min = map.min;
        const max = map.max;
        const unitRaw = map.unit;
        const unit = unitRaw === 'Pers' ? t("person") : unitRaw || '';
        if (!min || !max) return <span className="text-[#7a7a68]/70 italic">{t("not_specified")}</span>;
        return (
            <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-[var(--footer)]">{min}</span>
                <span className="text-[#7a7a68] font-medium"> - </span>
                <span className="text-xs font-medium text-[var(--footer)]">{max}</span>
                {unit && <span className="text-[#7a7a68] font-medium text-xs ml-2">({unit})</span>}
            </div>
        );
    }

    if (section.type === 'checkbox') {
        const available = opts.filter((opt: any) => opt.selected !== false);
        const unavailable = opts.filter((opt: any) => opt.selected === false);
        const hasAvailable = available.length > 0;
        const hasUnavailable = unavailable.length > 0;

        return (
            <div className="space-y-6">
                {hasAvailable && (
                    <div className="space-y-4">
                        {hasUnavailable && <h3 className="text-[10px] font-medium text-emerald-600 tracking-widest flex items-center gap-2"><Check className="w-3 h-3" /> {t("available")}</h3>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {available.map((option: any) => (
                                <div key={option.id} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/30 border border-emerald-100/50 transition-all hover:bg-emerald-50 hover:shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <span className="font-medium text-slate-700 text-[11px] tracking-wide leading-tight break-words min-w-0">
                                        {option.tagOptions?.title || option.option_value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {hasUnavailable && (
                    <div className="space-y-4">
                        {hasAvailable && <h3 className="text-[10px] font-medium text-slate-300 tracking-widest flex items-center gap-2"><X className="w-3 h-3" /> {t("not_available")}</h3>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {unavailable.map((option: any) => (
                                <div key={option.id} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100/50 opacity-40">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                        <X className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <span className="font-medium text-slate-400 line-through text-[11px] tracking-wide leading-tight break-words min-w-0">
                                        {option.tagOptions?.title || option.option_value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (section.type === 'date') {
        if (opts.length === 0) return <p className="text-[#7a7a68]/70 italic text-xs">{t("not_specified")}</p>;
        return (
            <div className="flex flex-wrap gap-2">
                {opts.map((option: any) => {
                    const parts = (option.option_value || '').split(',');
                    const val = parts.find((p: string) => p.startsWith('value:'))?.split(':')[1] || '';
                    const unit = parts.find((p: string) => p.startsWith('unit:'))?.split(':')[1] || '';
                    return (
                        <div key={option.id} className="flex items-center px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-[var(--primary)] mr-2" />
                            <span className="font-medium text-[var(--footer)] text-xs">{val}</span>
                            {unit && <span className="ml-1 text-[10px] font-medium text-slate-400 tracking-wider">({unit})</span>}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (section.type === 'table') {
        const opt = opts[0]?.option_value;
        if (!opt) return <p className="text-[#7a7a68]/70 italic text-xs">{t("not_specified")}</p>;
        try {
            const data = typeof opt === 'string' ? JSON.parse(opt) : opt;
            const { rows, columns, sideHeaders, topHeaders, cells } = data;
            return (
                <div className="overflow-x-auto rounded-xl border border-[#ece9e0] shadow-sm">
                    <table className="w-full text-xs text-left border-collapse bg-[#fafafa]">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="p-3 border-b border-r border-[#ece9e0] bg-slate-100"></th>
                                {Array.from({ length: columns }).map((_, i) => (
                                    <th key={i} className="p-3 border-b border-r border-[#ece9e0] font-bold text-[var(--footer)] tracking-wider text-center">
                                        {topHeaders?.[i] || `Col ${i + 1}`}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: rows }).map((_, r) => (
                                <tr key={r} className="hover:bg-white transition-colors">
                                    <td className="p-3 border-b border-r border-[#ece9e0] bg-slate-50 font-medium text-slate-500 tracking-tighter">
                                        {sideHeaders?.[r] || `Row ${r + 1}`}
                                    </td>
                                    {Array.from({ length: columns }).map((_, c) => (
                                        <td key={c} className="p-3 border-b border-r border-[#ece9e0] text-center font-semibold text-slate-600">
                                            {cells?.[`${r}-${c}`] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } catch (e) { return <p className="text-red-400 italic text-xs">Error parsing table data</p>; }
    }

    if (section.type === 'text' || section.type === 'number') {
        if (opts.length === 0) return <p className="text-[#7a7a68]/70 italic text-xs">{t("not_specified")}</p>;
        return (
            <div className="grid grid-cols-1 gap-2">
                {opts.map((option: any) => (
                    <div key={option.id} className="flex items-center">
                        <span className="font-medium text-[var(--footer)] text-xs">{option.option_value}</span>
                    </div>
                ))}
            </div>
        );
    }

    if (section.type === 'select' || section.type === 'radio') {
        const selected = opts.filter((o: any) => o.selected === true);
        const unselected = opts.filter((o: any) => o.selected === false);
        if (selected.length > 0) {
            return (
                <div className="grid grid-cols-1 gap-2">
                    {selected.map((option: any) => (
                        <div key={option.id} className="flex items-center justify-between">
                            <span className="font-medium text-[var(--footer)] text-xs tracking-wide leading-tight break-words min-w-0">{option.tagOptions?.title || option.option_value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        if (unselected.length > 0) {
            return (
                <div className="grid grid-cols-1 gap-2 opacity-40 grayscale">
                    {unselected.map((option: any) => (
                        <div key={option.id} className="flex items-center justify-between">
                            <span className="font-medium text-[var(--footer)] text-xs tracking-wide leading-tight break-words min-w-0 line-through">{option.tagOptions?.title || option.option_value}</span>
                        </div>
                    ))}
                </div>
            );
        }
    }

    if (opts.length === 0) return <p className="text-[#7a7a68]/70 italic text-xs">{t("not_specified")}</p>;
    return (
        <div className="grid grid-cols-1 gap-2">
            {opts.map((option: any) => (
                <div key={option.id} className="flex items-center justify-between">
                    <span className="font-medium text-[var(--footer)] text-xs">{option.option_value}</span>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('');
    useEffect(() => { params.then(p => setId(p.id)); }, [params]);
    const itemId = Number(id);

    // View Tracking
    useViewTracker('items', itemId);

    const [item, setItem] = useState<PublicItem | null>(null);
    const [isDesktop, setIsDesktop] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const handleQuickView = (item: any) => {
        setSelectedItem(item);
        setIsQuickViewOpen(true);
    };

    const { user } = useAuth();
    const { addToCart } = useEventCart();
    const router = useRouter();
    const t = useTranslations("ItemDetailPage");

    // Carousel setup
    const autoplaySimilar = Autoplay({ delay: 3500, stopOnInteraction: false });
    const [similarEmblaRef, similarEmblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplaySimilar]);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchItem = useCallback(async () => {
        if (!itemId) return;
        try {
            setLoading(true);
            const data = await getPublicItemById(itemId, user?.id);
            setItem(data);
        } catch (error) {
            toast.error(t("error_loading"));
        } finally {
            setLoading(false);
        }
    }, [itemId, user?.id, t]);

    useEffect(() => {
        if (itemId) fetchItem();
    }, [itemId, fetchItem]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                    <p className="text-[#7a7a68]">{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[var(--footer)] mb-2">{t("not_found")}</h2>
                    <p className="text-[#7a7a68]">{t("not_found_subtitle")}</p>
                    <Link href="/items" className="mt-4 inline-block text-[var(--primary)] hover:underline">← {t("back_to_services")}</Link>
                </div>
            </div>
        );
    }

    // Data Derivations
    const provider_info = item.users?.provider_info?.[0];
    const providerName = provider_info?.ste_title || `${item.users?.firstname || ''} ${item.users?.lastname || ''}`.trim() || 'Provider';
    const categories = item.item_category?.map(ic => ic.categories?.title).filter(Boolean) || [];
    const primaryCategory = categories[0] || 'Service';
    const media = item.item_media?.map(m => (m as any).file || (m as any).media).filter(Boolean) || [];
    const mainImage = item.image || item.cover || media[0] || "/images/default.jpg";
    const cover = item.cover || mainImage;
    const amenities = item.item_sections?.filter(section => section.type === 'amenity') || [];
    const stats = item?.stats;
    const views = stats?.views || 0;
    const likes = stats?.likes || 0;
    const dislikes = stats?.dislikes || 0;
    const favori = stats?.favorites || 0;
    const shares = stats?.shares || 0;
    const commentsCount = item?.comments?.length || 0;
    const similarItems = (item as any)?.similarItems || [];

    const priceValue = (() => {
        const p: any = (item as any).price;
        if (p === null || p === undefined) return null;
        if (typeof p === 'number') return p;
        if (typeof p === 'string') {
            const n = Number(p);
            return Number.isFinite(n) ? n : null;
        }
        return null;
    })();

    const sortedSections = item.item_sections?.filter(s => s.type !== 'amenity').reduce((acc, section) => {
        const row = section.positionv || 0;
        if (!acc[row]) acc[row] = [];
        acc[row].push(section);
        return acc;
    }, {} as Record<number, ItemSection[]>);

    const sortedRows = Object.keys(sortedSections || {}).sort((a, b) => Number(a) - Number(b)).map(row => {
        return sortedSections![Number(row)].sort((a, b) => (a.positionh || 0) - (b.positionh || 0));
    });

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <ScrollProgressBar />
            {/* Hero section – parallax zoom */}
            <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Image src={cover} fill alt={item.title} className="w-full h-full object-cover" priority />
                </motion.div>
                <div className="absolute inset-0 bg-[var(--footer)]/40 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--footer)]/60 via-transparent to-[var(--background)]" />
                <ParticleField count={12} color="var(--primary)" />

                {/* Hero Buttons */}
                <div className="absolute top-32 left-4 right-4 md:left-10 md:right-10 z-50 flex justify-between items-center">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-3 md:px-6 bg-black/40 backdrop-blur-xl border border-white/30 rounded-full text-white hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-500 group shadow-xl"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t("back_to_services")}</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="flex gap-3"
                    >
                        <FavoriteButton
                            targetType="ITEM"
                            targetId={itemId}
                            isFavorite={item.userReactions?.isFavorite || false}
                            onFavoriteToggle={fetchItem}
                            onDark={true}
                            className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-xl rounded-full border border-white/30 hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-500 shadow-xl"
                        />
                    </motion.div>
                </div>

                <div className="absolute bottom-20 left-10 right-10 max-w-7xl mx-auto px-4 z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)]/90 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-xl"
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        {primaryCategory}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
                    >
                        {item.title}
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-wrap items-center gap-6 text-white/90 font-bold text-sm md:text-base"
                    >
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push(`/providers/${item.users?.id}`)}>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 group-hover:border-[var(--primary)] transition-all">
                                <Image src={item.users?.avatar || "/images/default-images/providers/provider.jpg"} width={40} height={40} alt={providerName} className="object-cover" />
                            </div>
                            <span className="hover:text-[var(--primary)] transition-colors">{providerName}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Stats Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-xl shadow-2xl shadow-black/[0.03] border border-[#ece9e0] p-8 flex flex-wrap items-center justify-between gap-8 md:gap-12"
                        >
                            <div className="flex-1 min-w-[300px]">
                                <div className="flex flex-wrap gap-8 items-center border-b border-slate-50 pb-6 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("price")}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-[var(--footer)] group-hover:text-[var(--primary)] transition-colors duration-500">
                                                {priceValue?.toLocaleString()} TND
                                            </span>
                                            <span className="text-[#7a7a68] text-xs font-bold uppercase tracking-wider">{t("per_service")}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 sm:flex-initial">
                                            <Button
                                                onClick={() => { if (item) { addToCart(item); setShowConfirmation(true); } }}
                                                className="w-full sm:w-auto bg-[var(--footer)] text-white hover:bg-[var(--primary)] px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 shadow-lg flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                {t("add_to_plan")}
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ReactionButtons targetType="ITEM" targetId={itemId} />
                                            <ShareButton title={item.title} onShare={async () => { await trackItemShare(itemId, "web"); fetchItem(); }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <Reveal direction="up" delay={0.1}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-10 md:p-12">
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-xl font-bold text-[var(--footer)] mb-4 flex items-center gap-3">
                                    <DisplayIcon iconName="info" className="w-6 h-6 text-[var(--primary)]" />
                                    {t("about_service")}
                                </h2>
                                <p className="text-[#7a7a68] leading-relaxed">
                                    {item.description || t("no_description", { category: primaryCategory.toLowerCase(), provider: providerName })}
                                </p>
                            </div>
                        </div>
                        </Reveal>

                        {amenities.length > 0 && (
                            <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-10 md:p-12">
                                <h2 className="text-xl font-bold text-[var(--footer)] mb-6 flex items-center gap-3">
                                    <DisplayIcon iconName="award" className="w-6 h-6 text-[var(--primary)]" />
                                    {t("amenities_features")}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-start gap-4 p-5 rounded-xl border-2 bg-green-50/50 border-green-100 text-green-800 transition-all hover:bg-green-50">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-100">
                                                <Check className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-bold block text-sm uppercase tracking-wide">{amenity.label}</span>
                                                <span className="text-xs text-green-600/80 font-medium">{amenity.item_section_options?.[0]?.option_value || t("available")}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sortedRows.map((row, i) => (
                            <Reveal direction="up" delay={0.2} key={i}>
                            <div className="mb-8">
                                <div className={cn(
                                    "grid gap-4 md:gap-6 grid-cols-1",
                                    row.length === 2 && "md:grid-cols-2",
                                    row.length === 3 && "lg:grid-cols-3",
                                    row.length >= 4 && "lg:grid-cols-2 xl:grid-cols-4"
                                )}>
                                    {row.map((section) => (
                                        <div key={section.id} className="bg-white rounded-xl p-3 md:p-4 border border-[#ece9e0] shadow-xl shadow-black/5 h-full flex flex-col hover:border-[var(--primary)]/30 transition-all duration-300">
                                            <div className="flex items-start gap-4 mb-4 md:mb-6 shrink-0">
                                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0 transition-transform duration-300 hover:scale-110">
                                                    <DisplayIcon iconName={section.icon || 'square'} className="w-3 h-3 md:w-4 h-4" />
                                                </div>
                                                <h3 className="text-xs md:text-base font-bold text-[var(--footer)] leading-snug break-words min-w-0 pt-0.5">
                                                    {section.label}
                                                </h3>
                                            </div>

                                            <div className="flex-1">
                                                <SectionContent section={section} t={t} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </Reveal>
                        ))}

                        {/* Gallery */}
                        <Reveal direction="up" delay={0.25}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8 md:p-10">
                            <h2 className="text-xl font-bold text-[var(--footer)] mb-8 flex items-center gap-3">
                                <DisplayIcon iconName="image" className="w-6 h-6 text-[var(--primary)]" />
                                {t("gallery")}
                            </h2>
                            <MediaGallery media={media} moreLabel={t("more") || "More"} galleryLabel={t("gallery")} />
                        </div>
                        </Reveal>

                        {/* Similar Items Carousel */}
                        {similarItems && similarItems.length > 0 && (
                            <Reveal direction="up" delay={0.3}>
                            <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8 md:p-10">
                                <h2 className="text-xl font-bold text-[var(--footer)] mb-8 flex items-center gap-3">
                                    <DisplayIcon iconName="list" className="w-6 h-6 text-[var(--primary)]" />
                                    {t("similar_items")}
                                </h2>
                                <div ref={similarEmblaRef} className="overflow-hidden">
                                    <div className="flex">
                                        {similarItems.filter((it: any) => it.id !== itemId).map((it: any, index: number) => (
                                            <div key={index} className="basis-1/1 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex-shrink-0 p-3">
                                                <ItemCard
                                                    item={it}
                                                    onQuickView={handleQuickView}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            </Reveal>
                        )}

                        {/* Reviews & Comments */}
                        <Reveal direction="up" delay={0.35}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8 md:p-10">
                            <h2 className="text-xl font-bold text-[var(--footer)] mb-10 flex items-center gap-3">
                                <DisplayIcon iconName="message-circle" className="w-6 h-6 text-[var(--primary)]" />
                                {t("reviews_comments")}
                            </h2>
                            <div className="mb-12 border-b border-[#ece9e0] pb-10">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">{t("rate_service")}</h3>
                                <RatingStars targetType="ITEM" targetId={itemId} />
                            </div>
                            <CommentSection targetType="ITEM" targetId={itemId} />
                        </div>
                        </Reveal>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Provider Information */}
                        <Reveal direction="left" delay={0.15}>
                        <TiltCard intensity={5}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8 relative overflow-hidden">
                            <ParticleField count={5} color="var(--primary)" />
                            <h2 className="text-lg font-bold text-[var(--footer)] mb-8 uppercase tracking-widest text-[#7a7a68]/60">{t("provider")}</h2>
                            {provider_info && (
                                <div className="flex items-center gap-5 mb-8 p-6 rounded-xl bg-slate-50 border border-slate-100 group cursor-pointer" onClick={() => router.push(`/providers/${item.users?.id}`)}>
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                        <Image src={provider_info?.logo || "/images/default-images/providers/provider.jpg"} fill alt={providerName} className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[var(--footer)] text-lg line-clamp-1 group-hover:text-[var(--primary)] transition-colors">{providerName}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{provider_info?.categories?.title || t("service_provider")}</p>
                                    </div>
                                </div>
                            )}

                            {provider_info && (
                                <div className="flex flex-wrap gap-2 mb-8 border-y border-slate-50 py-4">
                                    {provider_info?.whatsapp && (
                                        <a target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-green-50 hover:bg-green-600" href={`https://wa.me/${provider_info?.whatsapp}`}>
                                            <PhoneCall className="w-5 h-5 transition-colors text-green-600 group-hover:text-white" />
                                        </a>
                                    )}
                                    {provider_info?.facebook && (
                                        <a target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-blue-50 hover:bg-blue-600" href={provider_info?.facebook}>
                                            <Facebook className="w-5 h-5 transition-colors text-blue-600 group-hover:text-white" />
                                        </a>
                                    )}
                                    {provider_info?.instagram && (
                                        <a target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-pink-50 hover:bg-pink-600" href={provider_info?.instagram}>
                                            <Instagram className="w-5 h-5 transition-colors text-pink-600 group-hover:text-white" />
                                        </a>
                                    )}
                                    {provider_info?.tiktok && (
                                        <a target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 hover:bg-slate-900" href={provider_info?.tiktok}>
                                            <Music2 className="w-5 h-5 transition-colors text-slate-600 group-hover:text-white" />
                                        </a>
                                    )}
                                    {provider_info?.youtube && (
                                        <a target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-red-50 hover:bg-red-600" href={provider_info?.youtube}>
                                            <Youtube className="w-5 h-5 transition-colors text-red-600 group-hover:text-white" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {provider_info?.about && (
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t("about_provider")}</h3>
                                    <p className="text-sm text-[#7a7a68] leading-relaxed italic">{provider_info?.about}</p>
                                </div>
                            )}

                            <Button
                                onClick={() => router.push(`/providers/${item.users?.id}`)}
                                variant="outline"
                                className="w-full rounded-xl border-2 border-[#ece9e0] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 font-bold uppercase tracking-widest text-[10px] py-6 transition-all"
                            >
                                {t("view_profile")}
                            </Button>
                        </div>
                        </TiltCard>
                        </Reveal>

                        {/* Contact & Map */}
                        <Reveal direction="left" delay={0.25}>
                        <TiltCard intensity={4}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8">
                            <h2 className="text-lg font-bold text-[var(--footer)] mb-6 uppercase tracking-widest text-[#7a7a68]/60">{t("contact")}</h2>
                            <div className="space-y-4">
                                {provider_info?.phone_number && (
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#7a7a68] group-hover:text-[var(--primary)] transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <a href={`tel:${provider_info?.phone_number}`} className="text-sm font-bold text-[var(--footer)] hover:text-[var(--primary)] transition-colors">{provider_info?.phone_number}</a>
                                    </div>
                                )}
                                {provider_info?.email && (
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#7a7a68] group-hover:text-[var(--primary)] transition-colors">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <a href={`mailto:${provider_info?.email}`} className="text-sm font-bold text-[var(--footer)] hover:text-[var(--primary)] transition-colors">{provider_info?.email}</a>
                                    </div>
                                )}
                                {provider_info?.website && (
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#7a7a68] group-hover:text-[var(--primary)] transition-colors">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <a href={provider_info?.website} target="_blank" className="text-sm font-bold text-[var(--footer)] hover:text-[var(--primary)] transition-colors">{t("visit_website")}</a>
                                    </div>
                                )}
                                {(provider_info?.street || provider_info?.municipalities || provider_info?.governorates) && (
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#7a7a68] mt-1">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-[var(--footer)]/80 italic leading-relaxed">
                                            {[provider_info?.street, provider_info?.municipalities?.name, provider_info?.governorates?.name + ' ' + provider_info?.municipalities?.code, provider_info?.countries?.name].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {provider_info?.map_location && (
                                    <div className="mt-8 pt-8 border-t border-slate-50">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t("map_location")}</h3>
                                        <div className="h-48 rounded-xl overflow-hidden border border-[#ece9e0] grayscale brightness-110 hover:grayscale-0 transition-all duration-700">
                                            <LeafletMapPicker
                                                initial={(() => {
                                                    const [lat, lng] = String(provider_info?.map_location).split(',').map(Number);
                                                    return { lat: lat || 34.0, lng: lng || 9.0 };
                                                })()}
                                                onPick={() => { }}
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        </TiltCard>
                        </Reveal>

                        {/* Opening Hours */}
                        <Reveal direction="left" delay={0.3}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8">
                            <h2 className="text-lg font-bold text-[var(--footer)] mb-6 uppercase tracking-widest text-[#7a7a68]/60">{t("opening_hours")}</h2>
                            {provider_info?.provider_opening_hour && provider_info.provider_opening_hour.length > 0 ? (
                                <div className="space-y-3">
                                    {(() => {
                                        const today = new Date();
                                        const currentDay = today.getDay();
                                        const days = [t("days.0"), t("days.1"), t("days.2"), t("days.3"), t("days.4"), t("days.5"), t("days.6")];
                                        const sortedHours = [...provider_info.provider_opening_hour].sort((a: any, b: any) => {
                                            const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                                            const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                                            return dayA - dayB;
                                        });

                                        return sortedHours.map((hour: any) => {
                                            const isToday = hour.dayOfWeek === currentDay;
                                            const formatTime = (dateStr: string) => {
                                                if (!dateStr) return "";
                                                const date = new Date(dateStr);
                                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                            };

                                            return (
                                                <div key={hour.dayOfWeek} className={cn(
                                                    "flex justify-between items-center py-2 px-3 rounded-xl transition-all",
                                                    isToday ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold scale-[1.05] shadow-lg shadow-[var(--primary)]/5" : "text-[#7a7a68]"
                                                )}>
                                                    <span className="text-xs uppercase tracking-wider">{days[hour.dayOfWeek]}</span>
                                                    <span className="text-xs font-bold tabular-nums">
                                                        {hour.isActive ? `${formatTime(hour.startTime)} - ${formatTime(hour.endTime)}` : t("closed")}
                                                    </span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            ) : (
                                <p className="text-sm italic text-[#7a7a68]">{t("no_opening_hours")}</p>
                            )}
                        </div>
                        </Reveal>

                        {/* Payment & Policy */}
                        <Reveal direction="left" delay={0.35}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8">
                            <h2 className="text-lg font-bold text-[var(--footer)] mb-8 uppercase tracking-widest text-[#7a7a68]/60">{t("payment_policy")}</h2>
                            {provider_info && (
                                <div className="space-y-8">
                                    {provider_info.tarification && (
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t("tarification")}</h4>
                                            <p className="text-sm font-bold text-[var(--footer)] italic">{provider_info.tarification}</p>
                                        </div>
                                    )}

                                    {(provider_info.payment_en_especes == 1 || provider_info.payment_virement == 1 || provider_info.payment_par_cheque == 1) && (
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t("payment_methods")}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {provider_info.payment_en_especes == 1 && <span className="px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-widest">{t("cash")}</span>}
                                                {provider_info.payment_virement == 1 && <span className="px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-widest">{t("transfer")}</span>}
                                                {provider_info.payment_par_cheque == 1 && <span className="px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-widest">{t("check")}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {provider_info.policy && (
                                        <div className="pt-4 border-t border-slate-50">
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t("policy")}</h4>
                                            <p className="text-sm font-bold text-[var(--footer)]/70 italic leading-relaxed">{provider_info.policy}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        </Reveal>

                        {/* General Stats (Engagement) */}
                        <Reveal direction="left" delay={0.4}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8">
                            <h2 className="text-lg font-bold text-[var(--footer)] mb-8 uppercase tracking-widest text-[#7a7a68]/60">{t("engagement")}</h2>
                            {provider_info && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex justify-between items-center p-5 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <Eye className="w-4 h-4 text-[#7a7a68]" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("views")}</span>
                                            </div>
                                            <span className="font-bold text-[var(--footer)] tabular-nums">{views}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("likes")}</span>
                                            </div>
                                            <span className="font-bold text-[var(--footer)] tabular-nums">{likes}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <ThumbsDown className="w-4 h-4 text-red-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("dislikes")}</span>
                                            </div>
                                            <span className="font-bold text-[var(--footer)] tabular-nums">{dislikes}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <Heart className="w-4 h-4 text-pink-600" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("favorites")}</span>
                                            </div>
                                            <span className="font-bold text-[var(--footer)] tabular-nums">{favori}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <Share2 className="w-4 h-4 text-[#7a7a68]" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("shares")}</span>
                                            </div>
                                            <span className="font-bold text-[var(--footer)] tabular-nums">{shares}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <MessageCircle className="w-4 h-4 text-yellow-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("comments")}</span>
                                            </div>
                                            <span className="font-bold text-[var(--footer)] tabular-nums">{commentsCount}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 pt-6 border-t border-slate-50">
                                        {provider_info.experience !== undefined && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("experience")}</span>
                                                <span className="text-sm font-bold text-[var(--footer)]">{provider_info.experience} {t("years")}</span>
                                            </div>
                                        )}
                                        {provider_info.foudation_date && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("founded_date")}</span>
                                                <span className="text-sm font-bold text-[var(--footer)]">{new Date(provider_info.foudation_date).toISOString().split('T')[0]}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        </Reveal>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#ece9e0] p-4 flex items-center justify-between z-[60] shadow-2xl animate-in slide-in-from-bottom-full duration-500">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("starting_from")}</span>
                    <span className="text-xl font-bold text-[var(--footer)]">{priceValue?.toLocaleString()} TND</span>
                </div>
                <Button
                    onClick={() => { if (item) { addToCart(item); setShowConfirmation(true); } }}
                    className="bg-[var(--footer)] text-white hover:bg-[var(--primary)] px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                    {t("select")}
                </Button>
            </div>

            {/* Modals & Overlays */}
            <AddedToPlanModal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} />
            <QuickViewModal
                isOpen={isQuickViewOpen}
                item={selectedItem}
                onClose={() => setIsQuickViewOpen(false)}
            />

        </div>
    );
}

/* ═══════════════════════════════════════════════════
   GALLERY LIGHTBOX
   ═══════════════════════════════════════════════════ */
function GalleryLightbox({
    media,
    currentIndex,
    onClose,
    onNavigate,
    t
}: {
    media: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
    t: { close: string, prev: string, next: string }
}) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + media.length) % media.length);
            if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % media.length);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, media, onClose, onNavigate]);

    const currentMedia = media[currentIndex];
    const isVideo = typeof currentMedia === 'string' && (
        currentMedia.match(/\.(mp4|webm|ogg)$/i) ||
        currentMedia.includes("youtube.com") ||
        currentMedia.includes("vimeo.com")
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300">
            <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />
            <button onClick={onClose} className="absolute top-10 right-10 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-md border border-white/10 hover:rotate-90">
                <X className="w-8 h-8" />
            </button>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold tracking-widest z-20 border border-white/10">
                {currentIndex + 1} / {media.length}
            </div>
            <button className="absolute left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-md border border-white/10 group" onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + media.length) % media.length); }}>
                <ChevronLeft className="w-12 h-12 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button className="absolute right-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-md border border-white/10 group" onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % media.length); }}>
                <ChevronRight className="w-12 h-12 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="relative w-[90vw] h-[80vh] flex items-center justify-center">
                {isVideo ? (
                    <video src={currentMedia} controls autoPlay className="max-w-full max-h-full rounded-xl shadow-2xl" />
                ) : (
                    <Image src={currentMedia} fill className="object-contain" alt="Gallery detail" />
                )}
            </div>
        </div>
    );
}
