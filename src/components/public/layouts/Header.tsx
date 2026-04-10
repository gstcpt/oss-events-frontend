"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X, User, Calendar, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import LocaleSwitcher from "@/app/LocaleSwitcher";
import { useCompany } from "@/context/CompanyContext";

export default function Header() {
    const t = useTranslations("Navigation");
    const { user, logout } = useAuth();
    const locale = useLocale();
    const { companyId } = useCompany();
    const [open, setOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Strip locale prefix (/fr, /ar, /en) before matching paths
    const rawPath = pathname.replace(/^\/(fr|ar|en)(\/|$)/, "/") || "/";

    // Pages with hero background image → transparent header at top, white on scroll
    const isHeroPage = ["/", "/about", "/categories", "/items", "/providers", "/blogs", "/contact", "/createEvent", "/faq", "/privacy-policy", "/terms-conditions"].includes(rawPath) 
        || rawPath.startsWith("/items/") 
        || rawPath.startsWith("/blogs/")
        || rawPath.startsWith("/providers/");

    // Pages with NO hero image → always solid white header, never transparent
    const noHeroPages = ["/login", "/register", "/forget-password", "/new-password", "/verify-email"];
    const isAlwaysSolid = noHeroPages.includes(rawPath) || (rawPath === "/createEvent" && !user);

    const isTransparent = isHeroPage && !isAlwaysSolid && !modalOpen && !scrolled;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // Watch for LoginModal open/close via body attribute
        const observer = new MutationObserver(() => { setModalOpen(document.body.hasAttribute("data-modal-open")); });
        observer.observe(document.body, { attributes: true, attributeFilter: ["data-modal-open"] });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, []);

    const navLinks = [
        { name: t("home"), href: "/" },
        { name: t("about"), href: "/about" },
        { name: t("categories"), href: "/categories" },
        { name: t("services"), href: "/items" },
        { name: t("providers"), href: "/providers" },
        { name: t("blog"), href: "/blogs" },
        { name: t("contact"), href: "/contact" },
    ];

    return (
        <nav className={`fixed w-full z-40 transition-all duration-100 ${!isTransparent ? "bg-white shadow-md py-2" : "bg-gradient-to-b from-black/80 via-black/50 to-transparent py-4 text-white"}`}>
            {/* Main nav bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4 pt-4">

                    {/* ── Logo ── */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                        <Image src={`/images/companies/${companyId}/logo.png`} alt="OSS Events" width={110} height={48} style={{ width: 'auto' }} className={`h-12 w-auto object-contain transition-all duration-100 ${!isTransparent ? "brightness-0 opacity-80" : "brightness-0 invert opacity-100"}`} priority />
                    </Link>

                    {/* ── Desktop Nav Links (Centered) ── */}
                    <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.name} href={link.href} className={
                                    `relative py-1 text-sm font-semibold transition-all duration-100 group ${isActive
                                        ? isTransparent
                                            ? "text-white"
                                            : "text-[#1a1a1a] font-bold"
                                        : isTransparent
                                            ? "text-white/95 hover:text-white"
                                            : "text-[#1a1a1a]/80 hover:text-[#1a1a1a]"
                                    }`
                                }>
                                    {link.name}
                                    <span className={
                                        `absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--primary)] rounded-full transition-all duration-100 ${isActive
                                            ? "opacity-100 scale-100"
                                            : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100"
                                        }`
                                    } />
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Right Actions ── */}
                    <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <LocaleSwitcher isTransparent={isTransparent} changeLocaleAction={async (newLocale) => {
                                document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
                                window.location.reload();
                            }} />
                        </div>

                        {/* Calendar icon */}
                        <Link href="/createEvent" className={`flex items-center justify-center transition-all duration-100 ${isTransparent ? "text-white/90 hover:text-white" : "text-[#1a1a1a] hover:text-[var(--primary)]"}`}>
                            <Calendar size={20} strokeWidth={2} />
                        </Link>

                        {/* Auth button */}
                        {!user ? (
                            <Link href="/login" className={
                                `px-6 py-2 text-sm font-semibold rounded-full border transition-all duration-100 active:scale-95 flex items-center justify-center ${isTransparent
                                    ? "bg-transparent border-white text-white hover:bg-white/10"
                                    : "bg-transparent border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a]/5"
                                }`
                            }>{t("signin")}</Link>
                        ) : (
                            <div className="relative">
                                <Button onClick={() => setOpen(!open)} className={
                                    `flex items-center gap-3 py-3 px-6 rounded-full shadow-lg transition-all ${isTransparent
                                        ? 'bg-white/20 text-white hover:bg-white/30 border border-white/50'
                                        : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
                                    }`
                                }>
                                    <User size={18} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{user.role === 'admin' ? 'ADMIN' : user.firstname}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
                                </Button>
                                {open && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                                        <div className="absolute text-[#1a1a1a] right-0 mt-4 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden py-2">
                                            <div className="px-5 py-3 border-b border-slate-100 mb-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 leading-none text-slate-500">{t("logged_in_as")}</p>
                                                <p className="text-sm font-bold truncate">{user.firstname} {user.lastname}</p>
                                            </div>
                                            <Link href="/dashboard" onClick={() => setOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 text-[10px] font-bold hover:bg-slate-50 hover:text-[var(--primary)] transition-colors uppercase tracking-widest"
                                            >
                                                <User size={14} /> {t("dashboard")}
                                            </Link>
                                            <button onClick={() => { setOpen(false); logout(); }}
                                                className="flex w-full items-center gap-3 text-left px-5 py-3 text-[10px] font-bold hover:text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest"
                                            >
                                                <X size={14} /> {t("logout")}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <div className="md:hidden">
                        <Button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`p-2 rounded-md transition-colors ${isTransparent
                                ? "text-white hover:bg-white/15"
                                : "text-[#1a1a1a] hover:bg-slate-100 hover:text-[var(--primary)]"
                                }`}
                            variant="ghost"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* FULL WIDTH SEPARATOR */}
            <div className={`mt-4 border-b transition-all duration-100 ${isTransparent ? "border-white/30" : "border-gray-100/50"}`} />

            {/* ── Mobile Menu ── */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-xl">
                    <div className="px-5 py-6 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`block py-3 px-4 rounded-lg text-base font-semibold transition-colors ${pathname === link.href
                                    ? "text-[var(--primary)] bg-[var(--primary)]/5"
                                    : "text-[#1a1a1a] hover:text-[var(--primary)] hover:bg-slate-100"
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr className="!my-4 border-slate-200" />
                        <Link
                            href="/createEvent"
                            className="flex items-center gap-3 py-3 px-4 rounded-lg text-base font-semibold text-[#1a1a1a] hover:text-[var(--primary)] hover:bg-slate-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Calendar size={18} />
                            <span>{t("create_event")}</span>
                        </Link>
                        {!user ? (
                            <Link
                                href="/login"
                                className="block w-full text-center mt-4 px-5 py-3 border-2 border-[var(--primary)] rounded-full text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t("signin")}
                            </Link>
                        ) : (
                            <div className="space-y-1 pt-2">
                                <Link href="/dashboard" className="block py-3 px-4 rounded-lg text-base font-semibold text-[#1a1a1a] hover:text-[var(--primary)] hover:bg-slate-100 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                    {t("dashboard")}
                                </Link>
                                <Link href="#" className="block py-3 px-4 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50 transition-colors" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                                    {t("logout")}
                                </Link>
                            </div>
                        )}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("language")}</span>
                            <LocaleSwitcher
                                isTransparent={false}
                                changeLocaleAction={async (newLocale) => {
                                    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
                                    window.location.reload();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}