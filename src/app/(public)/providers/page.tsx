"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Star, ChevronDown, X, ShieldCheck, SlidersHorizontal, Briefcase, ArrowRight, LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProviders } from "@/lib/api/providers";
import { ProviderUser } from "@/types/public/providers";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Hero from "@/components/public/layouts/Hero";
import { ProviderCardSkeleton } from "@/components/ui/Skeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import ProviderCard from "@/components/public/providers/ProviderCard";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollProgressBar, Reveal, Stagger, StaggerItem, TiltCard, ParticleField } from "@/components/ui/Motion3D";

export default function Providers() {
    const t = useTranslations("ProvidersPage");
    const h = useTranslations("ProvidersPage.hero");
    const tCommon = useTranslations("Common");
    const [providers, setProviders] = useState<ProviderUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("relevance");
    const [locationFilter, setLocationFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filtersOpen, setFiltersOpen] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const urlCategory = searchParams.get("category");

    useEffect(() => {
        if (urlCategory) setCategoryFilter(urlCategory);
    }, [urlCategory]);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setLoading(true);
                const data = await getProviders();
                setProviders(Array.isArray(data) ? data : []);
            } catch {
                toast.error(tCommon("loading_failed"));
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, []);

    const uniqueLocations = useMemo(() =>
        Array.from(new Set(
            providers.flatMap(p =>
                p.provider_info.map(info => info.city || info.country).filter(Boolean)
            )
        )), [providers]);

    const uniqueCategories = useMemo(() =>
        Array.from(new Set(
            providers.flatMap(p =>
                p.provider_info.map(info => info.categories?.title).filter(Boolean)
            )
        )), [providers]);

    const filteredProviders = useMemo(() => {
        let list = [...providers];

        // Search filter
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(p =>
                p.first_name.toLowerCase().includes(q) ||
                p.last_name.toLowerCase().includes(q) ||
                p.provider_info.some(info =>
                    info.ste_title?.toLowerCase().includes(q) ||
                    info.categories?.title?.toLowerCase().includes(q) ||
                    info.city?.toLowerCase().includes(q) ||
                    info.country?.toLowerCase().includes(q) ||
                    info.about?.toLowerCase().includes(q)
                )
            );
        }

        // Location filter
        if (locationFilter !== "all") {
            list = list.filter(p =>
                p.provider_info.some(info => info.city === locationFilter || info.country === locationFilter)
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            list = list.filter(p =>
                p.provider_info.some(info => info.categories?.title === categoryFilter)
            );
        }

        // Sort
        list.sort((a, b) => {
            switch (sortBy) {
                case "rating": return b.rating - a.rating;
                case "services": return b.itemCount - a.itemCount;
                case "date": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default: return 0;
            }
        });

        return list;
    }, [providers, searchTerm, locationFilter, categoryFilter, sortBy]);

    const activeFiltersCount = [
        locationFilter !== "all",
        categoryFilter !== "all",
        sortBy !== "relevance",
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setLocationFilter("all");
        setCategoryFilter("all");
        setSortBy("relevance");
        setSearchTerm("");
        router.replace("/providers");
    };

    const SORT_OPTIONS = [
        { value: "relevance", label: t("sort_options.relevance") },
        { value: "rating", label: t("sort_options.rating") },
        { value: "services", label: t("sort_options.services") },
        { value: "date", label: t("sort_options.date") },
    ];

    const TARIFICATION_LEVELS: Record<string, { label: string; color: string }> = {
        "$": { label: t("tarification.budget"), color: "text-emerald-400" },
        "$$": { label: t("tarification.standard"), color: "text-sky-400" },
        "$$$": { label: t("tarification.premium"), color: "text-violet-400" },
        "$$$$": { label: t("tarification.luxury"), color: "text-amber-400" },
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <ScrollProgressBar />
            <Hero
                badge={h("badge", { count: providers.length })}
                title_part1={h("title_part1")}
                title_part2={h("title_accent")}
                description={h("subtitle")}
                bgImage="/images/default-images/hero/hero-providers.jpg"
            />

            {/* ───────── STATS BAR ───────── */}
            <div className="bg-white border-b border-[#ece9e0] sticky top-[72px] z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <p className="text-sm text-[#7a7a68]">
                            {t("stats.showing")} <span className="font-bold text-[var(--footer)]">{filteredProviders.length}</span>
                            <span className="text-[#7a7a68]/70"> {t("stats.of")} {providers.length}</span> {t("stats.providers")}
                            {categoryFilter !== "all" && (
                                <span className="ml-1 text-[var(--primary)] font-medium">{t("stats.in")} {categoryFilter}</span>
                            )}
                        </p>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                                <X className="w-3 h-3" /> {t("sidebar.reset_filters")}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <div className="relative group hidden sm:flex">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-9 py-2 text-sm bg-[var(--background)] border border-[#ece9e0] rounded-xl text-[#7a7a68] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a7a68] pointer-events-none" />
                        </div>

                        {/* Filter button */}
                        <Button
                            onClick={() => setFiltersOpen(v => !v)}
                            className={`h-9 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border ${filtersOpen
                                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                : "bg-white text-[#7a7a68] border-[#ece9e0] hover:border-[var(--primary)]"
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {t("sidebar.filters")}
                            {activeFiltersCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>

                        {/* View toggle */}
                        <div className="hidden sm:flex items-center border border-[#ece9e0] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-[var(--primary)] text-white" : "bg-white text-[#7a7a68] hover:text-[var(--footer)]"}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 transition-colors ${viewMode === "list" ? "bg-[var(--primary)] text-white" : "bg-white text-[#7a7a68] hover:text-[var(--footer)]"}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────── FILTERS PANEL ───────── */}
            <div className={`bg-white border-b border-[#ece9e0] overflow-hidden transition-all duration-500 ease-in-out ${filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Category filter */}
                        <div>
                            <label className="block text-xs font-semibold text-[#7a7a68] uppercase tracking-wider mb-2">{t("sidebar.category")}</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setCategoryFilter("all")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${categoryFilter === "all" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white text-[#7a7a68] border-[#ece9e0] hover:border-[var(--primary)]"}`}
                                >
                                    {tCommon("all")}
                                </button>
                                {uniqueCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat || "all")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border truncate max-w-[120px] ${categoryFilter === cat ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white text-[#7a7a68] border-[#ece9e0] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"}`}
                                        title={cat || ""}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location filter */}
                        <div>
                            <label className="block text-xs font-semibold text-[#7a7a68] uppercase tracking-wider mb-2">{t("sidebar.location")}</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68]/60" />
                                <select
                                    value={locationFilter}
                                    onChange={e => setLocationFilter(e.target.value)}
                                    className="appearance-none w-full pl-9 pr-9 py-2.5 text-sm bg-[var(--background)] border border-[#ece9e0] rounded-xl text-[#7a7a68] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                >
                                    <option value="all">{t("all_locations")}</option>
                                    {uniqueLocations.map(loc => (
                                        <option key={loc} value={loc || ""}>{loc}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68]/60 pointer-events-none" />
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-xs font-semibold text-[#7a7a68] uppercase tracking-wider mb-2">{t("sidebar.sort_by")}</label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="appearance-none w-full pl-4 pr-9 py-2.5 text-sm bg-[var(--background)] border border-[#ece9e0] rounded-xl text-[#7a7a68] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68]/60 pointer-events-none" />
                            </div>
                        </div>

                        {/* Quick reset */}
                        <div className="flex items-end">
                            <Button
                                onClick={clearAllFilters}
                                className="w-full py-2.5 rounded-xl text-sm border border-[#ece9e0] bg-white text-[#7a7a68] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                            >
                                <X className="w-4 h-4 mr-2" /> {t("sidebar.reset_filters")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────── CONTENT ───────── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Category quick-chips */}
                {uniqueCategories.length > 0 && (
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <span className="text-xs font-semibold text-[#7a7a68] uppercase tracking-wider whitespace-nowrap">{tCommon("browse")}:</span>
                        <button
                            onClick={() => setCategoryFilter("all")}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === "all" ? "bg-[var(--primary)] text-white shadow-md" : "bg-white text-[#7a7a68] border border-[#ece9e0] hover:border-[var(--primary)] hover:shadow-sm"}`}
                        >
                            {tCommon("all")}
                        </button>
                        {uniqueCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat || "all")}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === cat ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30" : "bg-white text-[#7a7a68] border border-[#ece9e0] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] hover:shadow-sm"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                <ProviderCardSkeleton />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Grid / List */}
                {!loading && filteredProviders.length > 0 && viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                        {filteredProviders.map((provider, index) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ delay: (index % 6) * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                style={{ perspective: 700 }}
                            >
                                <ProviderCard provider={provider} index={index} t={t} tCommon={tCommon} tarifLevels={TARIFICATION_LEVELS} />
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredProviders.length > 0 && viewMode === "list" && (
                    <div className="flex flex-col gap-4">
                        {filteredProviders.map((provider, index) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ delay: (index % 8) * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <ProviderCard provider={provider} index={index} t={t} tCommon={tCommon} tarifLevels={TARIFICATION_LEVELS} viewType="list" />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredProviders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-24 h-24 rounded-3xl bg-[var(--background)] flex items-center justify-center mb-6 shadow-inner">
                            <Search className="w-10 h-10 text-[#7a7a68]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--footer)] mb-2">{t("no_providers_found")}</h3>
                        <p className="text-[#7a7a68] max-w-sm mb-6">{t("no_providers_subtitle")}</p>
                        <Button onClick={clearAllFilters} className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/80 transition-colors shadow-lg shadow-[var(--primary)]/25">
                            {t("sidebar.reset_filters")}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}