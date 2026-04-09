"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Eye, X, ChevronLeft, ChevronRight } from "lucide-react";

export interface MediaItem {
    id?: number | string;
    file: string;
    media_type?: string;
}

interface MediaGalleryProps {
    media: MediaItem[] | string[];
    moreLabel?: string;
    galleryLabel?: string;
}

export default function MediaGallery({ media, moreLabel = "More", galleryLabel = "Gallery" }: MediaGalleryProps) {
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Normalize media
    const normalizedMedia: MediaItem[] = media?.map((item, id) => {
        if (typeof item === "string") {
            return { id, file: item };
        }
        return { ...item, id: item.id || id };
    }) || [];

    const goToPrevious = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (previewIndex !== null) {
            setPreviewIndex(prev => prev === 0 ? normalizedMedia.length - 1 : prev! - 1);
        }
    }, [normalizedMedia.length, previewIndex]);

    const goToNext = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (previewIndex !== null) {
            setPreviewIndex(prev => prev === normalizedMedia.length - 1 ? 0 : prev! + 1);
        }
    }, [normalizedMedia.length, previewIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrevious();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, goToNext, goToPrevious]);

    if (!normalizedMedia || normalizedMedia.length === 0) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl aspect-square flex items-center justify-center border border-[#ece9e0] grayscale opacity-40">
                        <Image src="/images/default.jpg" width={100} height={100} alt="Default" className="object-cover" />
                    </div>
                ))}
            </div>
        );
    }

    const displayedMedia = normalizedMedia.slice(0, 7);
    const hasMore = normalizedMedia.length > 7;

    return (
        <>
            {/* Grid Display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayedMedia.map((img, index) => (
                    <div
                        key={img.id || index}
                        className="relative group aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 bg-[#ece9e0]"
                        onClick={() => { setPreviewIndex(index); setIsOpen(true); }}
                    >
                        <Image 
                            src={img.file} 
                            fill 
                            alt={`Gallery image ${index + 1}`} 
                            className="object-cover transition-transform duration-700 group-hover:scale-110" 
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/default.jpg";
                            }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                            <div className="opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 text-white bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30">
                                <Eye className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
                
                {hasMore && (
                    <div
                        className="relative group aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-xl shadow-[var(--primary)]/30 transition-all duration-500 bg-[var(--primary)] text-white flex items-center justify-center transform hover:scale-105"
                        onClick={() => { setPreviewIndex(0); setIsOpen(true); }}
                    >
                        <div className="text-center transform transition-transform group-hover:scale-110">
                            <span className="text-3xl font-bold mb-1 block">+{normalizedMedia.length - 7}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{moreLabel}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox Modal Overlay */}
            {isOpen && previewIndex !== null && (
                <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden" style={{ zIndex: 999999 }}>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" />
                    
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-start" style={{ zIndex: 999999 }}>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.5em]">{galleryLabel}</span>
                            <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest">
                                {previewIndex + 1} <span className="mx-2">/</span> {normalizedMedia.length}
                            </h4>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-500 backdrop-blur-3xl shadow-2xl"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Arrows */}
                    {normalizedMedia.length > 1 && (
                        <>
                            <button 
                                onClick={goToPrevious} 
                                className="hidden md:flex absolute left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-[var(--primary)] text-white/40 hover:text-white rounded-full items-center justify-center transition-all duration-500 backdrop-blur-3xl border border-white/10 hover:border-[var(--primary)] group shadow-2xl"
                                style={{ zIndex: 999999 }}
                            >
                                <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={goToNext} 
                                className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-[var(--primary)] text-white/40 hover:text-white rounded-full items-center justify-center transition-all duration-500 backdrop-blur-3xl border border-white/10 hover:border-[var(--primary)] group shadow-2xl"
                                style={{ zIndex: 999999 }}
                            >
                                <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                    {/* Main Focus Image */}
                    <div className="relative w-full h-full p-20 flex items-center justify-center">
                        <div className="relative w-full h-full max-w-7xl">
                            {normalizedMedia[previewIndex].file?.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video src={normalizedMedia[previewIndex].file} controls autoPlay className="w-full h-full object-contain rounded-xl shadow-2xl" />
                            ) : (
                                <Image 
                                    src={normalizedMedia[previewIndex].file} 
                                    fill 
                                    sizes="100vw" 
                                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700" 
                                    alt={`Gallery Full ${previewIndex}`} 
                                    priority 
                                />
                            )}
                        </div>
                    </div>

                    {/* Bottom Rail Thumbnails */}
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 px-10 overflow-x-auto py-6 no-scrollbar" style={{ zIndex: 999999 }}>
                        {normalizedMedia.map((item, index) => (
                            <button 
                                key={item.id || index} 
                                onClick={() => setPreviewIndex(index)} 
                                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-4 transition-all duration-500 shadow-2xl ${
                                    index === previewIndex ? 'border-[var(--primary)] scale-110 -translate-y-2' : 'border-white/5 opacity-30 hover:opacity-100 hover:scale-105'
                                }`}
                            >
                                {item.file?.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video src={item.file} className="w-full h-full object-cover" />
                                ) : (
                                    <Image src={item.file} fill className="object-cover" alt={`Thumb ${index}`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
