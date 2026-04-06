"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/public/layouts/Hero";
import { Calendar, Mail, Phone, CheckCircle } from "lucide-react";
import { getPublicTermsConditions } from "@/lib/api/public/terms-conditions";
import ContactSupportSection from "@/components/public/layouts/ContactSupportSection";
import { useTranslations } from "next-intl";
import { TermsConditionsData } from "@/types/public/terms-conditions";
import { toast } from "sonner";

export default function TermsConditions() {
    const [terms, setTerms] = useState<TermsConditionsData | null>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations("TermsConditionsPage");
    const h = useTranslations("TermsConditionsPage.hero");
    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const data = await getPublicTermsConditions(window.location.origin);
                if (data && data.content) { setTerms(data); }
            } catch (error) { toast.error(t("load_error")); } finally { setLoading(false); }
        };
        fetchTerms();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Hero
                badge={h("back")}
                title_part1={h("title_part1")}
                title_part2={h("title_accent")}
                description={h("subtitle")}
                bgImage="/images/default-images/hero/hero-terms-conditions.jpg"
            />

            <section className="py-12 md:py-20 relative z-10 -mt-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 md:p-12 border border-[#ece9e0]">
                            {/* Last Updated */}
                            <div className="flex items-center gap-2 text-[#7a7a68] mb-8 pb-6 border-b border-[#ece9e0]"><Calendar className="w-5 h-5 text-[var(--primary)]" /><span>{t("last_updated")} {terms?.updated_at?.toLocaleString()}</span></div>

                            {loading
                                ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>)
                                : terms
                                    ? (
                                        <div className="mb-12">
                                            <h1 className="text-3xl font-bold text-[var(--footer)] mb-6">{t("intro.title")}</h1>
                                            <p className="text-[#7a7a68] mb-6">{t("intro.description")}</p>
                                            <div className="prose prose-slate max-w-none text-[#7a7a68] leading-relaxed" dangerouslySetInnerHTML={{ __html: terms.content }} />
                                        </div>
                                    )
                                    : (<div className="mb-12"><h1 className="text-3xl font-bold text-[var(--footer)] mb-6">{t("nothing_to_display")}</h1></div>)
                            }

                            {/* Contact Information */}
                            <ContactSupportSection showHours={false} />

                            {/* Agreement */}
                            <div className="mt-12 pt-8 border-t border-[#ece9e0]">
                                <div className="text-center">
                                    <p className="text-[#7a7a68] mb-4">{t("agreement.p1")}</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-[#7a7a68]"><CheckCircle className="w-4 h-4 text-green-500" /><span>{t("agreement.effective")}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}