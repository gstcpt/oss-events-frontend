"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ShieldCheck, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <Link
                href={`/providers/${provider.id}`}
                className="group flex flex-col md:flex-row items-center gap-5 bg-white rounded-3xl p-4 border border-[#ece9e0] hover:border-[var(--primary)]/30 shadow-sm hover:shadow-lg hover:shadow-black/5 transition-all duration-300 animate-fade-in-up opacity-0 fill-mode-forwards"
                style={{ animationDelay: `${index * 40}ms` }}
            >
                {/* Avatar */}
                <div className="relative w-full md:w-32 aspect-square rounded-2xl overflow-hidden flex-shrink-0 bg-[#ece9e0]">
                    <Image
                        src={image}
                        alt={name || "Provider"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/default-images/providers/provider.jpg"; }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-[var(--footer)] text-lg truncate">{name}</h3>
                        <span className="flex-shrink-0 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> {t("card.verified")}
                        </span>
                    </div>
                    <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">{category}</p>
                    <div className="flex items-center gap-1.5 text-[#7a7a68] text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span className="truncate">{location}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2 flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#ece9e0]">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-[var(--footer)] text-sm">{provider.rating > 0 ? (Number(provider.rating) || 0).toFixed(1) : "---"}</span>
                        <span className="text-[#7a7a68] text-[10px]">({provider.reviewCount || 0})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#7a7a68] text-[10px] font-bold uppercase tracking-tighter">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{t("card.services_count", { count: provider.itemCount || 0 })}</span>
                    </div>
                    {tarif && (
                        <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-1 rounded-md">{tarif}</span>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/providers/${provider.id}`}
            className="group block relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-all duration-700 animate-fade-in-up opacity-0 fill-mode-forwards h-full"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Main Image */}
            <Image
                src={image}
                alt={name || "Provider"}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/default-images/providers/provider.jpg"; }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Content Overlay - Frosted Glass Effect */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 backdrop-blur-md bg-white/10 border-t border-white/20 transition-all duration-500 group-hover:bg-white/20">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight line-clamp-1 flex-1">
                        {name}
                    </h3>
                    <div className="bg-emerald-500 rounded-full p-1 shadow-lg shadow-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>

                <p className="text-white/70 text-sm font-medium mb-6 line-clamp-1 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    {category}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-xs">{provider.rating > 0 ? (Number(provider.rating) || 0).toFixed(1) : "---"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider hidden sm:flex">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[80px]">{city || location}</span>
                        </div>
                    </div>

                    <div className="px-5 py-2.5 bg-white/20 hover:bg-white text-white hover:text-[var(--footer)] backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-white/20 active:scale-95 shadow-lg">
                        {tCommon("view_profile")} +
                    </div>
                </div>
            </div>
        </Link>
    );
}
