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
    ringColor = "rgba(170, 169, 153, 0.4)",
    dotColor = "#ffffff",
    ringSize = 40,
    ringSizeHover = 60,
}: CustomCursorProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        const handleHoverStart = () => setIsHovering(true);
        const handleHoverEnd = () => setIsHovering(false);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseenter", handleMouseEnter);
        document.addEventListener("mouseleave", handleMouseLeave);

        const interactiveElements = document.querySelectorAll(
            'a, button, input, textarea, select, [role="button"], .clickable, .hover-trigger'
        );

        interactiveElements.forEach((el) => {
            el.addEventListener("mouseenter", handleHoverStart);
            el.addEventListener("mouseleave", handleHoverEnd);
        });

        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll(
                'a, button, input, textarea, select, [role="button"], .clickable, .hover-trigger'
            );
            newElements.forEach((el) => {
                el.addEventListener("mouseenter", handleHoverStart);
                el.addEventListener("mouseleave", handleHoverEnd);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.removeEventListener("mouseleave", handleMouseLeave);
            interactiveElements.forEach((el) => {
                el.removeEventListener("mouseenter", handleHoverStart);
                el.removeEventListener("mouseleave", handleHoverEnd);
            });
            observer.disconnect();
        };
    }, [cursorX, cursorY, isVisible]);

    if (!isVisible) return null;

    return (
        <>
            {/* Core cursor dot */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: "-50%",
                    y: "-50%",
                }}
                className="fixed top-0 left-0 pointer-events-none z-[9999]"
            >
                <div
                    className="rounded-full"
                    style={{
                        width: 12,
                        height: 12,
                        background: primaryColor,
                        mixBlendMode: "difference",
                    }}
                />
            </motion.div>

            {/* Ring cursor */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: "-50%",
                    y: "-50%",
                }}
                className="fixed top-0 left-0 pointer-events-none z-[9998]"
                animate={{
                    width: isHovering ? ringSizeHover : ringSize,
                    height: isHovering ? ringSizeHover : ringSize,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                <div
                    className="w-full h-full rounded-full"
                    style={{
                        border: `1.5px solid ${isHovering ? primaryColor : ringColor}`,
                        background: isHovering ? "rgba(170, 169, 153, 0.1)" : "transparent",
                    }}
                />
            </motion.div>

            {/* Small white dot */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: "-50%",
                    y: "-50%",
                }}
                className="fixed top-0 left-0 pointer-events-none z-[9999]"
            >
                <div
                    className="rounded-full"
                    style={{
                        width: 4,
                        height: 4,
                        background: dotColor,
                    }}
                />
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