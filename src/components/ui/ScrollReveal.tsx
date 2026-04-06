"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    className?: string;
    rootMargin?: string;
    animation?: "fade" | "slide-up" | "none";
}

export function ScrollReveal({ 
    children, 
    fallback, 
    className = "", 
    rootMargin = "200px",
    animation = "slide-up" 
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (hasLoaded) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasLoaded(true);
                    observer.disconnect();
                }
            },
            { rootMargin } 
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [hasLoaded, rootMargin]);

    const variants = {
        hidden: animation === "slide-up" ? { opacity: 0, y: 40 } : animation === "fade" ? { opacity: 0 } : { opacity: 1 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    return (
        <div ref={ref} className={className}>
            {hasLoaded ? (
                <motion.div initial="hidden" animate="visible" variants={variants}>
                    {children}
                </motion.div>
            ) : (
                fallback || <div className="min-h-[300px]" />
            )}
        </div>
    );
}
