"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Search, Mail, Phone, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getPublicFAQs } from "@/lib/api/public/faq";
import { FAQItem } from "@/types/public/faq";
import { toast } from "sonner";
import Hero from "@/components/public/layouts/Hero";
import ContactSupportSection from "@/components/public/layouts/ContactSupportSection";

export default function FAQ() {
    const [openQuestions, setOpenQuestions] = useState<number[]>([0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations("FAQPage");
    const h = useTranslations("FAQPage.hero");

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const origin = window.location.origin;
                const data = await getPublicFAQs(origin);
                setFaqs(data || []);
            } catch (error) { toast.error("Failed to load FAQs"); } finally { setLoading(false); }
        };
        fetchFaqs();
    }, []);
    const toggleQuestion = (questionId: number) => { setOpenQuestions(prev => prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]); };
    const filteredFaqs = faqs.filter(faq => faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Hero
                badge={h("back")}
                title_part1={h("title_part1")}
                title_part2={h("title_accent")}
                description={h("subtitle")}
                bgImage="/images/default-images/hero/hero-faq.jpg"
            />

            <section className="py-12 md:py-20 relative z-10 -mt-20">
                <div className="container mx-auto px-6">
                    {/* Search Section */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-[#ece9e0] p-6 mb-12">
                        <div className="text-center max-w-2xl mx-auto">
                            <h1 className="text-3xl font-bold text-[var(--footer)] mb-4">{t("search.title")}</h1>
                            <p className="text-[#7a7a68] mb-6">{t("search.subtitle")}</p>
                            <div className="relative max-w-md mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]" />
                                <Input
                                    type="text"
                                    placeholder={t("search.placeholder")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[#ece9e0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-[var(--footer)] placeholder-[#7a7a68]/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* FAQ Content */}
                    <div className="max-w-7xl mx-auto">
                        {loading && (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>)}
                        {!loading && filteredFaqs.length > 0 && (
                            <div className="mb-12 space-y-12">
                                {Object.entries(
                                    filteredFaqs.reduce((acc, faq) => {
                                        const sectionName = faq.faq_sections?.title || t("general_section", { defaultMessage: "General FAQ" });
                                        if (!acc[sectionName]) acc[sectionName] = [];
                                        acc[sectionName].push(faq);
                                        return acc;
                                    }, {} as Record<string, FAQItem[]>)
                                ).map(([section, items]) => (
                                    <div key={section} className="space-y-4">
                                        <h2 className="text-2xl font-bold text-[var(--footer)] pb-2">{section}</h2>
                                        {items.map((faq, index) => (
                                            <div key={faq.id || index} className="bg-white rounded-xl shadow-md border border-[#ece9e0] overflow-hidden transition-all duration-300 hover:shadow-lg">
                                                <button onClick={() => toggleQuestion(faq.id || index)} className="w-full text-left p-6 flex items-center justify-between hover:bg-[#ece9e0]/30 transition-colors">
                                                    <h3 className="font-semibold text-[var(--footer)] text-lg pr-4">{faq.question}</h3>
                                                    <ChevronDown className={`w-5 h-5 text-[#7a7a68] shrink-0 transition-transform duration-300 ${openQuestions.includes(faq.id || index) ? 'rotate-180' : ''}`} />
                                                </button>
                                                <div className={`overflow-hidden transition-all duration-300 ${openQuestions.includes(faq.id || index) ? 'max-h-96' : 'max-h-0'}`}>
                                                    <div className="px-6 pb-6 text-[#7a7a68] leading-relaxed max-w-none prose prose-sm prose-slate" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && filteredFaqs.length === 0 && (
                            <div className="text-center py-12">
                                <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#ece9e0]">
                                    <h3 className="text-xl font-semibold text-[var(--footer)] mb-2">{t("not_found.title")}</h3>
                                    <p className="text-[#7a7a68] mb-6">{t("not_found.subtitle")}</p>
                                    <Button
                                        onClick={() => setSearchTerm("")}
                                        className="bg-[var(--primary)] hover:bg-[#3a3a2e] text-white px-6 py-2 rounded-lg"
                                    >
                                        {t("not_found.clear")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Still Need Help */}
                    <div className="max-w-7xl mx-auto mt-16">
                        <ContactSupportSection />
                    </div>
                </div>
            </section>
        </div>
    );
}