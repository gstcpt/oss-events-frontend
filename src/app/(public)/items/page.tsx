"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ChevronDown, Search, X, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CategoriesSideBar from "@/components/public/layouts/CategoriesSideBar";
import ItemCard from "@/components/public/items/ItemCard";
import QuickViewModal from "@/components/public/items/QuickViewModal";
import { getPublicItems, getCategoryFilters } from "@/lib/api/public/items";
import { PublicItem, TagFilter } from "@/types/public/items";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ItemCardSkeleton } from "@/components/ui/Skeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useAuth } from "@/context/AuthContext";
import Hero from "@/components/public/layouts/Hero";
import { motion } from "framer-motion";
import { ScrollProgressBar } from "@/components/ui/Motion3D";

type SortOption =
    | 'recommended'
    | 'created-new'
    | 'created-old'
    | 'price-high'
    | 'price-low'
    | 'title-asc'
    | 'title-desc'
    | 'best-rate';

export default function Services() {
    const t = useTranslations("ServicesPage");
    const h = useTranslations("ServicesPage.hero");
    const tCommon = useTranslations("Common");
    const { user } = useAuth();
    const [items, setItems] = useState<PublicItem[]>([]);
    const [displayItems, setDisplayItems] = useState<PublicItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("recommended");
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [quickViewItem, setQuickViewItem] = useState<PublicItem | null>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [availableFilters, setAvailableFilters] = useState<TagFilter[]>([]);
    // Text options (radio/checkbox/select/list) → string[]
    // Numeric sliders (range/number/date) → { min: string; max: string }
    // Text search (text) → string
    const [selectedFilterValues, setSelectedFilterValues] = useState<Record<number, string | string[] | { min: string; max: string }>>({});
    const itemsPerPage = 12;
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const initFromUrl = () => {
            const catParam = searchParams.get('category') || '';
            const cats = catParam ? catParam.split(',').map(n => Number(n)).filter(n => Number.isFinite(n)) : [];
            setSelectedCategories(cats);
        };
        initFromUrl();
    }, []); // Only once on mount

    useEffect(() => {
        fetchItems();
    }, [user?.id, currentPage, searchTerm, sortBy, selectedCategories]);

    // We no longer need applyFiltersAndPagination locally as it's done server-side

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const fetchedFilters = await getCategoryFilters(selectedCategories);
                setAvailableFilters(fetchedFilters);
            } catch (error) {
                toast.error("Failed to fetch filters.");
            }
        };
        fetchFilters();
    }, [selectedCategories]);

    useEffect(() => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        if (selectedCategories.length > 0) {
            params.set('category', selectedCategories.join(','));
        } else {
            params.delete('category');
        }
        router.replace(`/items${params.toString() ? `?${params.toString()}` : ''}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategories]);

    const fetchItems = async () => {
        try {
            setItemsLoading(true);
            const { items: data, totalCount: count } = await getPublicItems({
                userId: user?.id,
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                categoryIds: selectedCategories,
                sortBy: sortBy
            });
            setItems(data);
            setDisplayItems(data);
            setTotalCount(count);
            setTotalPages(Math.ceil(count / itemsPerPage));
        } catch (error) {
            toast.error(t("loading_failed") || "Failed to load services");
        } finally {
            setLoading(false);
            setItemsLoading(false);
        }
    };

    const calculateAverageRating = (item: PublicItem): number => {
        if (item.stats && item.stats.avgRating !== undefined) {
            return item.stats.avgRating;
        }
        if (!item.interactions || item.interactions.length === 0) return 0;

        const ratings = item.interactions
            .filter((int) => int.type === 'RATING' && int.value)
            .map((int) => Number(int.value))
            .filter((val) => !isNaN(val) && val > 0);

        if (ratings.length === 0) return 0;

        const sum = ratings.reduce((acc, val) => acc + val, 0);
        return sum / ratings.length;
    };

    const toggleTag = (tagId: number) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)]">
                <Hero
                    badge={h("badge")}
                    title_part1={h("title_part1")}
                    title_part2={h("title_accent")}
                    description={h("subtitle")}
                    bgImage="/images/default-images/hero/hero-items.jpg"
                />
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                <ItemCardSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[var(--primary)] z-[999] shadow-lg"
                style={{ scaleX: 0, transformOrigin: "0%" }}
                animate={{ scaleX: loading ? 0 : 1 }}
                transition={{ duration: 0.5 }}
            />
            <Hero
                badge={h("badge")}
                title_part1={h("title_part1")}
                title_part2={h("title_accent")}
                description={h("subtitle")}
                bgImage="/images/default-images/hero/hero-items.jpg"
            />
            <div className="container mx-auto px-6 py-12">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <CategoriesSideBar
                            onCategorySelect={(categoryId) => {
                                if (selectedCategories.includes(categoryId)) { setSelectedCategories(prev => prev.filter(id => id !== categoryId)); }
                                else { setSelectedCategories(prev => [...prev, categoryId]); }
                            }}
                            onClearAll={() => setSelectedCategories([])}
                            selectedCategories={selectedCategories}
                        />
                    </div>
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filters Toggle */}
                        <div className="lg:hidden mb-6">
                            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center gap-2"><Filter className="w-4 h-4" />{tCommon("apply_filters")} {selectedTags.length > 0 && `(${selectedTags.length})`}</Button>
                            {showFilters && (
                                <div className="fixed inset-0 z-50 lg:hidden">
                                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
                                    <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
                                        <div className="p-4 border-b flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">{t("sidebar.filters")}</h3>
                                            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></Button>
                                        </div>
                                        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
                                            <CategoriesSideBar
                                                onCategorySelect={(categoryId) => {
                                                    if (selectedCategories.includes(categoryId)) { setSelectedCategories(prev => prev.filter(id => id !== categoryId)); }
                                                    else { setSelectedCategories(prev => [...prev, categoryId]); }
                                                }}
                                                onClearAll={() => setSelectedCategories([])}
                                                selectedCategories={selectedCategories}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--footer)] text-lg">{tCommon("results_found", { count: totalCount })}</span>
                                <span className="text-[#7a7a68] text-sm">{tCommon("found_in_all_services")}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <div className="relative flex-1 sm:flex-initial">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="w-full appearance-none pl-4 pr-10 py-3 bg-[var(--background)] border border-[#ece9e0] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-[var(--footer)] cursor-pointer hover:border-[var(--primary)]/40 transition-colors"
                                    >
                                        <option value="recommended">{t("sort.recommended")}</option>
                                        <option value="created-new">{t("sort.newest")}</option>
                                        <option value="created-old">{t("sort.oldest")}</option>
                                        <option value="price-high">{t("sort.price_high")}</option>
                                        <option value="price-low">{t("sort.price_low")}</option>
                                        <option value="title-asc">{t("sort.title_az")}</option>
                                        <option value="title-desc">{t("sort.title_za")}</option>
                                        <option value="best-rate">{t("sort.rating")}</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68] pointer-events-none" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => setViewType('grid')} className={`${viewType === 'grid' ? 'bg-[#ece9e0] text-[var(--footer)]' : 'text-[#7a7a68]'} border-[#ece9e0] hover:bg-[#ece9e0]`}><LayoutGrid className="w-5 h-5 cursor-pointer" /></Button>
                                    <Button variant="outline" size="icon" onClick={() => setViewType('list')} className={`${viewType === 'list' ? 'bg-[#ece9e0] text-[var(--footer)]' : 'text-[#7a7a68]'} border-[#ece9e0] hover:bg-[#ece9e0]`}><List className="w-5 h-5 cursor-pointer" /></Button>
                                    <Button variant="outline" size="icon" onClick={() => setIsFilterModalOpen(true)} className="text-[#7a7a68] border-[#ece9e0] hover:bg-[#ece9e0]"><Filter className="w-5 h-5 cursor-pointer" /></Button>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar - Visible by default */}
                        <div className="mb-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]" />
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t("search_placeholder")}
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[#ece9e0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-[var(--footer)] placeholder-[#7a7a68]"
                                />
                            </div>
                        </div>

                        {/* Items Grid/List */}
                        {itemsLoading
                            ? (
                                <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8 mb-12`}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ItemCardSkeleton key={i} />
                                    ))}
                                </div>
                            )
                            : totalCount > 0 ? (
                                <>
                                    <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8 mb-12`}>
                                        {displayItems.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 35, rotateX: -8 }}
                                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                                viewport={{ once: true, margin: "-50px" }}
                                                transition={{ delay: (idx % 6) * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                                style={{ perspective: 700 }}
                                            >
                                                <ItemCard item={item} viewType={viewType} onQuickView={setQuickViewItem} />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-12">
                                            <Button variant="outline" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-4 py-2 border-[#ece9e0] text-[#7a7a68] hover:bg-[#ece9e0] hover:text-[var(--footer)]">{tCommon("previous")}</Button>
                                            <div className="flex gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const pageNum = i + 1;
                                                    return (<Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} onClick={() => handlePageChange(pageNum)} className={`w-10 h-10 ${currentPage === pageNum ? "bg-[var(--primary)] text-white hover:bg-[#3a3a2e]" : "border-[#ece9e0] text-[#7a7a68] hover:bg-[#ece9e0] hover:text-[var(--footer)]"}`}>{pageNum}</Button>);
                                                })}
                                            </div>
                                            <Button variant="outline" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-4 py-2 border-[#ece9e0] text-[#7a7a68] hover:bg-[#ece9e0] hover:text-[var(--footer)]">{tCommon("next")}</Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-[#ece9e0] rounded-full flex items-center justify-center"><Search className="w-8 h-8 text-[#7a7a68]" /></div>
                                    <h3 className="text-xl font-semibold text-[var(--footer)] mb-2">{tCommon("no_results")}</h3>
                                    <p className="text-[#7a7a68]">{searchTerm || selectedCategories.length > 0 || selectedTags.length > 0 ? tCommon("reset_filters") : t("no_services_available")}</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal item={quickViewItem} isOpen={!!quickViewItem} onClose={() => setQuickViewItem(null)} />

            {/* Advanced Filters Modal — wide, 2-col grid */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setIsFilterModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#ece9e0] flex items-center justify-between bg-gradient-to-r from-[var(--background)] to-white">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--footer)]">
                                <Filter className="w-5 h-5 text-[var(--primary)]" />
                                {t("advanced_filters.title")}
                                {(() => {
                                    const filterCount = Object.keys(selectedFilterValues).filter(k => {
                                        const v = selectedFilterValues[Number(k)];
                                        if (!v) return false;
                                        if (Array.isArray(v)) return v.length > 0;
                                        if (typeof v === 'object') { const rv = v as any; return rv.min !== '' || rv.max !== ''; }
                                        return v !== '';
                                    }).length;
                                    return filterCount > 0 ? (
                                        <span className="ml-1 px-2 py-0.5 bg-[var(--primary)] text-white text-xs rounded-full">
                                            {filterCount} {t("advanced_filters.active", { count: filterCount })}
                                        </span>
                                    ) : null;
                                })()}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsFilterModalOpen(false)} className="hover:bg-[#ece9e0]"><X className="w-5 h-5 text-[#7a7a68]" /></Button>
                        </div>

                        {/* Body — 2-column grid */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {availableFilters.length === 0
                                ? (<p className="text-[#7a7a68] text-center py-12">{t("advanced_filters.select_category_prompt")}</p>)
                                : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                                        {availableFilters.map((filter) => {
                                            const ftype = filter.type?.toUpperCase() ?? '';
                                            if (ftype === 'TABLE') return null;

                                            const isNumeric = ftype === 'RANGE' || ftype === 'NUMBER' || ftype === 'DATE';
                                            const isTextOption = ftype === 'RADIO' || ftype === 'CHECKBOX' || ftype === 'SELECT' || ftype === 'LIST';

                                            // ── Compute slider bounds ─────────────────────────────────
                                            let sliderMin = 0, sliderMax = 100, sliderStep = 1, sliderUnit = '';

                                            if (ftype === 'RANGE') {
                                                // Collect all items' min/max from option_values « min:X,max:Y,... »
                                                const allMins: number[] = [], allMaxes: number[] = [];
                                                filter.tag_options.forEach(opt => {
                                                    const parts = (opt.option_value ?? '').split(',');
                                                    const mn = parseFloat(parts.find(p => p.startsWith('min:'))?.split(':')[1] ?? 'NaN');
                                                    const mx = parseFloat(parts.find(p => p.startsWith('max:'))?.split(':')[1] ?? 'NaN');
                                                    if (!isNaN(mn)) allMins.push(mn);
                                                    if (!isNaN(mx)) allMaxes.push(mx);
                                                    const u = parts.find(p => p.startsWith('unit:'))?.split(':')[1];
                                                    if (u) sliderUnit = u;
                                                    const s = parseFloat(parts.find(p => p.startsWith('step:'))?.split(':')[1] ?? '1');
                                                    if (!isNaN(s)) sliderStep = s;
                                                });
                                                sliderMin = allMins.length ? Math.min(...allMins) : 0;
                                                sliderMax = allMaxes.length ? Math.max(...allMaxes) : 100;
                                            } else if (ftype === 'NUMBER') {
                                                // option_values are plain numbers from items
                                                const nums = filter.tag_options
                                                    .map(o => parseFloat(o.option_value ?? ''))
                                                    .filter(n => !isNaN(n));
                                                sliderMin = nums.length ? Math.min(...nums) : 0;
                                                sliderMax = nums.length ? Math.max(...nums) : 100;
                                                sliderStep = 1;
                                            } else if (ftype === 'DATE') {
                                                // Normalize all date values to hours for the slider
                                                const toHours = (v: number, u: string) => {
                                                    if (u === 'hours') return v;
                                                    if (u === 'weeks') return v * 168;
                                                    if (u === 'months') return v * 720;
                                                    return v * 24;
                                                };
                                                const hours = filter.tag_options.map(opt => {
                                                    const raw = opt.option_value ?? '';
                                                    const parts = raw.split(',');
                                                    const v = parseFloat(parts.find(p => p.startsWith('value:'))?.split(':')[1] ?? raw);
                                                    const u = parts.find(p => p.startsWith('unit:'))?.split(':')[1] ?? 'days';
                                                    return toHours(v, u);
                                                }).filter(h => !isNaN(h));
                                                sliderMin = hours.length ? Math.min(...hours) : 0;
                                                sliderMax = hours.length ? Math.max(...hours) : 720;
                                                sliderStep = 1;
                                                sliderUnit = 'hrs';
                                            }

                                            const rangeState = isNumeric
                                                ? ((selectedFilterValues[filter.id] as unknown as { min: string; max: string }) || { min: '', max: '' })
                                                : { min: '', max: '' };

                                            const minVal = rangeState.min !== '' ? parseFloat(rangeState.min) : sliderMin;
                                            const maxVal = rangeState.max !== '' ? parseFloat(rangeState.max) : sliderMax;

                                            return (
                                                <div key={filter.id} className="space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[var(--footer)] font-semibold text-sm">{filter.title}</Label>
                                                        <span className="text-[11px] text-[#7a7a68] bg-[#ece9e0] px-2 py-0.5 rounded-full">{filter.type}</span>
                                                    </div>

                                                    {/* ── TEXT OPTION TYPES → checkboxes ── */}
                                                    {isTextOption && (
                                                        <div className="max-h-44 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 border border-[#ece9e0] rounded-lg p-3 bg-[var(--background)]">
                                                            {filter.tag_options.map(opt => {
                                                                const currentVals = (selectedFilterValues[filter.id] as string[]) || [];
                                                                const isChecked = currentVals.includes(opt.option_value);
                                                                return (
                                                                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer group p-1 rounded hover:bg-white transition-colors">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => {
                                                                                setSelectedFilterValues(prev => {
                                                                                    const existing = (prev[filter.id] as string[]) || [];
                                                                                    const updated = isChecked
                                                                                        ? existing.filter(v => v !== opt.option_value)
                                                                                        : [...existing, opt.option_value];
                                                                                    return { ...prev, [filter.id]: updated };
                                                                                });
                                                                            }}
                                                                            className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer shrink-0"
                                                                        />
                                                                        <span className="text-[#7a7a68] group-hover:text-[var(--footer)] text-xs truncate">{opt.option_value}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* ── NUMERIC TYPES → dual-thumb single-track slider ── */}
                                                    {isNumeric && (() => {
                                                        const pct = (v: number) => sliderMax === sliderMin ? 0 : ((v - sliderMin) / (sliderMax - sliderMin)) * 100;
                                                        const minPct = pct(minVal);
                                                        const maxPct = pct(maxVal);
                                                        return (
                                                            <div className="space-y-2 border border-[#ece9e0] rounded-lg p-4 bg-[var(--background)]">
                                                                {/* Value labels */}
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="font-semibold text-[var(--primary)] tabular-nums">{minVal} {sliderUnit}</span>
                                                                    <span className="text-xs text-[#7a7a68]">—</span>
                                                                    <span className="font-semibold text-[var(--primary)] tabular-nums">{maxVal} {sliderUnit}</span>
                                                                </div>

                                                                {/* Single track, two thumbs */}
                                                                <div className="relative h-6 flex items-center select-none">
                                                                    {/* Grey track background */}
                                                                    <div className="absolute w-full h-1.5 rounded-full bg-[#ece9e0]" />
                                                                    {/* Colored fill between thumbs */}
                                                                    <div
                                                                        className="absolute h-1.5 rounded-full bg-[var(--primary)]"
                                                                        style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
                                                                    />
                                                                    {/* Min thumb */}
                                                                    <input
                                                                        type="range"
                                                                        min={sliderMin}
                                                                        max={sliderMax}
                                                                        step={sliderStep}
                                                                        value={minVal}
                                                                        onChange={e => {
                                                                            const v = Math.min(parseFloat(e.target.value), maxVal - sliderStep);
                                                                            setSelectedFilterValues(prev => ({
                                                                                ...prev,
                                                                                [filter.id]: { ...(prev[filter.id] as any || { min: '', max: '' }), min: String(v) }
                                                                            }));
                                                                        }}
                                                                        className="absolute w-full h-1.5 dual-thumb-range bg-transparent cursor-pointer"
                                                                    />
                                                                    {/* Max thumb */}
                                                                    <input
                                                                        type="range"
                                                                        min={sliderMin}
                                                                        max={sliderMax}
                                                                        step={sliderStep}
                                                                        value={maxVal}
                                                                        onChange={e => {
                                                                            const v = Math.max(parseFloat(e.target.value), minVal + sliderStep);
                                                                            setSelectedFilterValues(prev => ({
                                                                                ...prev,
                                                                                [filter.id]: { ...(prev[filter.id] as any || { min: '', max: '' }), max: String(v) }
                                                                            }));
                                                                        }}
                                                                        className="absolute w-full h-1.5 dual-thumb-range bg-transparent cursor-pointer"
                                                                    />
                                                                </div>

                                                                {/* Bounds + reset */}
                                                                <div className="flex items-center justify-between text-[11px] text-[#7a7a68]">
                                                                    <span>{sliderMin} {sliderUnit}</span>
                                                                    {(rangeState.min !== '' || rangeState.max !== '') && (
                                                                        <button
                                                                            onClick={() => setSelectedFilterValues(prev => { const n = { ...prev }; delete n[filter.id]; return n; })}
                                                                            className="text-red-400 hover:text-red-500 font-medium"
                                                                        >{t("advanced_filters.reset")}</button>
                                                                    )}
                                                                    <span>{sliderMax} {sliderUnit}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* ── TEXT → free text search ── */}
                                                    {ftype === 'TEXT' && (
                                                        <input
                                                            type="text"
                                                            placeholder={t("search_placeholder")}
                                                            value={(selectedFilterValues[filter.id] as string) || ''}
                                                            onChange={e => setSelectedFilterValues(prev => ({ ...prev, [filter.id]: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-[#ece9e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--footer)]"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            }
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-[#ece9e0] bg-[var(--background)] flex items-center justify-between rounded-b-2xl">
                            <p className="text-sm text-[#7a7a68]">
                                {(() => {
                                    const activeCount = Object.keys(selectedFilterValues).filter(k => {
                                        const v = selectedFilterValues[Number(k)];
                                        if (!v) return false;
                                        if (Array.isArray(v)) return v.length > 0;
                                        if (typeof v === 'object') { const rv = v as any; return rv.min !== '' || rv.max !== ''; }
                                        return v !== '';
                                    }).length;
                                    return activeCount > 0
                                        ? t("advanced_filters.active", { count: activeCount })
                                        : t("advanced_filters.noActive");
                                })()}
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setSelectedFilterValues({})} className="border-[#ece9e0] text-[#7a7a68] hover:bg-[#ece9e0] hover:text-[var(--footer)]">{tCommon("reset_filters")}</Button>
                                <Button onClick={() => setIsFilterModalOpen(false)} className="bg-[#3a3a2e] text-white hover:bg-[var(--primary)]">{tCommon("apply_filters")}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}