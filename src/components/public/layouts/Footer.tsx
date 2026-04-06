"use client";

import NextLink from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Send, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { submitNewsletter } from "@/lib/api/public/home";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCompany } from "@/context/CompanyContext";
import { getCompanyByIdPublic } from "@/lib/api/companies";

export default function Footer() {
    const t = useTranslations("Footer");
    const tNav = useTranslations("Navigation");
    const { companyId } = useCompany();
    const currentYear = new Date().getFullYear();
    const [newsletterEmail, setNewsletterEmail] = useState<string>("");
    const [socialLinks, setSocialLinks] = useState<{ facebook?: string; instagram?: string; linkedin?: string; twitter?: string; youtube?: string; tiktok?: string; }>({});

    useEffect(() => {
        if (!companyId) return;
        getCompanyByIdPublic(Number(companyId)).then((company: any) => {
            if (company) {
                setSocialLinks({
                    facebook: company.facebook || undefined,
                    instagram: company.instagram || undefined,
                    linkedin: company.linkedin || undefined,
                    twitter: company.twitter || undefined,
                    youtube: company.youtube || undefined,
                    tiktok: company.tiktok || undefined,
                });
            }
        }).catch(() => {});
    }, [companyId]);
    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        try {
            const response = await submitNewsletter(newsletterEmail);
            if (response.success) {
                setNewsletterEmail("");
                toast.success(t("newsletter.success_toast"));
            }
        } catch (error: any) { toast.error(t("newsletter.failed")); }
    };

    return (
        <footer className="bg-[#363535] text-white pt-24 pb-0 relative overflow-hidden w-full">
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16">
                    {/* Brand Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <NextLink href="/" className="inline-block"><Image src={`/images/companies/${companyId}/logo.png`} alt="Logo" width={140} height={40} className="brightness-0 invert h-10 w-auto" /></NextLink>
                        <p className="text-white/60 text-base leading-relaxed max-w-sm">{t("about_text")}</p>
                        <div className="flex gap-3 flex-wrap">
                            {socialLinks.facebook && (
                                <NextLink href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 transition-all duration-300" aria-label="Facebook">
                                    <Facebook size={18} />
                                </NextLink>
                            )}
                            {socialLinks.instagram && (
                                <NextLink href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-pink-600 hover:border-pink-600 hover:-translate-y-1 transition-all duration-300" aria-label="Instagram">
                                    <Instagram size={18} />
                                </NextLink>
                            )}
                            {socialLinks.linkedin && (
                                <NextLink href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-blue-700 hover:border-blue-700 hover:-translate-y-1 transition-all duration-300" aria-label="LinkedIn">
                                    <Linkedin size={18} />
                                </NextLink>
                            )}
                            {socialLinks.twitter && (
                                <NextLink href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:-translate-y-1 transition-all duration-300" aria-label="X / Twitter">
                                    <Twitter size={18} />
                                </NextLink>
                            )}
                            {socialLinks.youtube && (
                                <NextLink href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-red-600 hover:border-red-600 hover:-translate-y-1 transition-all duration-300" aria-label="YouTube">
                                    <Youtube size={18} />
                                </NextLink>
                            )}
                            {socialLinks.tiktok && (
                                <NextLink href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#3a3a2e] hover:border-[#3a3a2e] hover:-translate-y-1 transition-all duration-300" aria-label="TikTok">
                                    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.13a8.16 8.16 0 004.77 1.52V7.18a4.85 4.85 0 01-1-.49z"/></svg>
                                </NextLink>
                            )}
                            {/* Fallback: show placeholder icons if no social links configured */}
                            {!socialLinks.facebook && !socialLinks.instagram && !socialLinks.linkedin && !socialLinks.twitter && (
                                [Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                                    <span key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 cursor-default">
                                        <Icon size={18} />
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                    {/* Quick Links */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-white text-[11px] font-bold tracking-[0.2em]">{t("explore")}</h3>
                        <ul className="space-y-4">
                            {[{ name: tNav("home"), href: "/" }, { name: tNav("about"), href: "/about" }, { name: tNav("services"), href: "/items" }, { name: tNav("blog"), href: "/blogs" }].map((link) => (
                                <li key={link.name}>
                                    <NextLink href={link.href} className="text-white/60 hover:text-[var(--primary)] transition-colors text-sm font-medium flex items-center gap-2 group">
                                        <div className="w-1 h-1 rounded-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />{link.name}
                                    </NextLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Resources */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-white text-[11px] font-bold tracking-[0.2em]">{t("for_you")}</h3>
                        <ul className="space-y-4">
                            {[{ name: tNav("create_event"), href: "/createEvent" }, { name: tNav("categories"), href: "/categories" }, { name: tNav("providers"), href: "/providers" }, { name: tNav("contact"), href: "/contact" }].map((link) => (
                                <li key={link.name}>
                                    <NextLink href={link.href} className="text-white/60 hover:text-[var(--primary)] transition-colors text-sm font-medium flex items-center gap-2 group">
                                        <div className="w-1 h-1 rounded-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />{link.name}
                                    </NextLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Newsletter */}
                    <div className="lg:col-span-4 space-y-8">
                        <h3 className="text-white text-[11px] font-bold tracking-[0.2em]">{t("newsletter.title")}</h3>
                        <p className="text-white/60 text-sm leading-relaxed">{t("newsletter.placeholder")}</p>
                        <form onSubmit={handleNewsletterSubmit} className="relative group">
                            <Input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Email address"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-xs h-14 rounded-full pl-6 pr-16 focus:bg-white/10 transition-all border-none ring-1 ring-white/10 focus:ring-white/20"
                            />
                            <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:bg-[var(--primary)]/90 transition-all active:scale-90 shadow-lg shadow-[var(--primary)]/20"><Send size={16} /></button>
                        </form>
                    </div>
                </div>
            </div>
            {/* Copyright Section */}
            <div className="py-10 w-full border-t border-white/5 bg-[#2d2d2d]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/40 text-[11px] font-bold tracking-widest">&copy; {currentYear} OSS Events. {t("rights")}</p>
                    <div className="flex gap-8">
                        <NextLink href="/privacy-policy" className="text-white/40 hover:text-white transition-colors text-[11px] font-bold tracking-widest">{t("privacy")}</NextLink>
                        <NextLink href="/terms-conditions" className="text-white/40 hover:text-white transition-colors text-[11px] font-bold tracking-widest">{t("terms")}</NextLink>
                        <NextLink href="/faq" className="text-white/40 hover:text-white transition-colors text-[11px] font-bold tracking-widest">{t("faq")}</NextLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}