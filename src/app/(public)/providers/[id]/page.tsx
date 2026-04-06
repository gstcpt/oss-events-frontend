"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProvider, getProviders, trackProviderShare } from "@/lib/api/providers";
import { getReactions } from "@/lib/api/interactions";
import type { ProviderDetail } from "@/types/public/providers";
import { MapPin, Clock, CheckCircle, X, Phone, Globe, Facebook, Instagram, Eye, Heart, Share2, Briefcase, Search, ArrowLeft, PhoneCall, Mail, ShieldCheck, MessageSquare, ThumbsUp, AlertCircle, Star, ThumbsDown, MessageCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReactionButtons } from "@/components/interactions/ReactionButtons";
import { RatingStars } from "@/components/interactions/RatingStars";
import { CommentSection } from "@/components/interactions/CommentSection";
import { FavoriteButton } from "@/components/interactions/FavoriteButton";
import { ShareButton } from "@/components/interactions/ShareButton";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { audienceApi } from "@/lib/api/rapports";
import ItemCard from "@/components/public/items/ItemCard";
import QuickViewModal from "@/components/public/items/QuickViewModal";
import { PublicItem } from "@/types/public/items";
import { ProfileHeaderSkeleton } from "@/components/ui/Skeleton";
import { useViewTracker } from "@/lib/tracking/view-tracker";
import { cn } from "@/lib/utils";
import DisplayIcon from "@/components/ui/DisplayIcon";
import ProviderCard from "@/components/public/providers/ProviderCard";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollProgressBar, TiltCard, Reveal, Stagger, StaggerItem, ParticleField, CountUp, Floating } from "@/components/ui/Motion3D";

const LeafletMapPicker = dynamic(() => import("@/components/ui/LeafletMapPicker"), { ssr: false, loading: () => <div className="h-full bg-slate-50 animate-pulse rounded-2xl" /> });

/* ═══════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════ */
function ContactRow({ icon: Icon, label, value }: { icon: any, label: string, value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[var(--primary)] transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-[var(--footer)]">{value}</p>
            </div>
        </div>
    );
}

