"use client";
import Hero from "@/components/public/layouts/Hero";
import Leadership from "@/components/public/layouts/Leadership";
import { Users, Calendar, Heart, Globe, CheckCircle, Sparkles, Target, Zap, Award, Clock, ArrowRight, Star, Shield } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getHomePageData } from "@/lib/api/public/home";
import { motion, useScroll, useTransform } from "framer-motion";
import { TiltCard, Reveal, Stagger, StaggerItem, Floating, ParticleField, CountUp, ScrollProgressBar, Magnetic } from "@/components/ui/Motion3D";

export default function About() {
    const t = useTranslations("AboutPage");
    const h = useTranslations("AboutPage.hero");
    const [stats, setStats] = useState({ vendors: 0, events: 0, satisfaction: 99, support: 0 });

    useEffect(() => {
        getHomePageData().then(data => {
            if (data?.stats) {
                setStats({
                    vendors: Number(data.stats.activeVendors) || 0,
                    events: Number(data.stats.eventsCreated) || 0,
                    satisfaction: 99,
                    support: 24,
                });
            }
        }).catch(() => { });
    }, []);

    const statCards = [
        { icon: Users, value: stats.vendors, suffix: "+", label: t('stats.vendors'), color: "from-violet-500 to-purple-600" },
        { icon: Calendar, value: stats.events, suffix: "+", label: t('stats.events'), color: "from-blue-500 to-cyan-600" },
        { icon: Heart, value: stats.satisfaction, suffix: "%", label: t('stats.satisfaction'), color: "from-rose-500 to-pink-600" },
        { icon: Globe, value: stats.support, suffix: "/7", label: t('stats.support'), color: "from-emerald-500 to-teal-600" },
    ];

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <ScrollProgressBar />

            <Hero
                badge={h("badge")}
                title_part1={h("title_part1")}
                title_part2={h("title_accent")}
                description={h("subtitle")}
                bgImage="/images/default-images/hero/hero-about.jpg"
            />

            {/* ── STATS 3D TILT CARDS ── */}
            <section className="container mx-auto px-6 pt-24 pb-8 relative z-20">
                <Stagger staggerDelay={0.12} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, idx) => (
                        <StaggerItem key={idx}>
                            <TiltCard intensity={14} glare className="h-full">
                                <div className="relative bg-white p-8 text-center rounded-2xl shadow-xl shadow-black/5 border border-[#ece9e0] overflow-hidden group cursor-default">
                                    {/* Gradient blob */}
                                    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-700`} />
                                    <div
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}
                                        style={{ transform: "translateZ(20px)" }}
                                    >
                                        <stat.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-4xl font-extrabold text-[var(--footer)] mb-1 tracking-tighter" style={{ transform: "translateZ(10px)" }}>
                                        <CountUp target={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-[#7a7a68] text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
                                </div>
                            </TiltCard>
                        </StaggerItem>
                    ))}
                </Stagger>
            </section>

            {/* ── OUR STORY ── */}
            <section className="py-32 px-6 relative overflow-hidden">
                <ParticleField count={15} color="var(--primary)" />
                <div className="container mx-auto max-w-7xl relative z-10">
                    <Reveal className="text-center mb-20 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                            <Sparkles className="h-4 w-4" />
                            {t('story.badge')}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 text-[var(--footer)] tracking-tighter leading-tight">
                            {t('story.title_part1')} <span className="text-[var(--primary)]">{t('story.title_accent')}</span>
                        </h2>
                        <p className="text-lg md:text-xl text-[#7a7a68] leading-relaxed font-medium">{t('story.subtitle')}</p>
                    </Reveal>

                    <div className="grid lg:grid-cols-2 gap-20 items-start">
                        {/* Text side */}
                        <Reveal direction="right" delay={0.1}>
                            <div className="space-y-8">
                                <div className="prose prose-xl max-w-none text-[#7a7a68] leading-relaxed text-justify space-y-6">
                                    <p className="text-xl md:text-2xl italic text-[var(--footer)] mb-8 relative">
                                        <span className="text-6xl text-[var(--primary)]/20 absolute -top-8 -left-6">"</span>
                                        {t('story.p1')}
                                    </p>
                                    <p>{t('story.p2')}</p>
                                    <p>{t('story.p3')}</p>
                                </div>
                                {/* Dark quote card */}
                                <motion.div
                                    whileHover={{ scale: 1.02, rotateZ: -0.5 }}
                                    className="p-8 rounded-2xl bg-[var(--footer)] text-white relative overflow-hidden shadow-2xl cursor-default"
                                >
                                    <ParticleField count={8} color="#fff" />
                                    <p className="text-xl font-medium mb-6 relative z-10 italic">"{t('story.quote')}"</p>
                                    <footer className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] relative z-10">
                                        {t('story.footer')}
                                    </footer>
                                </motion.div>
                            </div>
                        </Reveal>

                        {/* Image mosaic with 3D depth */}
                        <Reveal direction="left" delay={0.2}>
                            <div className="relative" style={{ perspective: "1000px" }}>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-5">
                                        <motion.div
                                            whileHover={{ rotateY: -5, rotateX: 5, scale: 1.03 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                            className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4]"
                                            style={{ transformStyle: "preserve-3d" }}
                                        >
                                            <Image src="/images/default-images/about/about-1.jpg" alt="About" fill className="object-cover" />
                                        </motion.div>
                                        <Floating amplitude={8} duration={3}>
                                            <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--footer)] p-8 rounded-2xl text-white shadow-2xl aspect-square flex flex-col justify-center items-center text-center">
                                                <Users className="w-10 h-10 mb-3" />
                                                <p className="text-3xl font-bold tracking-tighter mb-1">500+</p>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-80">{t('why_us.search_title')}</p>
                                            </div>
                                        </Floating>
                                    </div>
                                    <div className="space-y-5 pt-10">
                                        <Floating amplitude={6} duration={3.5} delay={0.5}>
                                            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-[#ece9e0] aspect-square flex flex-col justify-center items-center text-center">
                                                <Award className="w-10 h-10 text-[var(--primary)] mb-3" />
                                                <p className="text-3xl font-bold text-[var(--footer)] tracking-tighter mb-1">100%</p>
                                                <p className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-[0.1em]">{t('stats.satisfaction')}</p>
                                            </div>
                                        </Floating>
                                        <motion.div
                                            whileHover={{ rotateY: 5, rotateX: -5, scale: 1.03 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                            className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4]"
                                            style={{ transformStyle: "preserve-3d" }}
                                        >
                                            <Image src="/images/default-images/about/about-2.jpg" alt="About" fill className="object-cover" />
                                        </motion.div>
                                    </div>
                                </div>
                                {/* Ambient orbs */}
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -z-10" />
                                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ece9e0] rounded-full blur-3xl -z-10" />
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── CTA DARK BAND ── */}
            <section className="py-32 px-6 relative overflow-hidden bg-[var(--footer)]">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                <ParticleField count={25} color="var(--primary)" />
                <div className="container mx-auto relative z-10 max-w-5xl text-center space-y-10">
                    <Reveal>
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">{t('cta.title')}</h2>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mt-6">{t('cta.subtitle')}</p>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
                            <Magnetic strength={0.3}>
                                <motion.a
                                    href="/categories"
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="px-10 py-5 bg-[var(--primary)] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-[var(--primary)]/30 flex items-center justify-center gap-3 transition-shadow hover:shadow-[var(--primary)]/50"
                                >
                                    {t('cta.explore')} <ArrowRight className="w-4 h-4" />
                                </motion.a>
                            </Magnetic>
                            <Magnetic strength={0.3}>
                                <motion.a
                                    href="/auth?tab=signup"
                                    whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.15)" }}
                                    whileTap={{ scale: 0.97 }}
                                    className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center transition-all"
                                >
                                    {t('cta.become_provider')}
                                </motion.a>
                            </Magnetic>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── WHY US – 3D FEATURE CARDS ── */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="container mx-auto relative z-10 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Image side */}
                        <Reveal direction="right">
                            <div className="grid grid-cols-2 gap-4" style={{ perspective: "800px" }}>
                                <div className="space-y-4">
                                    <motion.div whileHover={{ rotateY: -8, scale: 1.03 }} transition={{ type: "spring" }} className="rounded-3xl overflow-hidden border border-[#ece9e0] shadow-xl">
                                        <Image src="/images/default-images/about/about-2.jpg" alt="Event" width={300} height={192} className="w-full h-48 object-cover" />
                                    </motion.div>
                                    <Floating amplitude={10} duration={3.5}>
                                        <div className="rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--footer)] p-6 text-center">
                                            <Users className="h-10 w-10 text-white mx-auto mb-3" />
                                            <p className="text-2xl font-bold text-white">500+</p>
                                            <p className="text-sm text-white/80">{t('why_us.search_title')}</p>
                                        </div>
                                    </Floating>
                                </div>
                                <div className="space-y-4 pt-8">
                                    <Floating amplitude={8} duration={4} delay={0.8}>
                                        <div className="rounded-3xl bg-white p-6 border border-[#ece9e0] shadow-xl">
                                            <Target className="h-10 w-10 text-[var(--primary)] mx-auto mb-3" />
                                            <p className="text-2xl font-bold text-[var(--footer)] text-center">100%</p>
                                            <p className="text-sm text-[#7a7a68] text-center">{t('stats.satisfaction')}</p>
                                        </div>
                                    </Floating>
                                    <motion.div whileHover={{ rotateY: 8, scale: 1.03 }} transition={{ type: "spring" }} className="rounded-3xl overflow-hidden border border-[#ece9e0] shadow-xl">
                                        <Image src="/images/default-images/about/about-3.jpg" alt="Ceremony" width={300} height={192} className="w-full h-48 object-cover" />
                                    </motion.div>
                                </div>
                            </div>
                        </Reveal>

                        {/* Text side */}
                        <div className="space-y-8">
                            <Reveal direction="left">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-4">{t('why_us.badge')}</span>
                                <h2 className="text-3xl md:text-5xl font-bold leading-tight text-[var(--footer)]">
                                    {t('why_us.title_part1')} <span className="text-[var(--primary)]">{t('why_us.title_accent')}</span>
                                </h2>
                            </Reveal>
                            <Reveal direction="left" delay={0.1}>
                                <p className="text-lg text-[#7a7a68] leading-relaxed text-justify">{t('why_us.subtitle')}</p>
                            </Reveal>
                            <Stagger staggerDelay={0.12}>
                                {[
                                    { icon: Zap, title: t('why_us.search_title'), desc: t('why_us.search_desc') },
                                    { icon: Clock, title: t('why_us.save_time_title'), desc: t('why_us.save_time_desc') },
                                    { icon: Award, title: t('why_us.quality_title'), desc: t('why_us.quality_desc') },
                                ].map((item, i) => (
                                    <StaggerItem key={i}>
                                        <TiltCard intensity={8} className="mb-3">
                                            <div className="flex gap-4 p-5 rounded-2xl bg-white/70 border border-[#ece9e0] hover:border-[var(--primary)]/30 hover:bg-white transition-all duration-500 shadow-sm hover:shadow-md cursor-default">
                                                <div className="shrink-0 p-3 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                                                    <item.icon className="h-6 w-6 text-[var(--primary)]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-[var(--footer)] mb-1">{item.title}</h3>
                                                    <p className="text-sm text-[#7a7a68]">{item.desc}</p>
                                                </div>
                                            </div>
                                        </TiltCard>
                                    </StaggerItem>
                                ))}
                            </Stagger>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── OUR JOURNEY ── */}
            <section className="section-padding relative overflow-hidden my-8 py-24 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <Reveal direction="right">
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-3xl" />
                                <motion.div
                                    whileHover={{ scale: 1.02, rotateZ: -0.5 }}
                                    className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white"
                                >
                                    <Image src="/images/default-images/about/about-4.jpg" width={500} height={500} alt="Our Story" className="w-full h-full object-cover" />
                                </motion.div>
                                <Floating amplitude={12} duration={4} delay={0.5}>
                                    <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-xl max-w-xs hidden md:block border border-[#ece9e0]">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Zap className="w-6 h-6 text-green-600" /></div>
                                            <div>
                                                <p className="font-bold text-[var(--footer)]">{t('journey.fast_easy')}</p>
                                                <p className="text-xs text-[#7a7a68]">{t('journey.booking_process')}</p>
                                            </div>
                                        </div>
                                        <p className="text-[#7a7a68] text-sm italic">"{t('journey.testimonial')}"</p>
                                    </div>
                                </Floating>
                            </div>
                        </Reveal>

                        <Reveal direction="left" delay={0.15}>
                            <div>
                                <span className="text-[var(--primary)] font-bold tracking-wider text-sm mb-2 block">{t('journey.badge')}</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-[var(--footer)] mb-6">
                                    {t('journey.title_part1')} <span className="text-[var(--primary)]">{t('journey.title_accent')}</span>
                                </h2>
                                <div className="space-y-5 text-lg text-[#7a7a68] leading-relaxed">
                                    <p>{t('journey.p1')}</p>
                                    <p>{t('journey.p2')}</p>
                                    <div className="flex flex-col gap-3 mt-6">
                                        {[t('journey.item1'), t('journey.item2'), t('journey.item3')].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                                className="flex items-center gap-3"
                                            >
                                                <CheckCircle className="w-6 h-6 text-[var(--primary)] shrink-0" />
                                                <span className="font-medium text-[var(--footer)]">{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── VALUES – 3D FLIP CARDS ── */}
            <section className="py-24 bg-[var(--footer)] text-white relative overflow-hidden">
                <ParticleField count={30} color="var(--primary)" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <Reveal>
                        <h2 className="text-3xl md:text-5xl font-bold mb-16">
                            <span className="text-[var(--primary)]">{t('values.title_part1')}</span> {t('values.title_accent')}
                        </h2>
                    </Reveal>
                    <Stagger staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Target, title: t('values.excellence_title'), desc: t('values.excellence_desc'), color: "from-violet-500 to-purple-700" },
                            { icon: Heart, title: t('values.passion_title'), desc: t('values.passion_desc'), color: "from-rose-500 to-pink-700" },
                            { icon: Sparkles, title: t('values.innovation_title'), desc: t('values.innovation_desc'), color: "from-amber-500 to-orange-600" },
                        ].map((val, i) => (
                            <StaggerItem key={i}>
                                <TiltCard intensity={10} glare className="h-full">
                                    <div className="p-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 backdrop-blur-sm cursor-default relative overflow-hidden">
                                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${val.color} opacity-20 blur-2xl`} />
                                        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${val.color} flex items-center justify-center shadow-xl`}>
                                            <val.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-4">{val.title}</h3>
                                        <p className="text-white/70 leading-relaxed">{val.desc}</p>
                                    </div>
                                </TiltCard>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>

            <Leadership />
        </div>
    );
}
