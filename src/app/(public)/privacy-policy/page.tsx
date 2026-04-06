"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/public/layouts/Hero";
import { Shield, FileText, Calendar, Mail, Phone, Lock, User, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { getPublicPrivacyPolicy } from "@/lib/api/public/privacy-policy";
import ContactSupportSection from "@/components/public/layouts/ContactSupportSection";
import { PrivacyPolicyData } from "@/types/public/privacy-policy";
import { toast } from "sonner";

export default function PrivacyPolicy() {
    const t = useTranslations("PrivacyPolicyPage");
    const h = useTranslations("PrivacyPolicyPage.hero");
    const [policy, setPolicy] = useState<PrivacyPolicyData | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const data = await getPublicPrivacyPolicy(window.location.origin);
                if (data && data.content) { setPolicy(data); }
            } catch (error) { toast.error("Failed to load Privacy Policy"); } finally { setLoading(false); }
        };
        fetchPolicy();
    }, []);
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Hero 
                badge={h("back")} 
                title_part1={h("title_part1")} 
                title_part2={h("title_accent")} 
                description={h("subtitle")} 
                bgImage="/images/default-images/hero/hero-privacy.jpg" 
            />
            <section className="py-12 md:py-20 relative z-10 -mt-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 md:p-12 border border-[#ece9e0]">
                            {/* Last Updated */}
                            <div className="flex items-center gap-2 text-[#7a7a68] mb-8 pb-6 border-b border-[#ece9e0]"><Calendar className="w-5 h-5 text-[var(--primary)]" /><span>{t("last_updated")} {policy?.updated_at?.toLocaleString()}</span></div>
                            {loading
                                ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>)
                                : policy
                                    ? (
                                        <div className="mb-12">
                                            <h1 className="text-3xl font-bold text-[var(--footer)] mb-6">{t("intro.title")}</h1>
                                            <p className="text-[#7a7a68] mb-6">{t("intro.description")}</p>
                                            <div className="prose prose-slate max-w-none text-[#7a7a68] leading-relaxed" dangerouslySetInnerHTML={{ __html: policy.content }} />
                                        </div>
                                    )
                                    : (<div className="mb-12"><h1 className="text-3xl font-bold text-[var(--footer)] mb-6">{t("nothing_to_display")}</h1></div>)
                            }

                            {/* Contact Information */}
                            <ContactSupportSection showHours={false} />

                            {/* Policy Changes */}
                            <div className="mt-12 pt-8 border-t border-[#ece9e0]">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-[var(--primary)] mt-0.5 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-[var(--footer)] mb-2">{t("updates.title")}</h3>
                                        <p className="text-[#7a7a68]">{t("updates.p1")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
