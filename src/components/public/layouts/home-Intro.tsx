"use client";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function HeroHome() {
    const t = useTranslations('Home');
    return (
        <section
            className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden z-20"
            style={{ clipPath: "url(#hero-mask)" }}
        >
            <svg width="0" height="0" className="absolute">
                <defs>
                    <clipPath id="hero-mask" clipPathUnits="objectBoundingBox">
                        {/* Creates a smooth concave curve (hill) at the bottom mapping the exact mockup geometry */}
                        <path d="M 0,0 L 1,0 L 1,1 Q 0.5,0.85 0,1 Z" />
                    </clipPath>
                </defs>
            </svg>

            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105" style={{ backgroundImage: "url('/images/home-hero.jpg')" }}></div>
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 pb-[10vh]">
                <h1 className="text-5xl md:text-6xl lg:text-[70px] font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    {t('hero.title_part1')} {t('hero.title_accent')} {t('hero.title_part2')}
                </h1>
                <p className="text-lg md:text-2xl text-white mb-10 max-w-3xl mx-auto font-normal leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    {t('hero.subtitle')}
                </p>
                <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/categories" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto min-w-[220px] h-[52px] bg-white !text-[#4A4A4A] hover:text-[var(--primary)] font-semibold text-[14px] rounded-full hover:-translate-y-1 transition-all hover:shadow-2xl hover:bg-[#FAFAFA] active:scale-95 flex items-center justify-center">
                                <span>{t('hero.explore_categories')}</span>
                            </Button>
                        </Link>
                        <Link href="/auth/register" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto min-w-[220px] h-[52px] bg-transparent border-2 border-white !text-white font-semibold text-[14px] rounded-full hover:-translate-y-1 transition-all hover:bg-white/10 hover:border-white/90 shadow-inner active:scale-95 flex items-center justify-center">
                                <span>{t('hero.become_provider')}</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}