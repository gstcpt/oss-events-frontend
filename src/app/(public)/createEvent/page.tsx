"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar as CalendarIcon, DollarSign, CheckCircle, Trash2, Plus, AlertCircle, Save, User as UserIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { useEventCart } from "@/context/EventCartContext";
import { useAuth } from "@/context/AuthContext";
import { createComplexEvent } from "@/lib/api/events";
import { toast } from "sonner";
import { LoginModal } from "@/components/LoginModal";
import { useTranslations } from "next-intl";
import Hero from "@/components/public/layouts/Hero";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, Stagger, StaggerItem, TiltCard, Floating, ParticleField, ScrollProgressBar, Magnetic } from "@/components/ui/Motion3D";

export default function CreateEventPage() {
    const t = useTranslations('CreateEventPage');
    const h = useTranslations('CreateEventPage.hero');
    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, removeFromCart, clearCart, updateItemDates } = useEventCart();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Wedding");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [guestCount, setGuestCount] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const eventCategories = ["Wedding", "Marriage", "Party", "Work", "Opening", "Fun"];

    const getPrice = (item: any): number => {
        if (!item.price) return 0;
        if (typeof item.price === 'number') return item.price;
        if (typeof item.price === 'string') return Number(item.price) || 0;
        if (typeof item.price === 'object') { const d = item.price.d; if (Array.isArray(d) && d.length > 0) return Number(d[0]) || 0; }
        return 0;
    };

    const calculateTotal = () => cartItems.reduce((acc, { item }) => acc + getPrice(item), 0);

    const handleSave = async () => {
        if (!user) { toast.error(t('login_required')); return; }
        if (!title) { toast.error(t('title_required')); return; }
        if (!startDate || !endDate) { toast.error(t('dates_required')); return; }
        if (new Date(startDate) >= new Date(endDate)) { toast.error(t('end_after_start')); return; }
        if (cartItems.length === 0) { toast.error(t('services_required')); return; }
        setIsSubmitting(true);
        try {
            const itemsWithDates = cartItems.map(({ item, startDate: itemStart, endDate: itemEnd }) => {
                const eventStart = new Date(startDate); const eventEnd = new Date(endDate);
                let start = new Date(itemStart || startDate); let end = new Date(itemEnd || endDate);
                if (start < eventStart) start = eventStart; if (start > eventEnd) start = eventStart;
                if (end > eventEnd) end = eventEnd; if (end < eventStart) end = eventEnd;
                if (start > end) end = start;
                return { itemId: Number(item.id), itemStartDate: start.toISOString(), itemEndDate: end.toISOString(), priceHt: getPrice(item), tvaValue: 0, discount: 0 };
            });
            await createComplexEvent(Number(user.company_id) || 0, Number(user.id), startDate, endDate, title, category, guestCount, description, itemsWithDates);
            toast.success(t('event_created')); clearCart(); router.push("/dashboard/calendar");
        } catch (error: any) {
            toast.error(error instanceof Error ? error.message : t('create_failed'));
        } finally { setIsSubmitting(false); }
    };

    const totalCost = calculateTotal();
    const tax = totalCost * 0.19;
    const finalTotal = totalCost + tax;

    if (!user) return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <TiltCard intensity={8}>
                    <div className="text-center bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border border-[#ece9e0] relative overflow-hidden">
                        <ParticleField count={10} color="var(--primary)" />
                        <Floating amplitude={10} duration={3}>
                            <div className="w-20 h-20 bg-gradient-to-br from-[var(--footer)] to-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <UserIcon className="w-10 h-10 text-white" />
                            </div>
                        </Floating>
                        <h2 className="text-2xl font-bold text-[var(--footer)] mb-2 relative z-10">{t('login_modal_title')}</h2>
                        <p className="text-[#7a7a68] mb-8 relative z-10">{t('login_subtitle')}</p>
                        <Magnetic>
                            <motion.button
                                onClick={() => setShowLoginModal(true)}
                                whileHover={{ scale: 1.04, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full py-4 bg-gradient-to-r from-[var(--footer)] to-[var(--primary)] text-white rounded-xl font-bold text-sm shadow-xl relative z-10"
                            >
                                {t('sign_in')}
                            </motion.button>
                        </Magnetic>
                        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLoginSuccess={() => setShowLoginModal(false)} />
                    </div>
                </TiltCard>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--background)] pb-20">
            <ScrollProgressBar />
            <Hero badge={h("badge")} title_part1={h("title")} title_part2={h("subtitle")} description={h("description")} bgImage="/images/default-images/hero/hero-create-event.jpg" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative z-10">

                {/* ── HEADER BAR ── */}
                <Reveal>
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 md:p-8 mb-8 border border-[#ece9e0] relative overflow-hidden">
                        <ParticleField count={6} color="var(--primary)" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div>
                                <h1 className="text-3xl font-bold text-[var(--footer)]">{t('title')}</h1>
                                <p className="text-[#7a7a68] mt-1">{t('create_event_subtitle')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {cartItems.length > 0 && (
                                    <motion.button onClick={clearCart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 border border-red-100 transition-colors font-medium text-sm">
                                        <Trash2 className="w-4 h-4" /> {t('clear_all')}
                                    </motion.button>
                                )}
                                <Link href="/items">
                                    <motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ece9e0] bg-white text-[var(--footer)] font-medium text-sm shadow-sm hover:border-[var(--primary)]/30 transition-all">
                                        <Plus className="w-4 h-4" /> {t('browse_more_services')}
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── LEFT: FORM + ITEMS ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Event Details Form */}
                        <Reveal direction="right">
                            <TiltCard intensity={3}>
                                <div className="bg-white rounded-3xl shadow-md shadow-black/5 border border-[#ece9e0] p-6 relative overflow-hidden">
                                    <ParticleField count={5} color="var(--primary)" />
                                    <h3 className="text-xl font-bold text-[var(--footer)] mb-6 flex items-center gap-3 relative z-10">
                                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><CalendarIcon className="w-5 h-5" /></div>
                                        {t('event_details')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                        <div className="md:col-span-2">
                                            <Label htmlFor="title">{t('title')}</Label>
                                            <Input id="title" placeholder={t('title_placeholder')} value={title} onChange={(e: any) => setTitle(e.target.value)} className="mt-1.5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="category">{t('category')}</Label>
                                            <select id="category" value={category} onChange={e => setCategory(e.target.value)}
                                                className="mt-1.5 flex h-10 w-full rounded-md border border-[#ece9e0] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 focus:border-[var(--primary)]">
                                                {eventCategories.map(cat => <option key={cat} value={cat}>{t(cat.toLowerCase())}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="guests">{t('guests')}</Label>
                                            <Input id="guests" type="number" min={1} value={guestCount || ''} onChange={(e: any) => setGuestCount(Number(e.target.value))} className="mt-1.5" placeholder={t('guests_placeholder')} />
                                        </div>
                                        <div>
                                            <Label htmlFor="start">{t('start_date')}</Label>
                                            <Input id="start" type="datetime-local" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} className="mt-1.5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="end">{t('end_date')}</Label>
                                            <Input id="end" type="datetime-local" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} className="mt-1.5" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="desc">{t('description')}</Label>
                                            <Textarea id="desc" placeholder={t('description_placeholder')} value={description} onChange={(e: any) => setDescription(e.target.value)} className="mt-1.5 min-h-[100px]" />
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </Reveal>

                        {/* Selected Services */}
                        <Reveal direction="right" delay={0.1}>
                            <div className="bg-white rounded-3xl shadow-md shadow-black/5 border border-[#ece9e0] p-6">
                                <h3 className="text-xl font-bold text-[var(--footer)] mb-6 flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><CheckCircle className="w-5 h-5" /></div>
                                    {t('selected_services')}
                                    <span className="ml-auto text-sm font-medium text-[#7a7a68] bg-[var(--background)] px-3 py-1 rounded-full border border-[#ece9e0]">{cartItems.length}</span>
                                </h3>

                                <AnimatePresence>
                                    {cartItems.length > 0 ? (
                                        <div className="space-y-3">
                                            {cartItems.map(({ item, startDate: itemStart, endDate: itemEnd }, index) => (
                                                <motion.div
                                                    key={`${item.id}-${index}`}
                                                    initial={{ opacity: 0, x: -20, scale: 0.97 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.25 } }}
                                                    layout
                                                    className="group relative bg-[var(--background)] hover:bg-white border border-[#ece9e0] hover:border-[var(--primary)]/20 rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                                            <Image src={item.image || item.cover || "/images/default.jpg"} alt={item.title} fill className="object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-bold text-[var(--footer)] truncate pr-2">{item.title}</h4>
                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    <p className="font-bold text-[var(--primary)] whitespace-nowrap">{getPrice(item).toLocaleString()} TND</p>
                                                                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                                        onClick={() => removeFromCart(item.id)} className="text-[#7a7a68]/70 hover:text-red-500 transition-colors">
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-[#7a7a68] mb-3 truncate">{item.description || t('no_description')}</p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-xs text-[#7a7a68] mb-1 block">{t('item_start')}</label>
                                                                    <Input type="datetime-local" className="h-8 text-xs" value={itemStart || startDate} onChange={(e: any) => updateItemDates(item.id, e.target.value, itemEnd || endDate)} />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-[#7a7a68] mb-1 block">{t('item_end')}</label>
                                                                    <Input type="datetime-local" className="h-8 text-xs" value={itemEnd || endDate} onChange={(e: any) => updateItemDates(item.id, itemStart || startDate, e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border-2 border-dashed border-[#ece9e0] rounded-2xl">
                                            <Floating amplitude={8} duration={3}>
                                                <div className="w-16 h-16 bg-gradient-to-br from-[var(--background)] to-[#ece9e0] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                                    <Plus className="w-8 h-8 text-[#7a7a68]/50" />
                                                </div>
                                            </Floating>
                                            <h4 className="text-lg font-medium text-[var(--footer)] mb-1">{t('your_plan_empty')}</h4>
                                            <p className="text-[#7a7a68] mb-4">{t('start_browsing_services')}</p>
                                            <Link href="/items">
                                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                                    className="px-6 py-2.5 border border-[#ece9e0] rounded-xl text-[#7a7a68] hover:bg-[#ece9e0] transition-colors text-sm font-medium">
                                                    {t('browse_services')}
                                                </motion.button>
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Reveal>
                    </div>

                    {/* ── RIGHT: SUMMARY ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Reveal direction="left">
                                <TiltCard intensity={6}>
                                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-[#ece9e0] p-6 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--footer)]" />
                                        <ParticleField count={8} color="var(--primary)" />
                                        <h3 className="text-xl font-bold text-[var(--footer)] mb-6 flex items-center gap-3 relative z-10">
                                            <div className="p-2.5 bg-green-50 rounded-xl text-green-600"><DollarSign className="w-5 h-5" /></div>
                                            {t('financial_summary')}
                                        </h3>
                                        <div className="space-y-3 relative z-10">
                                            <motion.div whileHover={{ x: 4 }} className="flex justify-between items-center p-3 rounded-xl hover:bg-[var(--background)] transition-colors">
                                                <p className="text-[#7a7a68] font-medium">{t('subtotal')}</p>
                                                <p className="font-bold text-[var(--footer)]">{totalCost.toLocaleString()} TND</p>
                                            </motion.div>
                                            <motion.div whileHover={{ x: 4 }} className="flex justify-between items-center p-3 rounded-xl hover:bg-[var(--background)] transition-colors">
                                                <p className="text-[#7a7a68] font-medium whitespace-nowrap">{t('tax')}</p>
                                                <p className="font-bold text-[var(--footer)]">{tax.toLocaleString()} TND</p>
                                            </motion.div>
                                            <div className="border-t border-dashed border-[#ece9e0] my-2" />
                                            <motion.div
                                                animate={{ scale: cartItems.length > 0 ? [1, 1.005, 1] : 1 }}
                                                transition={{ duration: 0.4 }}
                                                className="flex justify-between items-center text-lg bg-gradient-to-r from-[var(--footer)] to-[var(--primary)] p-5 rounded-2xl text-white shadow-lg"
                                            >
                                                <p className="font-medium">{t('total')}</p>
                                                <p className="font-bold text-2xl">{finalTotal.toLocaleString()} TND</p>
                                            </motion.div>
                                        </div>
                                        <Magnetic className="relative z-10 mt-6">
                                            <motion.button
                                                onClick={handleSave}
                                                disabled={isSubmitting || cartItems.length === 0}
                                                whileHover={{ scale: cartItems.length > 0 ? 1.03 : 1, y: cartItems.length > 0 ? -2 : 0 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="w-full py-4 flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-xl font-bold text-base shadow-xl shadow-[var(--primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {isSubmitting ? t('creating_event') : t('create_event')}
                                                {!isSubmitting && <Save className="w-4 h-4" />}
                                            </motion.button>
                                        </Magnetic>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7a7a68]/70 bg-[var(--background)] py-2.5 rounded-xl relative z-10">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {t('secure_booking')}
                                        </div>
                                    </div>
                                </TiltCard>
                            </Reveal>

                            <Reveal direction="left" delay={0.1}>
                                <motion.div whileHover={{ y: -2 }} className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-sm mb-1">{t('need_assistance')}</h4>
                                            <p className="text-blue-700 text-xs leading-relaxed">{t('assistance_desc')}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}