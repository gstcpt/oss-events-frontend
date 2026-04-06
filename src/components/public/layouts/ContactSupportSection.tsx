"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useCompany } from "@/context/CompanyContext";
import { getPublicCompany, CompanyInfo } from "@/lib/api/public/company";
import Link from "next/link";

interface ContactSupportSectionProps {
    className?: string;
    showHours?: boolean;
}

export default function ContactSupportSection({ className = "", showHours = true }: ContactSupportSectionProps) {
    const t = useTranslations("FAQPage.contact_support");
    const { companyId } = useCompany();
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                if (companyId) {
                    const data = await getPublicCompany(companyId);
                    setCompany(data);
                }
            } catch (error) {
                console.error("Failed to load company info:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [companyId]);

    const email = company?.email || "support@axia-events.com";
    const phone = company?.phone_number || "+216 20 000 000";

    return (
        <div className={`bg-[var(--background)] rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#ece9e0] ${className}`}>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--footer)] mb-4">{t("title")}</h2>
                <p className="text-[#7a7a68] mb-8">{t("subtitle")}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Email */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ece9e0] hover:shadow-md transition-shadow flex flex-col items-center">
                        <Mail className="w-8 h-8 text-[var(--primary)] mb-3" />
                        <h3 className="font-semibold text-[var(--footer)] mb-2">{t("email_title")}</h3>
                        <p className="text-[#7a7a68] text-sm mb-4 truncate w-full px-2" title={email}>{email}</p>
                        <Link href={`mailto:${email}`} className="mt-auto w-full">
                            <Button className="w-full bg-[var(--primary)] hover:bg-[#3a3a2e] text-white py-2 rounded-lg text-sm">
                                {t("email_btn")}
                            </Button>
                        </Link>
                    </div>

                    {/* Phone */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ece9e0] hover:shadow-md transition-shadow flex flex-col items-center">
                        <Phone className="w-8 h-8 text-[var(--primary)] mb-3" />
                        <h3 className="font-semibold text-[var(--footer)] mb-2">{t("phone_title")}</h3>
                        <p className="text-[#7a7a68] text-sm mb-4">{phone}</p>
                        <Link href={`tel:${phone}`} className="mt-auto w-full">
                            <Button className="w-full bg-[var(--primary)] hover:bg-[#3a3a2e] text-white py-2 rounded-lg text-sm">
                                {t("phone_btn")}
                            </Button>
                        </Link>
                    </div>

                    {/* Chat/Support */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ece9e0] hover:shadow-md transition-shadow flex flex-col items-center">
                        <MessageCircle className="w-8 h-8 text-[var(--primary)] mb-3" />
                        <h3 className="font-semibold text-[var(--footer)] mb-2">{t("chat_title")}</h3>
                        <p className="text-[#7a7a68] text-sm mb-4">{t("chat_subtitle")}</p>
                        <Link href="/contact" className="mt-auto w-full">
                            <Button className="w-full bg-[var(--primary)] hover:bg-[#3a3a2e] text-white py-2 rounded-lg text-sm">
                                {t("chat_btn")}
                            </Button>
                        </Link>
                    </div>
                </div>

                {showHours && (
                    <div className="mt-8 pt-6 border-t border-[#ece9e0]">
                        <p className="text-[#7a7a68] text-sm">
                            <strong className="text-[var(--footer)]">{t("hours")}</strong> {t("hours_value")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
