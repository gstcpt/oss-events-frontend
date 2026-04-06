"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ShieldCheck, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TiltCard } from "@/components/ui/Motion3D";

interface ProviderCardProps {
    provider: any;
    index: number;
    t: any;
    tCommon: any;
    tarifLevels?: any;
    viewType?: 'grid' | 'list';
}

export default function ProviderCard({ provider, index, t, tCommon, tarifLevels, viewType = 'grid' }: ProviderCardProps) {
    const info = provider.provider_info?.[0] || provider;
    const name = info?.ste_title || `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || provider.name;
    const image = info?.logo || provider.avatar || "/images/default-images/providers/provider.jpg";
    const city = info?.city || provider.city;
    const country = info?.country || provider.country;
    const location = [city, country].filter(Boolean).join(", ") || tCommon("location_na");
    const category = info?.categories?.title || provider.category || tCommon("service_provider");
    const tarif = info?.tarification || provider.tarification;
    const tarifInfo = tarif && tarifLevels ? tarifLevels[tarif] : null;

    if (viewType === 'list') {
        return (
            <TiltCard intensity={5} className="w-full">
                <Link
                    href={`/providers/${provider.id}`}
                    className="group flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl p-6 border border-[#ece9e0] hover:border-[var(--primary)]/30 shadow-sm hover:shadow-2xl transition-all duration-700"
                >
                    {/* Avatar */}
                    <div className="relative w-full md:w-44 aspect-square rounded-2xl overflow-hidden flex-shrink-0 bg-[#ece9e0]">
                        <Image
                            src={image}
                            alt={name || "Provider"}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/default-images/providers/provider.jpg"; }}
                        />
                        <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 w-full flex flex-col text-left">
                        <div className="mb-4">
                            <p className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{category}</p>
                            <h3 className="font-black text-[var(--footer)] text-2xl mb-2 tracking-tight group-hover:text-[var(--primary)] transition-colors line-clamp-1">{name}</h3>
                            <div className="flex items-center gap-1.5 text-[#7a7a68] text-xs font-bold uppercase tracking-wider backdrop-blur-sm bg-slate-50/50 w-fit px-3 py-1.5 rounded-full border border-slate-100">
                                <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                                <span className="truncate">{location}</span>
                            </div>
                        </div>
                        
                        <div className="mt-auto flex flex-wrap gap-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="font-black text-amber-600 text-xs">{provider.rating > 0 ? (Number(provider.rating) || 0).toFixed(1) : "---"}</span>
                                <span className="text-amber-600/60 text-[10px] font-bold">({provider.reviewCount || 0})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#7a7a68] text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                <span>{provider.itemCount || 0} {tCommon("services")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:pl-6 border-l md:border-[#ece9e0] md:flex md:flex-col md:justify-center">
                         <div className="px-6 py-4 bg-[var(--footer)] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl group-hover:bg-[var(--primary)] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-footer/10">
                             {tCommon("view_profile")}
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-white" strokeWidth="3">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                         </div>
                    </div>
                </Link>
            </TiltCard>
        );
    }

    return (
        <TiltCard intensity={12} glare className="h-full">
            <Link
                href={`/providers/${provider.id}`}
                className="group block relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 h-full border border-[#ece9e0] hover:border-[var(--primary)]/30"
            >
                {/* Main Image */}
                <Image
                    src={image}
                    alt={name || "Provider"}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/default-images/providers/provider.jpg"; }}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-40" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 flex flex-col text-left">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1.5 bg-[var(--primary)] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl shadow-white/5">
                            {category}
                        </span>
                        <motion.div 
                            className="bg-emerald-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white/20 shadow-xl"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 1 }}
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                    </div>

                    <h3 className="text-2xl font-black text-white tracking-tight leading-tight mb-2 group-hover:text-[var(--primary)] transition-colors drop-shadow-lg line-clamp-1">
                        {name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-black uppercase tracking-widest mb-8">
                        <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span className="truncate">{city || location}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-black text-white text-xs">{provider.rating > 0 ? (Number(provider.rating) || 0).toFixed(1) : "---"}</span>
                        </div>

                        <motion.div 
                            className="w-12 h-12 rounded-2xl bg-white text-[var(--footer)] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:bg-[var(--primary)] group-hover:text-white"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2.5">
                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </motion.div>
                    </div>
                </div>
            </Link>
        </TiltCard>
    );
}
