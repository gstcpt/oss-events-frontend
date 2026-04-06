"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Eye } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface BlogMedia {
    id: number;
    file: string;
    media_type?: string;
}

interface BlogMediaGalleryProps {
    media: BlogMedia[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export const BlogMediaGallery: React.FC<BlogMediaGalleryProps> = ({ media, initialIndex = 0, isOpen, onClose }) => {
    const t = useTranslations('BlogPostPage');
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const goToPrevious = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex(prev => prev === 0 ? media.length - 1 : prev - 1);
    }, [media.length]);
    const goToNext = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex(prev => prev === media.length - 1 ? 0 : prev + 1);
    }, [media.length]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrevious();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, goToNext, goToPrevious]);
    if (!isOpen || !media || media.length === 0) return null;
    const currentMedia = media[currentIndex];
    return (
        <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-start z-[1001]">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.5em]">{t("gallery")}</span>
                    <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest">{currentIndex + 1} <span className="mx-2">/</span> {media.length}</h4>
                </div>
                <button onClick={onClose} className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-500 backdrop-blur-3xl shadow-2xl"><X className="w-8 h-8" /></button>
            </div>
            {media.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-[var(--primary)] text-white/40 hover:text-white rounded-full flex items-center justify-center z-[1001] transition-all duration-500 backdrop-blur-3xl border border-white/10 hover:border-[var(--primary)] group shadow-2xl"><ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" /></button>
                    <button onClick={goToNext} className="absolute right-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-[var(--primary)] text-white/40 hover:text-white rounded-full flex items-center justify-center z-[1001] transition-all duration-500 backdrop-blur-3xl border border-white/10 hover:border-[var(--primary)] group shadow-2xl"><ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" /></button>
                </>
            )}
            <div className="relative w-full h-full p-20 flex items-center justify-center">
                <div className="relative w-full h-full max-w-7xl">
                    {currentMedia.file?.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={currentMedia.file} controls autoPlay className="w-full h-full object-contain rounded-xl shadow-2xl" />
                    ) : (
                        <Image src={currentMedia.file} fill sizes="100vw" className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700" alt={`Gallery Full ${currentIndex}`} priority />
                    )}
                </div>
            </div>
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 px-10 overflow-x-auto py-6 z-[1001] no-scrollbar">
                {media.map((item, index) => (
                    <button key={item.id} onClick={() => setCurrentIndex(index)} className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-4 transition-all duration-500 shadow-2xl ${index === currentIndex ? 'border-[var(--primary)] scale-110 -translate-y-2' : 'border-white/5 opacity-30 hover:opacity-100 hover:scale-105'}`}>
                        {item.file?.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={item.file} className="w-full h-full object-cover" />
                        ) : (
                            <Image src={item.file} fill className="object-cover" alt={`Thumb ${index}`} />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
