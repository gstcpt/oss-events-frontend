"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/public/layouts/Hero";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPublicCategories } from "@/lib/api/public/categories";
import { PublicCategory } from "@/types/public/categories";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import CategoryCard from "@/components/public/categories/CategoryCard";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, Stagger, StaggerItem, Floating, ParticleField, ScrollProgressBar } from "@/components/ui/Motion3D";

export default function Categories() {
    const t = useTranslations("CategoriesPage");
    const h = useTranslations("CategoriesPage.hero");
    const tCommon = useTranslations("Common");
    const [categories, setCategories] = useState<PublicCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getPublicCategories();
            setCategories(data);
        } catch { toast.error(tCommon("loading_failed")); } finally { setLoading(false); }
    };

    const getItemCount = (category: PublicCategory) => {
        const directItems = category.item_category?.length || 0;
        const subItems = category.children?.reduce((acc, child) => acc + (child.item_category?.length || 0), 0) || 0;
        return directItems + subItems;
    };

    const sortedCategories = [...categories]
        .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortBy === 'count' ? getItemCount(b) - getItemCount(a) : a.title.localeCompare(b.title));

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)]">
                <Hero badge={h("badge")} title_part1={h("title_part1")} title_part2={h("title_accent")} description={h("subtitle")} bgImage="/images/default-images/hero/hero-categories.jpg" />
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="h-60 rounded-3xl bg-gradient-to-br from-[#ece9e0] to-white shimmer border border-[#ece9e0]"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <ScrollProgressBar />
            <Hero badge={h("badge")} title_part1={h("title_part1")} title_part2={h("title_accent")} description={h("subtitle")} bgImage="/images/default-images/hero/hero-categories.jpg" />

            <section className="py-12 md:py-24 relative z-10 -mt-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-7xl mx-auto">

                        {/* ── FILTER BAR ── */}
                        <Reveal>
                            <motion.div
                                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white p-6 md:p-8 mb-12 relative overflow-hidden"
                                whileHover={{ y: -2 }}
                            >
                                <ParticleField count={5} color="var(--primary)" />
                                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between relative z-10">
                                    <div className="text-left w-full lg:w-auto">
                                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--footer)] mb-1">{t("browse_title")}</h2>
                                        <p className="text-[#7a7a68]">{t("browse_count", { count: categories.length })}</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
                                        <div className="relative w-full sm:max-w-xs lg:max-w-md">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68]" />
                                            <Input
                                                type="text"
                                                placeholder={t("search_placeholder")}
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-6 bg-[var(--background)] border-[#ece9e0] rounded-2xl focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-[var(--footer)] placeholder:text-[#7a7a68] transition-all"
                                            />
                                        </div>
                                        <div className="relative w-full sm:w-44">
                                            <select
                                                value={sortBy}
                                                onChange={e => setSortBy(e.target.value)}
                                                className="appearance-none w-full pl-4 pr-10 py-3 bg-[var(--background)] border border-[#ece9e0] rounded-2xl focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-[var(--footer)] cursor-pointer font-medium text-sm"
                                            >
                                                <option value="name">{t("sort_name")}</option>
                                                <option value="count">{t("sort_services")}</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Reveal>

                        {/* ── GRID ── */}
                        <AnimatePresence mode="wait">
                            {sortedCategories.length > 0 ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10"
                                >
                                    {sortedCategories.map((category, idx) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, y: 40, rotateX: -10 }}
                                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                            transition={{ delay: idx * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ perspective: 600 }}
                                        >
                                            <CategoryCard category={category} idx={idx} t={t} tCommon={tCommon} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-32 bg-white rounded-2xl border border-[#ece9e0] shadow-sm"
                                >
                                    <Floating amplitude={10} duration={3}>
                                        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[var(--background)] to-[#ece9e0] rounded-full flex items-center justify-center text-[#7a7a68] shadow-xl">
                                            <Search className="w-10 h-10" />
                                        </div>
                                    </Floating>
                                    <h3 className="text-2xl font-bold text-[var(--footer)] mb-3">{t("no_categories_found")}</h3>
                                    <p className="text-[#7a7a68] max-w-sm mx-auto">
                                        {searchTerm ? t("no_results_for", { query: searchTerm }) : t("catalog_update")}
                                    </p>
                                    {searchTerm && (
                                        <Button onClick={() => setSearchTerm("")} variant="outline" className="mt-8 rounded-2xl border-[#ece9e0] hover:bg-[var(--background)] transition-all">
                                            {t("clear_search")}
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </div>
    );
}