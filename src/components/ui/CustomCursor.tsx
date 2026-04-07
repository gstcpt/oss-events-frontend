"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useTransform, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isTextHovered, setIsTextHovered] = useState(false);
    const [isImageHovered, setIsImageHovered] = useState(false);
    const [isViewHovered, setIsViewHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [cursorText, setCursorText] = useState("");
    const [mounted, setMounted] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Velocity-based effects (liquid feel)
    const xVelocity = useVelocity(mouseX);
    const yVelocity = useVelocity(mouseY);
    const velocity = useTransform([xVelocity, yVelocity], ([vx, vy]) =>
        Math.sqrt(Math.pow(Number(vx), 2) + Math.pow(Number(vy), 2))
    );

    const scaleX = useTransform(velocity, [0, 3000], [1, 1.5]);
    const scaleY = useTransform(velocity, [0, 3000], [1, 0.5]);
    const angle = useTransform([xVelocity, yVelocity], ([vx, vy]) =>
        Math.atan2(Number(vy), Number(vx)) * (180 / Math.PI)
    );

    // Spring physics for smooth movement
    const smoothMouseX = useSpring(mouseX, { stiffness: 450, damping: 45 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 450, damping: 45 });

    const dotX = useSpring(mouseX, { stiffness: 2000, damping: 90 });
    const dotY = useSpring(mouseY, { stiffness: 2000, damping: 90 });

    const updateMousePosition = useCallback((e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        if (!isVisible) setIsVisible(true);
    }, [mouseX, mouseY, isVisible]);

    useEffect(() => {
        setMounted(true);
        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);
        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        const handleHoverStart = (e: Event) => {
            const target = e.target as HTMLElement;
            setIsHovered(true);

            const isText = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "LI"].includes(target.tagName);
            if (isText) setIsTextHovered(true);

            if (target.tagName === "IMG" || target.closest(".item-image")) {
                setIsImageHovered(true);
            }

            if (target.closest(".view-trigger")) {
                setIsViewHovered(true);
                setCursorText(target.getAttribute("data-cursor-text") || "View");
            }
        };

        const handleHoverEnd = () => {
            setIsHovered(false);
            setIsTextHovered(false);
            setIsImageHovered(false);
            setIsViewHovered(false);
            setCursorText("");
        };

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseenter", handleMouseEnter);
        window.addEventListener("mouseleave", handleMouseLeave);

        const setupInteractiveElements = () => {
            const elements = document.querySelectorAll('a, button, input, textarea, p, h1, h2, h3, h4, h5, h6, span, img, [role="button"], .interactive, .item-image, .view-trigger');
            elements.forEach(el => {
                el.addEventListener("mouseenter", handleHoverStart);
                el.addEventListener("mouseleave", handleHoverEnd);
            });
        };

        setupInteractiveElements();
        const observer = new MutationObserver(setupInteractiveElements);
        observer.observe(document.body, { childList: true, subtree: true });

        // Hide default cursor globally
        document.body.style.cursor = "none";
        const allInteractive = document.querySelectorAll<HTMLElement>("a, button, input, .interactive");
        allInteractive.forEach(el => (el.style.cursor = "none"));

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseenter", handleMouseEnter);
            window.removeEventListener("mouseleave", handleMouseLeave);
            observer.disconnect();
            document.body.style.cursor = "auto";
        };
    }, [updateMousePosition]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 1. LIQUID TRAIL / OUTER RING */}
                        <motion.div
                            style={{
                                x: smoothMouseX,
                                y: smoothMouseY,
                                translateX: "-50%",
                                translateY: "-50%",
                                rotate: angle,
                                scaleX,
                                scaleY,
                            }}
                            className="fixed top-0 left-0 flex items-center justify-center rounded-full"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: 1,
                                width: isHovered ? (isTextHovered ? 32 : 24) : 16,
                                height: isHovered ? (isTextHovered ? 32 : 24) : 16,
                                backgroundColor: isHovered ? "rgba(var(--cursor-core-rgb), 0.05)" : "rgba(var(--cursor-core-rgb), 0.1)",
                                border: isHovered ? "1px solid var(--cursor-core)" : "1px solid rgba(var(--cursor-core-rgb), 0.3)",
                                backdropFilter: isHovered ? "blur(2px)" : "blur(0px)",
                                scale: isClicked ? 0.9 : 1,
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                            {isViewHovered && (
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--cursor-core)] text-center w-full"
                                >
                                    {cursorText}
                                </motion.span>
                            )}
                        </motion.div>

                        {/* 2. CORE DOT - Dynamic size and blend mode */}
                        <motion.div
                            style={{
                                x: dotX,
                                y: dotY,
                                translateX: "-50%",
                                translateY: "-50%",
                            }}
                            className="fixed top-0 left-0 bg-[var(--cursor-core)] rounded-full mix-blend-difference"
                            initial={{ scale: 0 }}
                            animate={{
                                scale: isVisible ? 1 : 0,
                                width: isClicked ? 4 : (isTextHovered ? 20 : (isHovered ? 6 : 4)),
                                height: isClicked ? 4 : (isTextHovered ? 20 : (isHovered ? 6 : 4)),
                                backgroundColor: isTextHovered ? "var(--cursor-core)" : "var(--cursor-core)",
                                opacity: isTextHovered ? 0.3 : 1,
                            }}
                            transition={{ type: "spring", damping: 35, stiffness: 400 }}
                        />

                        {/* 3. FLUID PARTICLES (Ambient trail) */}
                        {[...Array(3)].map((_, i) => (
                            <ParticleTrail key={i} index={i} mouseX={mouseX} mouseY={mouseY} />
                        ))}

                        {/* 4. CLICK RIPPLE */}
                        <AnimatePresence>
                            {isClicked && <Ripple key="ripple" x={mouseX} y={mouseY} />}
                        </AnimatePresence>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function ParticleTrail({ index, mouseX, mouseY }: { index: number; mouseX: any; mouseY: any }) {
    const x = useSpring(mouseX, { stiffness: 100 - index * 20, damping: 25 + index * 5 });
    const y = useSpring(mouseY, { stiffness: 100 - index * 20, damping: 25 + index * 5 });

    return (
        <motion.div
            style={{ x, y, translateX: "-50%", translateY: "-50%" }}
            className="fixed top-0 left-0 w-4 h-4 rounded-full bg-[var(--cursor-core)] opacity-10 blur-[1px]"
        />
    );
}

function Ripple({ x, y }: { x: any; y: any }) {
    return (
        <motion.div
            initial={{ opacity: 0.5, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
                left: x.get(),
                top: y.get(),
                translateX: "-50%",
                translateY: "-50%",
            }}
            className="fixed top-0 left-0 w-12 h-12 rounded-full border border-[var(--cursor-core)] opacity-30 blur-[1px]"
        />
    );
}

export function MagneticButton({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useSpring(0, { stiffness: 150, damping: 15 });
    const y = useSpring(0, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.4);
        y.set((e.clientY - cy) * 0.4);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.button
            ref={ref}
            style={{ x, y }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`cursor-none ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            {children}
        </motion.button>
    );
}