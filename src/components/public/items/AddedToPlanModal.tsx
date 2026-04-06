"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { useEventCart } from "@/context/EventCartContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, Calendar, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface AddedToPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddedToPlanModal({ isOpen, onClose }: AddedToPlanModalProps) {
    const t = useTranslations("AddedToPlanModal");
    const { cartItems, removeFromCart, clearCart } = useEventCart();
    const router = useRouter();

    const getPrice = (item: any): number => {
        if (!item || !item.price) return 0;
        if (typeof item.price === 'number') return item.price;
        if (typeof item.price === 'string') return Number(item.price) || 0;
        if (typeof item.price === 'object') {
            const d = item.price.d;
            if (Array.isArray(d) && d.length > 0) return Number(d[0]) || 0;
        }
        return 0;
    };

    const total = cartItems.reduce((acc, { item }) => acc + getPrice(item), 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('title')} widthClass="max-w-2xl">
            <div className="p-6">
                <div className={`flex items-center gap-3 mb-6 p-4 rounded-xl border ${cartItems.length === 0 ? "bg-slate-50 border-slate-100" : "bg-green-50 border-green-100"}`}>
                    {cartItems.length === 0 ? (
                        <ShoppingBag className="w-6 h-6 text-slate-400 shrink-0" />
                    ) : (
                        <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    )}
                    <div>
                        <h3 className={`font-bold ${cartItems.length === 0 ? "text-slate-700" : "text-green-800"}`}>
                            {cartItems.length === 0 ? t('planEmpty') : t('itemAdded')}
                        </h3>
                        <p className={`text-sm ${cartItems.length === 0 ? "text-slate-500" : "text-green-700"}`}>
                            {t('servicesInPlan', { count: cartItems.length })}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
                            <p className="text-slate-400 text-sm">{t('noItemsSelected')}</p>
                        </div>
                    ) : (
                        cartItems.map((cartItem, idx) => {
                            const { item } = cartItem;
                            return (
                                <div key={`${item.id}-${idx}`} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg group hover:border-orange-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-slate-200 shrink-0">
                                            <Image
                                                src={item.image || item.cover || "/images/default.jpg"}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</p>
                                            <p className="text-xs text-slate-500">{getPrice(item).toLocaleString()} TND</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title={t('removeItem')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-100">
                        <span className="font-medium text-slate-600">{t('totalEstimatedCost')}</span>
                        <span className="font-bold text-xl text-slate-900">{total.toLocaleString()} TND</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    {cartItems.length > 0 && (
                        <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-700 hover:bg-red-50 sm:mr-auto">
                            {t('clearAll')}
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} className={cartItems.length === 0 ? "w-full sm:w-auto" : ""}>
                        {t('keepBrowsing')}
                    </Button>
                    <Button
                        onClick={() => router.push('/createEvent')}
                        className={`bg-primary hover:bg-primary text-white ${cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={cartItems.length === 0}
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        {t('finalizeEvent')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
