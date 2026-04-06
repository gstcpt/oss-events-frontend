"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "@/components/public/layouts/Hero";
import { Search, Grid, List } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { getBlogs, searchBlogs } from "@/lib/api/public/blogs";
import { Blog } from "@/types/public/blogs";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ItemCardSkeleton } from "@/components/ui/Skeleton";
import PostCard from "@/components/public/blog/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, Stagger, StaggerItem, TiltCard, Floating, ParticleField, ScrollProgressBar } from "@/components/ui/Motion3D";

export default function Blogs() {
    const t = useTranslations("BlogsPage");
    const h = useTranslations("BlogsPage.hero");
    const tCommon = useTranslations("Common");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("date-desc");
    const [viewType, setViewType] = useState("list");

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const data = await getBlogs();
                setBlogs(Array.isArray(data) ? data : []);
                setFilteredBlogs(Array.isArray(data) ? data : []);
                setError(null);
            } catch {
                toast.error(t("error"));
                setBlogs([]); setFilteredBlogs([]); setError(t("error"));
            } finally { setLoading(false); }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        const filterBlogs = async () => {
            const isAllCategories = selectedCategories.includes("all");
            if (searchTerm || (!isAllCategories && selectedCategories.length > 0) || selectedTags.length > 0) {
                try {
                    const results = await searchBlogs(searchTerm, "date");
                    let filtered: Blog[] = results;
                    if (!isAllCategories && selectedCategories.length > 0) { filtered = filtered.filter((blog: Blog) => (blog.categories && blog.categories.some((cat: string) => selectedCategories.includes(cat))) || (blog.author?.name && selectedCategories.includes(blog.author.name))); }
                    if (selectedTags.length > 0) { filtered = filtered.filter((blog: Blog) => blog.tags && blog.tags.some((tag: string) => selectedTags.includes(tag))); }
                    setFilteredBlogs(filtered);
                } catch { toast.error(t("error")); }
            } else { setFilteredBlogs(blogs); }
        };
        filterBlogs();
    }, [searchTerm, selectedCategories, selectedTags, blogs]);

    const categories = ["all", ...Array.from(new Set(blogs.flatMap((blog: Blog) => [...(blog.categories || []), blog.author?.name]).filter(Boolean)))];
    const allTags = Array.from(new Set(blogs.flatMap((blog: Blog) => blog.tags || [])));
    const recentPosts = blogs.slice(0, 4);
    const sortedFilteredBlogs = [...filteredBlogs].sort((a, b) => {
        switch (sortBy) {
            case "name-asc": return a.title.localeCompare(b.title);
            case "name-desc": return b.title.localeCompare(a.title);
            case "date-asc": return (new Date(a.date || 0).getTime()) - (new Date(b.date || 0).getTime());
            default: return (new Date(b.date || 0).getTime()) - (new Date(a.date || 0).getTime());
        }
    });

    if (loading) return (
        <div className="min-h-screen bg-[var(--background)]">
            <Hero badge={h("badge")} title_part1={h("title_part1")} title_part2={h("title_accent")} description={h("subtitle")} bgImage="/images/default-images/hero/hero-blog.jpg" />
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <ItemCardSkeleton />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <ScrollProgressBar />
            <Hero badge={h("badge")} title_part1={h("title_part1")} title_part2={h("title_accent")} description={h("subtitle")} bgImage="/images/default-images/hero/hero-blog.jpg" />

            <section className="py-12 md:py-20 relative z-10 -mt-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* ── MAIN CONTENT ── */}
                        <div className="lg:col-span-2">
                            {/* Controls */}
                            <Reveal>
                                <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-2xl border border-[#ece9e0] shadow-sm">
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--background)] text-[#7a7a68] border border-[#ece9e0] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]">
                                        <option value="date-desc">{t("sort.default")}</option>
                                        <option value="date-asc">{t("sort.oldest")}</option>
                                        <option value="name-asc">{t("sort.az")}</option>
                                        <option value="name-desc">{t("sort.za")}</option>
                                    </select>
                                    <div className="flex gap-2">
                                        {[{ icon: Grid, val: "grid" }, { icon: List, val: "list" }].map(({ icon: Icon, val }) => (
                                            <motion.button key={val} whileTap={{ scale: 0.9 }}
                                                className={`p-2.5 rounded-xl transition-all ${viewType === val ? "bg-[var(--footer)] text-white shadow-md" : "bg-[var(--background)] text-[#7a7a68] border border-[#ece9e0] hover:bg-[#ece9e0]"}`}
                                                onClick={() => setViewType(val)}>
                                                <Icon className="w-5 h-5" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>

                            {/* Grid/List */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={viewType}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-8"}
                                >
                                    {sortedFilteredBlogs.map((blog, idx) => (
                                        <motion.div
                                            key={blog.id}
                                            initial={{ opacity: 0, y: 30, rotateX: -8 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ delay: (idx % 6) * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ perspective: 600 }}
                                        >
                                            <PostCard post={blog} index={idx} t={t} tCommon={tCommon} viewType={viewType as any} />
                                        </motion.div>
                                    ))}
                                    {sortedFilteredBlogs.length === 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-2 text-center py-16 bg-white rounded-2xl border border-[#ece9e0] shadow-sm">
                                            <Floating amplitude={10} duration={3}>
                                                <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Search className="w-8 h-8 text-[#7a7a68]" />
                                                </div>
                                            </Floating>
                                            <h3 className="text-xl font-semibold text-[var(--footer)] mb-2">{t("no_articles")}</h3>
                                            <p className="text-[#7a7a68]">{t("adjust_filters")}</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── SIDEBAR ── */}
                        <div className="space-y-6">
                            {/* Search */}
                            <Reveal direction="left">
                                <TiltCard intensity={6}>
                                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#ece9e0]">
                                        <h3 className="text-xl font-bold text-[var(--footer)] mb-5">{t("search_title")}</h3>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]" />
                                            <Input type="text" placeholder={t("search_placeholder")} value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value ?? "")}
                                                className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[#ece9e0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-[var(--footer)] placeholder-[#7a7a68] transition-all" />
                                        </div>
                                    </div>
                                </TiltCard>
                            </Reveal>

                            {/* Recent Posts */}
                            <Reveal direction="left" delay={0.1}>
                                <TiltCard intensity={5}>
                                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#ece9e0] relative overflow-hidden">
                                        <ParticleField count={4} color="var(--primary)" />
                                        <h3 className="text-xl font-bold text-[var(--footer)] mb-5 relative z-10">{t("recent_articles")}</h3>
                                        <div className="space-y-4 relative z-10">
                                            {recentPosts.map((post, i) => (
                                                <motion.div key={post.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                                    <Link href={`/blogs/${post.id}`} className="group flex gap-4">
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                                            <Image src={post.image || "/images/default.jpg"} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" width={64} height={64} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-[var(--footer)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 text-sm">{post.title}</h4>
                                                            <p className="text-xs text-[#7a7a68] mt-1">{post.date ? new Date(post.date).toLocaleDateString() : t("unknown_date")}</p>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </TiltCard>
                            </Reveal>

                            {/* Categories */}
                            <Reveal direction="left" delay={0.2}>
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#ece9e0]">
                                    <h3 className="text-xl font-bold text-[var(--footer)] mb-5">{t("categories_title")}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.slice(-8).map(category => {
                                            const safe = category ?? "";
                                            const isSelected = selectedCategories.includes(safe);
                                            return (
                                                <motion.button key={safe} whileTap={{ scale: 0.94 }}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected ? "bg-[var(--footer)] text-white shadow-md" : "bg-[var(--background)] text-[#7a7a68] border border-[#ece9e0] hover:bg-[#ece9e0]"}`}
                                                    onClick={() => {
                                                        if (safe === "all") setSelectedCategories(["all"]);
                                                        else setSelectedCategories(prev => {
                                                            const without = prev.filter(c => c !== "all");
                                                            return isSelected ? without.filter(c => c !== safe) : [...without, safe];
                                                        });
                                                    }}>
                                                    {safe === "all" ? t("all_categories") : safe}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Reveal>

                            {/* Tags */}
                            {allTags.length > 0 && (
                                <Reveal direction="left" delay={0.3}>
                                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#ece9e0]">
                                        <h3 className="text-xl font-bold text-[var(--footer)] mb-5">{t("tags_title")}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {allTags.slice(-8).map(tag => {
                                                const isSelected = selectedTags.includes(tag);
                                                return (
                                                    <motion.button key={tag} whileTap={{ scale: 0.9 }}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isSelected ? "bg-[var(--primary)] text-white shadow-md" : "bg-[var(--background)] text-[#7a7a68] border border-[#ece9e0] hover:bg-[#ece9e0]"}`}
                                                        onClick={() => setSelectedTags(prev => isSelected ? prev.filter(t => t !== tag) : [...prev, tag])}>
                                                        #{tag}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Reveal>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}