function BigStatCard({ icon: Icon, value, label, color }: { icon: any, value: number, label: string, color: string }) {
    return (
        <div className="bg-white p-8 rounded-xl border border-[#ece9e0] shadow-sm text-center">
            <div className={cn("w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-4xl font-bold text-[var(--footer)] mb-2">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function ProviderDetail() {
    const t = useTranslations("ProviderDetailPage");
    const tCommon = useTranslations("Common");
    const { user } = useAuth();
    const [provider, setProvider] = useState<ProviderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"services" | "about" | "reviews" | "stats">("services");
    // Single source of truth for all provider-scoped stats (from new_interactions + page_view)
    const [providerReactions, setProviderReactions] = useState<{
        views: number; likes: number; dislikes: number; favorites: number;
        shares: number; avgRating: number; totalRatings: number; comments: number;
        userReactions: { isLiked: boolean; isDisliked: boolean; isFavorite: boolean; userRating: number | null; };
    }>({
        views: 0, likes: 0, dislikes: 0, favorites: 0,
        shares: 0, avgRating: 0.0, totalRatings: 0, comments: 0,
        userReactions: { isLiked: false, isDisliked: false, isFavorite: false, userRating: null }
    });
    const [quickViewItem, setQuickViewItem] = useState<PublicItem | null>(null);
    const [simProviders, setSimProviders] = useState<any[]>([]);

    const params = useParams();
    const router = useRouter();
    const providerId = params?.id as string;
    const providerIdInt = useMemo(() => parseInt(providerId) || 0, [providerId]);

    // View Tracking
    useViewTracker("providers", providerIdInt);

    const fetchProvider = useCallback(async () => {
        try {
            const data = await getProvider(providerIdInt, user?.id);
            if (!data) {
                toast.error(t("not_found"));
                setError(t("not_found"));
                return;
            }
            setProvider(data);
            setError(null);
        } catch {
            toast.error(tCommon("loading_failed"));
            setError(t("not_found_subtitle"));
        }
    }, [providerIdInt, user?.id, t, tCommon]);

    const handleShare = async () => {
        await trackProviderShare(providerIdInt, "web");
        fetchProvider();
    };

    const fetchLiveStats = useCallback(async () => {
        // Run both fetches in parallel
        const [reactionsResult, audienceResult] = await Promise.allSettled([
            // 1. All interaction counts from new_interactions WHERE target_type='PROVIDER' AND target_id=X
            getReactions("PROVIDER", providerIdInt, user?.id),
            // 2. Page view count from page_view WHERE resourceType='providers' AND resourceId=X
            audienceApi.getPageViewByResource("providers", providerIdInt)
        ]);

        setProviderReactions(prev => {
            let next = { ...prev };

            // Merge reactions (likes, dislikes, favorites, shares, avgRating, totalRatings, comments)
            if (reactionsResult.status === "fulfilled" && reactionsResult.value) {
                const r = reactionsResult.value as any;
                next = {
                    ...next,
                    likes: Number(r.likes ?? prev.likes),
                    dislikes: Number(r.dislikes ?? prev.dislikes),
                    favorites: Number(r.favorites ?? prev.favorites),
                    shares: Number(r.shares ?? prev.shares),
                    avgRating: Number(r.avgRating ?? prev.avgRating),
                    totalRatings: Number(r.totalRatings ?? prev.totalRatings),
                    comments: Number(r.comments ?? prev.comments),
                    userReactions: r.userReactions ?? prev.userReactions,
                };
            }

            // Merge page views count (count rows manually if total isn't defined)
            if (audienceResult.status === "fulfilled" && audienceResult.value?.success && audienceResult.value.data) {
                const data = audienceResult.value.data;
                const pageViews = Number((data as any).total ?? (Array.isArray(data) ? data.length : 0));
                if (pageViews > 0) next = { ...next, views: pageViews };
            }

            return next;
        });
    }, [providerIdInt, user?.id]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchProvider();
            await fetchLiveStats();
            setLoading(false);
        };
        if (providerIdInt) {
            init();
            const interval = setInterval(fetchLiveStats, 30000);
            return () => clearInterval(interval);
        }
    }, [providerIdInt, fetchProvider, fetchLiveStats, user?.id]);

    const info = provider?.provider_info?.[0];

    useEffect(() => {
        const fetchSimilars = async () => {
            const all = await getProviders();
            const list = (all || []).filter((p: any) =>
                parseInt(p.id) !== providerIdInt &&
                p.provider_info?.[0]?.category_id === info?.category_id
            );
            setSimProviders(list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4));
        };
        if (info?.category_id) fetchSimilars();
    }, [info?.category_id, providerIdInt, user?.id]);

    const filteredItems = useMemo(() => {
        if (!provider) return [];
        let list = [...(provider.items ?? [])];
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(i => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
        }
        // Enrich items with current provider info for QuickView and cards
        return list.map(item => ({
            ...item,
            users: {
                ...((item as any).users || {}),
                provider_info: provider.provider_info,
                email: info?.email || provider.email
            },
            provider_info: provider.provider_info // Fallback for various card types
        }));
    }, [provider, searchTerm, info]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--background)]">
            <ProfileHeaderSkeleton />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="h-64 shimmer rounded-3xl" />
            </div>
        </div>
    );

    if (error || !provider) return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
            <div className="text-center max-w-sm">
                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6"><X className="w-10 h-10 text-red-400" /></div>
                <h3 className="text-xl font-bold text-[var(--footer)] mb-2">{t("not_found")}</h3>
                <Link href="/providers" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[#3a3a2e] text-white rounded-xl transition-colors font-medium shadow-lg">
                    <ArrowLeft className="w-4 h-4" /> {tCommon("back")}
                </Link>
            </div>
        </div>
    );

    const name = info?.ste_title || `${provider.first_name} ${provider.last_name}`;
    const logoImage = info?.logo || provider.avatar || "/images/default-images/providers/provider.jpg";
    const coverImage = info?.categories?.image || "/images/default-images/hero/hero-categories.jpg";
    const location = [info?.street, info?.municipalities?.name, info?.governorates?.name, info?.countries?.name].filter(Boolean).join(", ") || tCommon("location_na");
    const category = info?.categories?.title || tCommon("service_provider");

    // Use providerReactions as the single source of truth for all provider-scoped stats.
    // userReactions from getReactions(userId) takes priority for personalised state.
    const pStats = providerReactions;
    const userReactions = pStats.userReactions;

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <ScrollProgressBar />
            {/* ── BACK BUTTON ── */}
            <div className="absolute top-28 left-10 z-50">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-3xl border border-white/20 rounded-full text-white hover:bg-white/40 transition-all shadow-2xl active:scale-95 font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    {tCommon("back")}
                </motion.button>
            </div>

            {/* ── BANNER / COVER ── */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Image src={coverImage} alt="Cover" fill className="object-cover" priority />
                </motion.div>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-transparent" />
                <ParticleField count={10} color="var(--primary)" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-24 md:-mt-32">
                {/* ── IDENTITY CARD ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-xl border border-[#ece9e0] shadow-2xl shadow-black/[0.03] p-2 md:p-3 relative"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                        {/* Logo Overlap */}
                        <div className="relative shrink-0 -mt-24 md:-mt-32">
                            <div className="w-44 h-44 md:w-64 md:h-64 rounded-full bg-white border-[12px] md:border-[16px] border-white shadow-2xl relative group flex items-center justify-center p-0">
                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                    <Image
                                        src={logoImage}
                                        alt={name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/default.jpg"; }}
                                    />
                                </div>
                            </div>
                            {provider.status === 1 && (
                                <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full border-4 md:border-6 border-white flex items-center justify-center shadow-lg text-white z-10">
                                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                            )}
                        </div>

                        {/* Name and Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold text-[var(--footer)] tracking-tight leading-tight mb-3">{name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500 font-semibold text-sm">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-[var(--primary)] text-[10px] uppercase tracking-widest font-bold">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {category}
                                </div>
                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                    <MapPin className="w-4 h-4" />
                                    {location}
                                </div>
                                {pStats.avgRating > 0 && (
                                    <div className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded-lg">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="font-bold text-sm tracking-tighter">{pStats.avgRating.toFixed(1)}</span>
                                        {pStats.totalRatings > 0 && <span className="text-xs font-medium opacity-80">({pStats.totalRatings})</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-slate-50 p-2 rounded-full border border-slate-100 shadow-sm">
                                <FavoriteButton
                                    targetType="PROVIDER"
                                    targetId={provider.id}
                                    isFavorite={userReactions?.isFavorite}
                                    onFavoriteToggle={fetchProvider}
                                    className="w-12 h-12 rounded-full hover:bg-white text-pink-500 transition-all border-0 shadow-none"
                                />
                                <ShareButton
                                    className="w-12 h-12 rounded-full hover:bg-white text-slate-500 transition-all border-0 shadow-none group"
                                    title={name}
                                    onShare={handleShare}
                                    iconOnly
                                />
                            </div>
                            <div className="w-px h-8 bg-slate-100 mx-2" />
                            <div className="flex gap-2">
                                {info?.whatsapp && (
                                    <a href={`https://wa.me/${info.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                        <PhoneCall className="w-5 h-5" />
                                    </a>
                                )}
                                {info?.email && (
                                    <a href={`mailto:${info.email}`} className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                        <Mail className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-8 mt-12 border-t border-slate-50 pt-6">
                        {["services", "about", "reviews", "stats"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "pb-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all relative whitespace-nowrap",
                                    activeTab === tab
                                        ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                                        : "text-slate-400 hover:text-[var(--footer)]"
                                )}
                            >
                                {t(tab)}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── TAB CONTENT ── */}
                <div className="py-12">
                    {activeTab === "services" && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-xl p-8 border border-[#ece9e0] shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <DisplayIcon iconName="list" className="w-6 h-6 text-[var(--primary)]" />
                                        <h2 className="text-xl font-bold text-[var(--footer)]">{t("our_services")}</h2>
                                        <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-xs font-bold">{filteredItems.length}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredItems.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 30, rotateX: -8 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            viewport={{ once: true, margin: "-40px" }}
                                            transition={{ delay: (idx % 6) * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ perspective: 600 }}
                                        >
                                            <ItemCard
                                                item={item as any}
                                                isProviderDetail={true}
                                                onQuickView={setQuickViewItem}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "about" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-xl p-8 border border-[#ece9e0] shadow-sm">
                                    <h2 className="text-xl font-bold text-[var(--footer)] mb-6 flex items-center gap-3">
                                        <DisplayIcon iconName="info" className="w-6 h-6 text-[var(--primary)]" />
                                        {t("about_provider")}
                                    </h2>
                                    <p className="text-[#7a7a68] leading-relaxed whitespace-pre-line">{info?.about || t("no_description")}</p>
                                </div>
                                <div className="bg-white rounded-xl p-8 border border-[#ece9e0] shadow-sm">
                                    <h2 className="text-xl font-bold text-[var(--footer)] mb-8 flex items-center gap-3">
                                        <DisplayIcon iconName="phone" className="w-6 h-6 text-[var(--primary)]" />
                                        {t("contact_details")}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <ContactRow icon={Phone} label={t("phone")} value={info?.phone_number} />
                                        <ContactRow icon={Mail} label={t("email")} value={info?.email} />
                                        <ContactRow icon={Globe} label={t("website")} value={info?.website} />
                                        <ContactRow icon={Briefcase} label={t("experience")} value={info?.experience ? `${info.experience} ${tCommon("years")}` : null} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="bg-white rounded-xl p-8 border border-[#ece9e0] shadow-sm overflow-hidden flex flex-col h-[400px]">
                                    <h2 className="text-lg font-bold text-[var(--footer)] mb-6 uppercase tracking-[0.2em] opacity-40 shrink-0">{t("location")}</h2>
                                    <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-[#ece9e0]">
                                        {info?.map_location && (
                                            <LeafletMapPicker
                                                initial={(() => {
                                                    const [lat, lng] = String(info.map_location).split(',').map(Number);
                                                    return { lat: lat || 34, lng: lng || 9 };
                                                })()}
                                                readOnly={true}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-8 border border-[#ece9e0] shadow-sm">
                                    <h2 className="text-lg font-bold text-[var(--footer)] mb-6 uppercase tracking-[0.2em] opacity-40">{t("payment_methods")}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {info?.payment_en_especes == 1 && <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest">{tCommon("cash")}</span>}
                                        {info?.payment_virement == 1 && <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest">{tCommon("transfer")}</span>}
                                        {info?.payment_par_cheque == 1 && <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest">{tCommon("check")}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="bg-white rounded-xl p-8 border border-[#ece9e0] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-[var(--background)] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#ece9e0] mb-8">
                                <div className="text-center md:text-left">
                                    <h3 className="font-bold text-[var(--footer)] mb-1">{t("rate_this_provider")}</h3>
                                    <p className="text-sm text-[#7a7a68]">{t("rate_subtitle")}</p>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-[#ece9e0]">
                                        <RatingStars
                                            targetType="PROVIDER"
                                            targetId={provider.id}
                                            onRate={() => { fetchProvider(); fetchLiveStats(); }}
                                            userRating={userReactions?.userRating ?? undefined}
                                        />
                                    </div>
                                    <ReactionButtons
                                        targetType="PROVIDER"
                                        targetId={provider.id}
                                        stats={{
                                            likes: pStats.likes,
                                            dislikes: pStats.dislikes,
                                            avgRating: pStats.avgRating,
                                            totalRatings: pStats.totalRatings,
                                            views: pStats.views,
                                            shares: pStats.shares,
                                            favorites: pStats.favorites,
                                            comments: pStats.comments
                                        } as any}
                                        userReactions={userReactions as any}
                                        onReaction={() => { fetchProvider(); fetchLiveStats(); }}
                                    />
                                </div>
                            </div>
                            <CommentSection targetType="PROVIDER" targetId={providerIdInt} />
                        </div>
                    )}

                    {activeTab === "stats" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[
                                { icon: Eye, value: pStats.views, label: tCommon("views"), color: "text-sky-500" },
                                { icon: ThumbsUp, value: pStats.likes, label: tCommon("likes"), color: "text-emerald-500" },
                                { icon: ThumbsDown, value: pStats.dislikes, label: tCommon("dislikes"), color: "text-red-500" },
                                { icon: Heart, value: pStats.favorites, label: tCommon("saves"), color: "text-pink-500" },
                                { icon: Share2, value: pStats.shares, label: tCommon("shares"), color: "text-indigo-500" },
                                { icon: Star, value: pStats.avgRating, label: tCommon("avg_rating"), color: "text-amber-500" },
                            ].map((s, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -4, scale: 1.03 }}
                                    className="bg-white p-8 rounded-xl border border-[#ece9e0] shadow-sm text-center cursor-default"
                                >
                                    <div className={cn("w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50", s.color)}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <p className="text-4xl font-bold text-[var(--footer)] mb-2"><CountUp target={s.value} /></p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── SIMILAR PROVIDERS ── */}
                {simProviders.length > 0 && (
                    <div className="mt-20 border-t border-slate-100 pt-12 pb-20">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--footer)] mb-2">{t("similar_providers")}</h2>
                                <p className="text-[#7a7a68] text-sm">{t("sim_subtitle", { category })}</p>
                            </div>
                            <Link href="/providers" className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)] hover:underline">{t("view_all")}</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {simProviders.map((p, idx) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 30, rotateX: -8 }}
                                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ delay: idx * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ perspective: 600 }}
                                >
                                    <ProviderCard provider={p} index={idx} t={t} tCommon={tCommon} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <QuickViewModal item={quickViewItem} isOpen={!!quickViewItem} onClose={() => setQuickViewItem(null)} />
        </div>
    );
}
