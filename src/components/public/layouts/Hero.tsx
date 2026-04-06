"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, Floating, ParticleField } from "@/components/ui/Motion3D";

interface HeroProps {
    badge?: string;
    title_part1: string;
    title_part2: string;
    description: string;
    bgImage: string;
}

export default function Hero({ badge, title_part1, title_part2, description, bgImage }: HeroProps) {
    const t = useTranslations("Common");
    const router = useRouter();
    const isBack = badge && (badge === t("back") || badge === "Back");

    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

    return (
        <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            {/* ── FLOAT BACK BUTTON ── */}
            {isBack && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-28 left-6 md:left-12 z-50"
                >
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full text-white hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-500 shadow-2xl active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t("back")}</span>
                    </button>
                </motion.div>
            )}

            {/* Background Image with Parallax & Suble Zoom */}
            <motion.div 
                style={{ y: y1, scale, backgroundImage: `url('${bgImage}')` }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            </motion.div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--footer)]/20 to-[var(--footer)]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
            
            <ParticleField count={15} color="#ffffff" />

            {/* Content */}
            <motion.div 
                style={{ opacity }}
                className="relative z-10 container mx-auto px-6 text-center pt-24 md:pt-32"
            >
                <Reveal direction="down" delay={0.2}>
                    {!isBack && badge && (
                        <span className="inline-block py-2.5 px-8 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-10 backdrop-blur-md shadow-2xl">
                            {badge}
                        </span>
                    )}
                </Reveal>

                <Reveal delay={0.4}>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
                        {title_part1} <br/>
                        <span className="text-[var(--primary)] italic drop-shadow-[0_0_15px_rgba(170,169,153,0.3)]">{title_part2}</span>
                    </h1>
                </Reveal>

                <Reveal delay={0.6}>
                    <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light italic tracking-wide">
                        {description}
                    </p>
                </Reveal>

                {/* Decorative element */}
                <Reveal delay={0.8}>
                    <Floating amplitude={5} duration={3}>
                        <div className="flex items-center justify-center gap-4 mt-16 scale-150 md:scale-100">
                            <span className="w-16 h-px bg-white/20" />
                            <span className="w-3 h-3 rounded-full bg-[var(--primary)] shadow-[0_0_20px_var(--primary)] animate-pulse" />
                            <span className="w-16 h-px bg-white/20" />
                        </div>
                    </Floating>
                </Reveal>
            </motion.div>
        </div>
    );
}