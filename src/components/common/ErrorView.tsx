"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

interface ErrorViewProps {
    code?: string;
    reset?: () => void;
}

export default function ErrorView({ code, reset }: ErrorViewProps) {
    const t = useTranslations("ErrorPage");
    const pathname = usePathname();
    const router = useRouter();
    const [animationData, setAnimationData] = useState<any>(null);
    const [loadError, setLoadError] = useState(false);

    const isDashboard = pathname?.startsWith("/dashboard");
    const homePath = isDashboard ? "/dashboard" : "/";

    const displayCode = code || "404";
    const knownCodes = ["400", "401", "403", "404", "500", "503"];
    const finalCode = knownCodes.includes(displayCode) ? displayCode : "404";

    useEffect(() => {
        // Fetch from public folder
        fetch("/json/Error-animation.json")
            .then((res) => {
                if (!res.ok) throw new Error("Local animation not found");
                return res.json();
            })
            .then((data) => setAnimationData(data))
            .catch(() => setLoadError(true));
    }, []);

    const handleGoHome = () => {
        router.push(homePath);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans w-full">
            {/* Full Background Image Layer */}
            <div
                className="absolute inset-0 z-0 bg-white transition-transform duration-[10s] scale-110"
            />
            {/* Dark/Blur Overlay for Readability */}
            <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px]" />

            {/* Ambient Glows for Depth */}
            <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-[-10%] left-[-10%] z-1 w-[60%] h-[60%] bg-[var(--primary)] rounded-full blur-[140px]"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-3xl mx-auto px-4 py-12"
            >
                {/* Glassmorphic Card */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] border border-white/20 p-10 md:p-20 text-center transform hover:scale-[1.01] transition-all duration-700">

                    {/* Lottie Container */}
                    <div className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-10 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl" />

                        <AnimatePresence mode="wait">
                            {animationData && !loadError ? (
                                <motion.div key="lottie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative z-10">
                                    <Lottie animationData={animationData} loop={true} />
                                </motion.div>
                            ) : (
                                <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                                    <motion.div
                                        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-white/20 to-transparent shadow-2xl flex items-center justify-center border-4 border-white/30 backdrop-blur-md"
                                    >
                                        <span className="text-7xl md:text-9xl font-bold text-white italic drop-shadow-2xl">!</span>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center px-8 py-2.5 mb-8 rounded-full bg-white/10 text-white font-bold tracking-[0.3em] text-[10px] md:text-[11px] uppercase shadow-inner border border-white/10 backdrop-blur-md">
                            SYSTEM SYNC ERROR: {finalCode}
                        </div>

                        <h2 className="text-4xl md:text-7xl font-bold text-white mb-6 md:mb-8 tracking-tighter leading-[1] drop-shadow-2xl">
                            {t(`${finalCode}.title`)}
                        </h2>

                        <p className="text-lg md:text-xl text-white/70 mb-10 md:mb-12 max-w-md mx-auto leading-relaxed font-medium drop-shadow-md">
                            {t(`${finalCode}.description`)}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                            <Button
                                onClick={reset || (() => window.history.back())}
                                className="w-full sm:w-auto px-10 md:px-14 h-14 md:h-18 rounded-3xl bg-white text-black hover:bg-[var(--primary)] hover:text-white shadow-2xl font-bold text-base md:text-lg transition-all duration-500 hover:-translate-y-2 active:scale-95 flex items-center justify-center"
                            >
                                {reset ? (t('tryAgain') || "Try Again") : t('goBack')}
                            </Button>
                            <Button
                                onClick={handleGoHome}
                                variant="outline"
                                className="w-full sm:w-auto px-10 md:px-14 h-14 md:h-18 rounded-3xl border-white/30 bg-black/20 text-white backdrop-blur-md hover:border-white hover:bg-black/40 font-bold text-base md:text-lg transition-all duration-500 hover:-translate-y-2 active:scale-95"
                            >
                                {t('goHome')}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 md:mt-16 text-center">
                    <p className="text-white/30 text-[9px] md:text-[10px] font-bold tracking-[0.6em] uppercase">
                        Secure Axia Protocol • Premium Network Experience
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
