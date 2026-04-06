"use client";
import Hero from "@/components/public/layouts/Hero";
import { MessageSquare, Mail, Phone, MapPin, Building2, Send, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { sendMessageContact, MessageContact } from "@/lib/api/messages";
import { getPublicContact } from "@/lib/api/public/contact";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { TiltCard, Reveal, Stagger, StaggerItem, Floating, ParticleField, ScrollProgressBar, Magnetic } from "@/components/ui/Motion3D";

const Map = dynamic(() => import("@/components/public/layouts/Map"), {
    ssr: false,
    loading: () => <div className="w-full h-[500px] bg-[#ece9e0] rounded-2xl animate-pulse shadow-inner" />,
});

export default function Contact() {
    const t = useTranslations("ContactPage.form");
    const h = useTranslations("ContactPage.hero");
    const { user } = useAuth();
    const [company, setCompany] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<MessageContact>({
        source: "Contact", email: "", sender_id: 0, receiver_id: 0, name: "", phone: "", subject: "", message: "",
        status_for_sender: 0, status_for_receiver: 0, company_id: 0
    });

    useEffect(() => {
        const fetchCompany = async () => {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const companyData = await getPublicContact(origin);
            setCompany(companyData);
            if (companyData) setFormData(prev => ({ ...prev, receiver_id: companyData.admin_id, company_id: companyData.id }));
        };
        fetchCompany();
    }, []);

    useEffect(() => {
        if (user) setFormData(prev => ({ ...prev, sender_id: user.id, email: user.email, name: `${user.firstname} ${user.lastname}` }));
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await sendMessageContact(formData);
            toast.success(t("success"));
            setFormData(prev => ({ ...prev, subject: "", message: "" }));
        } catch (error: any) {
            toast.error(error.message || t("error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const infoItems = [
        { icon: Mail, label: "Email", value: company?.email || "hello@axia-events.com", href: `mailto:${company?.email}` },
        { icon: Phone, label: "Support", value: company?.tel || "+216 73 000 000", href: `tel:${company?.tel}` },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <ScrollProgressBar />

            <Hero
                badge={h("badge")}
                title_part1={h("title_part1")}
                title_part2={h("title_accent")}
                description={h("description")}
                bgImage="/images/default-images/hero/hero-contact.jpg"
            />

            <div className="container mx-auto px-6 -mt-16 relative z-20 pb-32">
                <div className="grid lg:grid-cols-2 gap-8 items-stretch">

                    {/* ── LEFT: FORM ── */}
                    <Reveal direction="right">
                        <TiltCard intensity={4} className="h-full">
                            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-[#ece9e0] relative overflow-hidden group flex flex-col h-full">
                                <ParticleField count={8} color="var(--primary)" />
                                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[var(--primary)]/5 to-transparent rounded-full -mr-48 -mt-48" />

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-center gap-6 mb-12">
                                        <Floating amplitude={6} duration={3.5}>
                                            <div className="w-20 h-20 bg-gradient-to-br from-[var(--footer)] to-[var(--primary)] text-white rounded-2xl flex items-center justify-center shadow-2xl">
                                                <MessageSquare className="w-10 h-10" />
                                            </div>
                                        </Floating>
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.4em] mb-2">{t("title")}</p>
                                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--footer)] tracking-tighter leading-none">{t("subtitle")}</h2>
                                        </div>
                                    </div>

                                    <form className="space-y-7" onSubmit={handleSubmit}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[
                                                { id: "name", label: t("name"), placeholder: t("name_placeholder"), type: "text", required: true, value: formData.name },
                                                { id: "subject", label: t("subject"), placeholder: t("subject_placeholder"), type: "text", required: true, value: formData.subject },
                                            ].map(f => (
                                                <motion.div key={f.id} className="space-y-3" whileFocus={{ scale: 1.01 }}>
                                                    <label htmlFor={f.id} className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-[0.2em] ml-4">{f.label}</label>
                                                    <Input type={f.type} id={f.id} value={f.value} onChange={handleChange} placeholder={f.placeholder}
                                                        className="w-full px-6 py-4 h-14 rounded-2xl border-[#ece9e0] bg-[var(--background)]/40 focus:bg-white focus:ring-8 focus:ring-[var(--primary)]/10 transition-all text-[var(--footer)] placeholder-[#7a7a68]/40 text-sm font-bold" required={f.required} />
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[
                                                { id: "email", label: t("email"), placeholder: t("email_placeholder"), type: "email", required: true, value: formData.email },
                                                { id: "phone", label: t("phone"), placeholder: t("phone_placeholder"), type: "tel", required: false, value: formData.phone },
                                            ].map(f => (
                                                <div key={f.id} className="space-y-3">
                                                    <label htmlFor={f.id} className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-[0.2em] ml-4">{f.label}</label>
                                                    <Input type={f.type} id={f.id} value={f.value} onChange={handleChange} placeholder={f.placeholder}
                                                        className="w-full px-6 py-4 h-14 rounded-2xl border-[#ece9e0] bg-[var(--background)]/40 focus:bg-white focus:ring-8 focus:ring-[var(--primary)]/10 transition-all text-[var(--footer)] placeholder-[#7a7a68]/40 text-sm font-bold" required={f.required} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            <label htmlFor="message" className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-[0.2em] ml-4">{t("message")}</label>
                                            <textarea
                                                id="message" rows={5} value={formData.message} onChange={handleChange}
                                                placeholder={t("message_placeholder")}
                                                className="w-full px-6 py-4 rounded-2xl border border-[#ece9e0] bg-[var(--background)]/40 focus:bg-white focus:outline-none focus:ring-8 focus:ring-[var(--primary)]/10 transition-all text-[var(--footer)] placeholder-[#7a7a68]/40 text-sm font-bold resize-none"
                                                required
                                            />
                                        </div>
                                        <Magnetic strength={0.2}>
                                            <motion.button
                                                type="submit"
                                                disabled={isSubmitting}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full h-14 bg-gradient-to-r from-[var(--footer)] to-[var(--primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-4 justify-center transition-all duration-500 disabled:opacity-60"
                                            >
                                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                    <>
                                                        <Send className="w-5 h-5" /> {t("submit")}
                                                    </>
                                                )}
                                            </motion.button>
                                        </Magnetic>
                                    </form>
                                </div>
                            </div>
                        </TiltCard>
                    </Reveal>

                    {/* ── RIGHT: INFO + MAP ── */}
                    <Reveal direction="left" delay={0.12}>
                        <div className="flex flex-col gap-8 h-full">
                            {/* Company Info Card */}
                            <TiltCard intensity={5}>
                                <div className="flex-1 bg-white rounded-2xl p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-[#ece9e0] relative overflow-hidden group">
                                    <ParticleField count={6} color="var(--primary)" />
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)]/10 to-transparent rounded-full -mr-32 -mt-32" />

                                    <div className="relative z-10 space-y-8">
                                        {/* Header */}
                                        <div className="flex items-center gap-6">
                                            <Floating amplitude={5} duration={3}>
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[var(--background)] border border-[#ece9e0] p-4 flex items-center justify-center shadow-inner">
                                                    {company?.logo
                                                        ? <img src={company.logo} alt={company.title} className="max-w-full max-h-full object-contain" />
                                                        : <Building2 className="w-12 h-12 text-[var(--primary)]" />
                                                    }
                                                </div>
                                            </Floating>
                                            <div>
                                                <h3 className="text-2xl font-bold text-[var(--footer)] tracking-tighter">{company?.title || "Axia Events"}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                                                    <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em]">{company?.domain || "Event Planning"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statement */}
                                        <div className="p-6 bg-[var(--background)] rounded-xl border border-[#ece9e0] italic text-[#7a7a68] text-base font-bold leading-relaxed relative shadow-inner">
                                            <div className="absolute -top-3 left-8 px-4 py-1 bg-white text-[9px] font-bold text-[var(--primary)] uppercase tracking-[0.3em] border border-[#ece9e0] rounded-full shadow-sm">Statement</div>
                                            "{company?.contact || company?.description || "Excellence is not an act, but a habit. We curate experiences that last a lifetime."}"
                                        </div>

                                        {/* Contact info */}
                                        <Stagger staggerDelay={0.1} className="grid sm:grid-cols-2 gap-5">
                                            {infoItems.map((item, i) => (
                                                <StaggerItem key={i}>
                                                    <motion.a href={item.href} whileHover={{ x: 4 }} className="flex items-center gap-4 group/item cursor-pointer">
                                                        <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[#ece9e0] flex items-center justify-center shrink-0 group-hover/item:bg-[var(--primary)] group-hover/item:text-white transition-all duration-500 shadow-sm">
                                                            <item.icon className="w-5 h-5 text-[var(--footer)] group-hover/item:text-white transition-colors" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-bold text-[#7a7a68] uppercase tracking-[0.3em] mb-1">{item.label}</p>
                                                            <p className="text-[var(--footer)] font-bold text-sm truncate group-hover/item:text-[var(--primary)] transition-colors">{item.value}</p>
                                                        </div>
                                                    </motion.a>
                                                </StaggerItem>
                                            ))}
                                        </Stagger>

                                        {/* Address */}
                                        <div className="flex items-start gap-4 pt-4 border-t border-[#ece9e0]">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[#ece9e0] flex items-center justify-center shrink-0 shadow-sm">
                                                <MapPin className="w-5 h-5 text-[var(--footer)]" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-[#7a7a68] uppercase tracking-[0.3em] mb-1">Location</p>
                                                <p className="text-[var(--footer)] font-bold text-sm">
                                                    {company?.address || "Innovation District, Sousse"}
                                                    <span className="block text-[10px] text-[#7a7a68] font-bold mt-1 uppercase tracking-wider">
                                                        {company?.municipalities?.name}, {company?.governorates?.name}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Map */}
                            <div className="bg-white p-6 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-[#ece9e0] overflow-hidden group/map relative flex-1 min-h-[340px]">
                                <div className="absolute top-8 left-8 z-10 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-[#ece9e0] text-[9px] font-bold text-[var(--footer)] uppercase tracking-[0.3em]">Visit Our Office</div>
                                <motion.div
                                    className="rounded-xl overflow-hidden h-full shadow-inner"
                                    initial={{ filter: "grayscale(100%)" }}
                                    whileHover={{ filter: "grayscale(0%)" }}
                                    transition={{ duration: 1.5 }}
                                >
                                    <Map
                                        locationName={company?.title}
                                        address={company?.address}
                                        municipality={company?.municipalities?.name}
                                        governorate={company?.governorates?.name}
                                        country={company?.countries?.name}
                                        zipCode={company?.municipalities?.code}
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
}
