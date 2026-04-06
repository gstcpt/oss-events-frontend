"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

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

    return (
        <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* ── FLOAT BACK BUTTON ── */}
            {isBack && (
                <div className="absolute top-28 left-6 md:left-12 z-50">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full text-white hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-500 shadow-2xl active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t("back")}</span>
                    </button>
                </div>
            )}

            {/* Background Image */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: `url('${bgImage}')` }}></div>

            {/* Overlays/Masks */}
            <div className="absolute inset-0 bg-footer/60 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-linear-to-b from-footer/40 via-transparent to-background"></div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center pt-24 md:pt-32">
                {!isBack && badge && (
                    <span className="inline-block py-2 px-6 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md animate-fade-in-up">
                        {badge}
                    </span>
                )}
                <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up tracking-tight leading-tight">
                    {title_part1} <span className="text-[var(--primary)]">{title_part2}</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100 font-light italic">
                    {description}
                </p>

                {/* Decorative element like in the design */}
                <div className="flex items-center justify-center gap-3 mt-12 animate-fade-in delay-200">
                    <span className="w-12 h-px bg-[var(--primary)]/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_15px_var(--primary)]" />
                    <span className="w-12 h-px bg-[var(--primary)]/30" />
                </div>
            </div>
        </div>
    );
}