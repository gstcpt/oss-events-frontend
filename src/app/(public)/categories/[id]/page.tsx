"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getPublicCategoryById, getPublicCategoryItems } from "@/lib/api/public/categories";
import { PublicCategory } from "@/types/public/categories";
import { PublicItem } from "@/types/public/items";
import { toast } from "sonner";
import Hero from "@/components/public/layouts/Hero";
import ItemCard from "@/components/public/items/ItemCard";
import { ScrollProgressBar, Reveal, Stagger, StaggerItem, Floating, ParticleField } from "@/components/ui/Motion3D";

export default function CategoryDetail({ params }: { params: { id: string } }) {
    const t = useTranslations("CategoriesPage");
    const tDetail = useTranslations("CategoryDetail");
    const tCommon = useTranslations("Common");
    const [category, setCategory] = useState<PublicCategory | null>(null);
    const [items, setItems] = useState<PublicItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const categoryId = parseInt(params.id);

    useEffect(() => { fetchCategory(); }, [categoryId]);

    useEffect(() => { if (category) fetchItems(); }, [category, page]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const data = await getPublicCategoryById(categoryId);
            setCategory(data);
        } catch { toast.error(tCommon("loading_failed")); } finally { setLoading(false); }
    };

    const fetchItems = async () => {
        try {
            setLoadingItems(true);
            const data = await getPublicCategoryItems(categoryId, page, 12);
            setItems(data.items);
            setTotalPages(data.totalPages);
        } catch { toast.error(tCommon("loading_failed")); } finally { setLoadingItems(false); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)]">
                <ScrollProgressBar />
                <div className="animate-pulse space-y-8 pt-[15vh] px-6 max-w-7xl mx-auto">
                    <div className="h-8 bg-slate-200 rounded w-1/3" />
                    <div className="h-64 bg-slate-200 rounded-xl" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 bg-slate-200 rounded-xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-[var(--background)] pt-[15vh]">
                <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-2xl font-bold text-[var(--footer)]">{tDetail("not_found")}</h1>
                    <Link href="/categories">
                        <Button className="mt-6">{tDetail("back_to_categories")}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <ScrollProgressBar />
            <Reveal>
                <Hero
                    badge={t("badge")}
                    title_part1={category.title}
                    title_part2=""
                    description={category.description || t("subtitle")}
                    bgImage={category.image || "/images/default-images/hero/hero-categories.jpg"}
                />
            </Reveal>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <Reveal>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/categories" className="hover:text-[var(--accent)] transition-colors">{t("breadcrumb_home")}</Link>
                        <ChevronRight size={16} />
                        <span className="text-[var(--footer)] font-medium">{category.title}</span>
                    </div>
                </Reveal>

                {category.children && category.children.length > 0 && (
                    <Reveal>
                        <section className="mb-16">
                            <h2 className="text-2xl font-bold text-[var(--footer)] mb-6">{tDetail("subcategories")}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                <Stagger>
                                    {category.children.map((child) => (
                                        <StaggerItem key={child.id}>
                                            <Link href={`/categories/${child.id}`}>
                                                <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg transition-all cursor-pointer group">
                                                    <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">{child.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{child.item_category?.length || 0} {tDetail("items")}</p>
                                                </div>
                                            </Link>
                                        </StaggerItem>
                                    ))}
                                </Stagger>
                            </div>
                        </section>
                    </Reveal>
                )}

                <Reveal>
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--footer)] mb-8">{tDetail("items_in_category", { name: category.title })}</h2>
                        {loadingItems ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse" />)}
                            </div>
                        ) : items.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    <Stagger>
                                        {items.map((item) => (
                                            <StaggerItem key={item.id}>
                                                <Link href={`/items/${item.id}`}>
                                                    <ItemCard item={item} />
                                                </Link>
                                            </StaggerItem>
                                        ))}
                                    </Stagger>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-12">
                                        <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                            <ArrowLeft size={16} className="mr-2" /> {tCommon("previous")}
                                        </Button>
                                        <span className="flex items-center px-4 text-sm text-gray-600">{page} / {totalPages}</span>
                                        <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                            {tCommon("next")} <ArrowLeft size={16} className="ml-2 rotate-180" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-center text-gray-500 py-12">{tDetail("no_items")}</p>
                        )}
                    </section>
                </Reveal>
            </div>

            <Floating>
                <Link href="/categories">
                    <Button variant="outline" className="fixed bottom-8 left-8 shadow-xl">
                        <ArrowLeft size={18} className="mr-2" /> {t("breadcrumb_home")}
                    </Button>
                </Link>
            </Floating>
        </div>
    );
}