"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CustomCursorProps {
    primaryColor?: string;
    ringColor?: string;
    dotColor?: string;
    ringSize?: number;
    ringSizeHover?: number;
}

export default function CustomCursor({
    primaryColor = "#AAA999",
    dotColor = "#ffffff",
}: CustomCursorProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isTextHovered, setIsTextHovered] = useState(false);
    const [isImageHovered, setIsImageHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const dotX = useSpring(mouseX, { stiffness: 1000, damping: 40 });
    const dotY = useSpring(mouseY, { stiffness: 1000, damping: 40 });
    const ringX = useSpring(mouseX, { stiffness: 150, damping: 20 });
    const ringY = useSpring(mouseY, { stiffness: 150, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);
        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        const handleHoverStart = (e: Event) => {
            const target = e.target as HTMLElement;
            setIsHovered(true);
            if (target.tagName === "P" || target.tagName === "H1" || target.tagName === "H2" || target.tagName === "H3" || target.tagName === "SPAN") {
                setIsTextHovered(true);
            }
            if (target.tagName === "IMG" || target.classList.contains("item-image")) {
                setIsImageHovered(true);
            }
        };
        const handleHoverEnd = () => {
            setIsHovered(false);
            setIsTextHovered(false);
            setIsImageHovered(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseenter", handleMouseEnter);
        window.addEventListener("mouseleave", handleMouseLeave);

        const refreshSelectors = () => {
            const interactiveElements = document.querySelectorAll(
                'a, button, input, textarea, p, h1, h2, h3, h4, span, img, [role="button"], .interactive'
            );
            interactiveElements.forEach((el) => {
                el.addEventListener("mouseenter", handleHoverStart);
                el.addEventListener("mouseleave", handleHoverEnd);
            });
        };

        refreshSelectors();
        const observer = new MutationObserver(refreshSelectors);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseenter", handleMouseEnter);
            window.removeEventListener("mouseleave", handleMouseLeave);
            observer.disconnect();
        };
    }, [mouseX, mouseY, isVisible]);

    if (!isVisible) return null;

    return (
        <>
            {/* Liquid Ring */}
            <motion.div
                style={{
                    translateX: ringX,
                    translateY: ringY,
                    x: "-50%",
                    y: "-50%",
                }}
                className="fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center overflow-hidden rounded-full"
                animate={{
                    width: isHovered ? 80 : 32,
                    height: isHovered ? 80 : 32,
                    backgroundColor: isHovered ? "rgba(255, 255, 255, 0.1)" : "rgba(170, 169, 153, 0.15)",
                    backdropFilter: isHovered ? "blur(4px)" : "blur(0px)",
                    border: isHovered ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(170, 169, 153, 0.3)",
                    scale: isClicked ? 0.8 : 1,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
            >
                {isImageHovered && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] font-bold text-white uppercase tracking-widest"
                    >
                        View
                    </motion.span>
                )}
            </motion.div>

            {/* Core Dot */}
            <motion.div
                style={{
                    translateX: dotX,
                    translateY: dotY,
                    x: "-50%",
                    y: "-50%",
                }}
                className="fixed top-0 left-0 pointer-events-none z-[9999]"
                animate={{
                    scale: isClicked ? 1.5 : isTextHovered ? 4 : isHovered ? 0.5 : 1,
                }}
            >
                <div
                    className="rounded-full blur-[0.5px]"
                    style={{
                        width: 8,
                        height: 8,
                        background: isTextHovered ? "rgba(255,255,255,0.3)" : primaryColor,
                        mixBlendMode: isTextHovered ? "difference" : "normal",
                    }}
                />
            </motion.div>

            {/* Accent Shadow */}
            <motion.div
                style={{
                    translateX: ringX,
                    translateY: ringY,
                    x: "-50%",
                    y: "-50%",
                }}
                className="fixed top-0 left-0 pointer-events-none z-[9997]"
                animate={{
                    width: isHovered ? 120 : 0,
                    height: isHovered ? 120 : 0,
                    opacity: isHovered ? 0.1 : 0,
                }}
            >
                <div className="w-full h-full rounded-full bg-white blur-2xl" />
            </motion.div>
        </>
    );
}

export function MagneticButton({
    children,
    className = "",
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    const ref = React.useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.3);
        y.set((e.clientY - centerY) * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            style={{ x, y }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={className}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    );
}