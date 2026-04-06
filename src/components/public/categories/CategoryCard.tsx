"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/Motion3D";

interface CategoryCardProps {
    category: any;
    className?: string;
    idx?: number;
    t?: any;
    tCommon?: any;
}

export default function CategoryCard({ category, className, idx, t, tCommon }: CategoryCardProps) {
    const itemCount = category.item_category?.length || 0;
    
    return (
        <TiltCard intensity={10} glare className={`h-full ${className}`}>
            <Link
                href={`/items?category=${category.id}`}
                className="block group bg-white rounded-3xl transition-all duration-700 h-full flex flex-col overflow-hidden shadow-sm hover:shadow-2xl border border-[#ece9e0] hover:border-[var(--primary)]/30 group/card"
            >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/5] bg-[#ece9e0]">
                    <Image
                        src={category.image?.startsWith('/') ? category.image : `/images/default-images/${category.image || 'home/category.jpg'}`}
                        alt={category.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/default.jpg"; }}
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                    
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl transform-gpu transition-all duration-700 group-hover:bg-white group-hover:scale-[1.02]"
                        >
                            <h3 className="font-bold text-white text-xl group-hover:text-[var(--footer)] transition-colors leading-tight line-clamp-1 mb-1">{category.title}</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-white/70 text-xs uppercase tracking-widest group-hover:text-[#a1a194] transition-colors">
                                    {itemCount} {tCommon ? (itemCount === 1 ? tCommon("service") : tCommon("services")) : (t ? (itemCount === 1 ? t("service") : t("services")) : "Services")}
                                </p>
                                <motion.div 
                                    className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500"
                                    whileHover={{ rotate: 45 }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white" strokeWidth="2.5">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                                    </svg>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Link>
        </TiltCard>
    );
}
