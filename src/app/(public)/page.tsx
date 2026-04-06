"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Star, Users, Award, Search, FileText, ChevronLeft, ChevronRight, MapPin, Calendar, DollarSign, Sparkles, Handshake, Calendar1, CalendarCheck, Mail } from "lucide-react";
import CTASection from "@/components/public/layouts/CTASection";
import Testimonials from "@/components/public/layouts/Testimonials";
import HeroHome from "@/components/public/layouts/home-Intro";
import Image from "next/image";
import { getHomePageData } from "@/lib/api/public/home";
import { HomePageData, Category, Provider, Blog } from "@/types/public/home";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Reveal, TiltCard, Stagger, StaggerItem, ParticleField, CountUp } from "@/components/ui/Motion3D";
import { useAuth } from "@/context/AuthContext";
import CategoryCard from "@/components/public/categories/CategoryCard";
import ItemCard from "@/components/public/items/ItemCard";
import ProviderCard from "@/components/public/providers/ProviderCard";
import PostCard from "@/components/public/blog/PostCard";
import QuickViewModal from "@/components/public/items/QuickViewModal";

export default function Home() {
    const t = useTranslations("Home");
    const tCommon = useTranslations("Common");
    const tProviders = useTranslations("ProvidersPage");
    const tBlogs = useTranslations("BlogsPage");
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [homeData, setHomeData] = useState<HomePageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [companyInfo, setCompanyInfo] = useState<any>(null);

    const [categoriesRef, categoriesApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 1 });
    const [providersRef, providersApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 1 });
    const [blogsRef, blogsApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 1 });
    const [itemsRef, itemsApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 1 });
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const handleQuickView = (item: any) => {
        setSelectedItem(item);
        setIsQuickViewOpen(true);
    };

    const topCategories = useMemo(() => {
        return categories
            .filter((c: any) => !c.head_category_id)
            .sort((a, b) => b.id - a.id)
            .slice(0, 8);
    }, [categories]);

    const topItems = useMemo(() => {
        return items.sort((a: any, b: any) => b.id - a.id).slice(0, 8);
    }, [items]);

    const topProviders = useMemo(() => {
        return providers.sort((a, b) => b.id - a.id).slice(0, 6);
    }, [providers]);

    const topBlogs = useMemo(() => {
        return blogs.sort((a, b) => b.id - a.id).slice(0, 6);
    }, [blogs]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHomePageData(user?.id);
                setHomeData(data);
                setCategories(data.categories);
                setProviders(data.providers);
                setBlogs(data.blogs);
                setItems(data.items || []);
                setCompanyInfo(data.companyInfo || null);
            } catch (error) {
                toast.error("Failed to load home page data");
            } finally { setLoading(false); }
        };
        fetchData();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">{t("loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <HeroHome />

            {/* ── CATEGORIES (The Marriage) ── */}
            <Reveal direction="up">
                <section className="relative overflow-visible z-10 pt-[18vh] pb-24 bg-cover bg-top -mt-[15vh]" style={{ backgroundImage: "url('/images/home-categories.jpg')" }}>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative">
                            <div className="relative z-30">
                                <div className="text-center mb-16">
                                    <h2 className="text-4xl md:text-[42px] font-bold text-[var(--footer)] leading-tight mb-4 mx-auto max-w-2xl">{t("categories.title")}</h2>
                                    <p className="text-[#a1a194] text-[18px] max-w-2xl mx-auto leading-relaxed">{t("categories.subtitle")}</p>
                                </div>

                                {/* Carousel */}
                                <div className="relative group/carousel">
                                    <div className="overflow-hidden relative z-10" ref={categoriesRef}>
                                        <div className="flex gap-6">
                                            {topCategories.map((cat, idx) => (
                                                <div key={idx} className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] min-w-0">
                                                    <CategoryCard category={cat} idx={idx} t={t} tCommon={tCommon} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Nav arrows */}
                                    <button onClick={() => categoriesApi?.scrollPrev()} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-12 h-12 flex items-center justify-center text-[#9ca3af] hover:text-[#6b7280] transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                        <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
                                    </button>
                                    <button onClick={() => categoriesApi?.scrollNext()} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-12 h-12 flex items-center justify-center text-[#9ca3af] hover:text-[#6b7280] transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                        <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
                                    </button>
                                </div>

                                <div className="text-center mt-12">
                                    <Link href="/categories" className="inline-flex items-center justify-center min-w-[320px] h-14 bg-[var(--primary)] !text-white text-[15px] font-bold rounded-full shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all duration-200">{t("categories.view_all")}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* ── STATS ── */}
            <Reveal direction="up">
                <section className="py-24 bg-[var(--footer)] relative overflow-hidden">
                    {/* Decoration */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[var(--primary)] rounded-full blur-[120px] -translate-y-1/2 animate-pulse" />
                        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[100px] -translate-y-1/2" />
                        <ParticleField count={20} color="#ffffff" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center items-center">
                            {[
                                { label: t("stats.events"), value: homeData?.stats?.eventsCreated ? `${Number(homeData.stats.eventsCreated).toLocaleString()}` : "0", suffix: "+", icon: <CalendarCheck className="w-8 h-8 text-[var(--primary)]" /> },
                                { label: t("stats.vendors"), value: homeData?.stats?.activeVendors ? `${Number(homeData.stats.activeVendors).toLocaleString()}` : "0", suffix: "+", icon: <Users className="w-8 h-8 text-blue-400" /> },
                                { label: t("stats.services"), value: homeData?.stats?.activeServices ? `${Number(homeData.stats.activeServices).toLocaleString()}` : "0", suffix: "+", icon: <Handshake className="w-8 h-8 text-purple-400" /> },
                                { label: t("stats.subscribers"), value: homeData?.stats?.newsletterSubscribers ? `${Number(homeData.stats.newsletterSubscribers).toLocaleString()}` : "0", suffix: "+", icon: <Mail className="w-8 h-8 text-pink-400" /> },
                            ].map((stat, idx) => (
                                <StaggerItem key={idx}>
                                <div className="flex flex-col items-center group">
                                    <div className="w-20 h-20 mb-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-700">
                                        <div className="group-hover:rotate-[10deg] transition-transform duration-500">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl lg:text-6xl font-extrabold text-white tracking-tighter leading-none">
                                            <CountUp target={Number(stat.value.replace(/,/g, ''))} duration={3} />
                                        </span>
                                        <span className="text-2xl font-bold text-[var(--primary)]">{stat.suffix}</span>
                                    </div>
                                    <div className="text-white/40 text-[10px] uppercase font-extrabold tracking-[0.4em] mt-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/30 group-hover:bg-[var(--primary)] transition-colors" />
                                        {stat.label}
                                    </div>
                                </div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>
            </Reveal>

            {/* ── FEATURED SERVICES / ITEMS ── */}
            <Reveal direction="up">
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ece9e0] text-[#a1a194] text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                                <Image src="/images/icons/folder.png" width={14} height={14} alt="icon" className="opacity-60" />{t("featured_services.badge")}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-[var(--footer)] mb-6">{t("featured_services.title")}</h2>
                            <p className="text-[#a1a194] text-lg max-w-xl mx-auto">{t("featured_services.subtitle")}</p>
                        </div>

                        {/* Carousel */}
                        <div className="relative group/carousel">
                            <div className="overflow-hidden" ref={itemsRef}>
                                <div className="flex gap-6">
                                    {topItems.map((item, idx) => (
                                        <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6">
                                            <ItemCard item={item} onQuickView={handleQuickView} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => itemsApi?.scrollPrev()} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-12 h-12 bg-white rounded-full shadow-2xl border border-[#ece9e0] flex items-center justify-center text-[#6b6b5a] hover:text-[var(--primary)] hover:scale-110 transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={() => itemsApi?.scrollNext()} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-12 h-12 bg-white rounded-full shadow-2xl border border-[#ece9e0] flex items-center justify-center text-[#6b6b5a] hover:text-[var(--primary)] hover:scale-110 transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-center mt-12">
                            <Link href="/items" className="inline-flex items-center justify-center min-w-[320px] h-14 bg-[var(--primary)] !text-white text-[15px] font-bold rounded-full shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all duration-200 px-4">{t("featured_services.view_all")}<ArrowRight size={16} className="!text-white ml-2" /></Link>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* ── HOW IT WORKS ── */}
            <Reveal direction="up" delay={0.2}>
                <section className="py-24 bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] opacity-50" />
                    <ParticleField count={15} color="var(--primary)" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ece9e0] text-[#a1a194] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
                                <Sparkles className="h-3 w-3 text-[var(--primary)]" />
                                {t("process.badge")}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-[var(--footer)] mb-6">
                                {t("process.title_part1")} <span className="text-[var(--primary)]">{t("process.title_accent")}</span> {t("process.title_part2")}
                            </h2>
                            <p className="text-[#a1a194] text-lg max-w-xl mx-auto leading-relaxed">{t("process.subtitle")}</p>
                        </div>
                        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                { icon: "/images/icons/search.png", title: t("process.step1.title"), desc: t("process.step1.desc") },
                                { icon: "/images/icons/file.png", title: t("process.step2.title"), desc: t("process.step2.desc") },
                                { icon: "/images/icons/folder.png", title: t("process.step3.title"), desc: t("process.step3.desc") },
                            ].map((step, idx) => (
                                <StaggerItem key={idx}>
                                    <TiltCard intensity={5} className="h-full">
                                        <div className="group flex flex-col items-center text-center p-8 md:p-12 rounded-xl bg-white border border-[#ece9e0] hover:border-[var(--primary)]/30 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-footer/5 h-full">
                                            <div className="w-20 h-20 rounded-3xl bg-[var(--background)]/50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[var(--primary)]/10 transition-all duration-500 relative">
                                                <Image src={step.icon} width={32} height={32} alt="step icon" className="group-hover:rotate-6 transition-transform duration-500 relative z-10" />
                                            </div>
                                            <h4 className="font-bold text-[var(--footer)] text-xl mb-4 group-hover:text-primary transition-colors">{step.title}</h4>
                                            <p className="text-[#a1a194] text-[13px] leading-relaxed">{step.desc}</p>
                                        </div>
                                    </TiltCard>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>
            </Reveal>

            {/* ── FEATURED PROVIDERS ── */}
            <Reveal direction="up" delay={0.2}>
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-16">
                            {/* Left text panel */}
                            <div className="lg:w-80 flex-shrink-0">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[#ece9e0] text-[#a1a194] text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                                    <Image src="/images/icons/user-check.png" width={14} height={14} alt="icon" className="opacity-60" />
                                    {t("featured_providers.badge")}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-[var(--footer)] leading-tight mb-6">
                                    {t("featured_providers.title")}
                                </h2>
                                <p className="text-[#a1a194] text-lg leading-relaxed mb-10">
                                    {t("featured_providers.subtitle")}
                                </p>
                                <Link
                                    href="/providers"
                                    className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[var(--primary)] !text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary)]/10 hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all duration-200"
                                >
                                    {t("featured_providers.view_all")}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform !text-white" />
                                </Link>
                            </div>

                            {/* Right: carousel */}
                            <div className="flex-1 relative group/carousel min-w-0">
                                <div className="overflow-hidden" ref={providersRef}>
                                    <div className="flex gap-6">
                                        {topProviders.map((provider, idx) => (
                                            <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 pl-6">
                                                <ProviderCard
                                                    provider={provider}
                                                    index={idx}
                                                    t={tProviders}
                                                    tCommon={tCommon}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => providersApi?.scrollPrev()} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white rounded-full shadow-2xl border border-[#ece9e0] flex items-center justify-center text-[#6b6b5a] hover:text-[var(--primary)] hover:scale-110 transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={() => providersApi?.scrollNext()} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 bg-white rounded-full shadow-2xl border border-[#ece9e0] flex items-center justify-center text-[#6b6b5a] hover:text-[var(--primary)] hover:scale-110 transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            <Reveal direction="up">
                <CTASection />
            </Reveal>

            {/* ── BLOG POSTS ── */}
            <Reveal direction="up" delay={0.2}>
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ece9e0] text-[#a1a194] text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                                <Image src="/images/icons/file.png" width={14} height={14} alt="icon" className="opacity-60" />
                                {t("blog.badge")}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-[var(--footer)] mb-6">
                                {t("blog.title")}
                            </h2>
                            <p className="text-[#a1a194] text-lg max-w-xl mx-auto leading-relaxed">{t("blog.subtitle")}</p>
                        </div>

                        {/* Carousel */}
                        <div className="relative group/carousel">
                            <div className="overflow-hidden" ref={blogsRef}>
                                <div className="flex gap-6">
                                    {topBlogs.map((post, idx) => (
                                        <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6">
                                            <PostCard
                                                post={post}
                                                index={idx}
                                                t={tBlogs}
                                                tCommon={tCommon}
                                                viewType="grid"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => blogsApi?.scrollPrev()} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-12 h-12 bg-white rounded-full shadow-2xl border border-[#ece9e0] flex items-center justify-center text-[#6b6b5a] hover:text-[var(--primary)] hover:scale-110 transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={() => blogsApi?.scrollNext()} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-12 h-12 bg-white rounded-full shadow-2xl border border-[#ece9e0] flex items-center justify-center text-[#6b6b5a] hover:text-[var(--primary)] hover:scale-110 transition-all z-10 opacity-0 group-hover/carousel:opacity-100 focus:outline-none">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-center mt-12">
                            <Link href="/blogs" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[var(--primary)] !text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary)]/10 hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all duration-200">
                                {tCommon("view_all")}
                                <ArrowRight size={16} className="!text-white ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>
            </Reveal>

            <Reveal direction="up">
                <Testimonials />
            </Reveal>

            <QuickViewModal
                isOpen={isQuickViewOpen}
                item={selectedItem}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </div>
    );
}