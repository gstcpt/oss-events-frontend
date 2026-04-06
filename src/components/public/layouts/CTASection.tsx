import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function CTASection() {
    const t = useTranslations("Home.cta");
    return (
        <section className="py-24 relative overflow-hidden bg-[#363535]">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-[var(--primary)]/5 rounded-full blur-[120px]" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 text-white border border-white/10 mb-8 backdrop-blur-md animate-fade-in-up">
                    <Sparkles size={16} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t("badge")}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight animate-fade-in-up delay-100">
                    {t("title")} <span className="text-[var(--primary)]">{t("title_accent")}</span> {t("title_part2")}
                </h2>
                <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                    {t("subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-300">
                    <Link
                        href="/createEvent"
                        className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-[var(--primary)] text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-2xl shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/40 hover:-translate-y-1 transition-all duration-300"
                    >
                        {t("create")}
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/about"
                        className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                    >
                        {t("learn_more")}
                    </Link>
                </div>
            </div>
        </section>
    );
}