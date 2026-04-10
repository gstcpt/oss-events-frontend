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
    const [isMobile, setIsMobile] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Check for mobile/touch device
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.matchMedia("(max-width: 1024px)").matches || 
                          'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Velocity-based effects
    const xVelocity = useVelocity(mouseX);
    const yVelocity = useVelocity(mouseY);
    const velocity = useTransform([xVelocity, yVelocity], ([vx, vy]) =>
        Math.sqrt(Math.pow(Number(vx), 2) + Math.pow(Number(vy), 2))
    );

    const scaleX = useTransform(velocity, [0, 3000], [1, 1.3]);
    const scaleY = useTransform(velocity, [0, 3000], [1, 0.7]);

    // Faster spring physics for responsive movement
    const smoothMouseX = useSpring(mouseX, { stiffness: 800, damping: 60 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 800, damping: 60 });

    const dotX = useSpring(mouseX, { stiffness: 1500, damping: 70 });
    const dotY = useSpring(mouseY, { stiffness: 1500, damping: 70 });

    const updateMousePosition = useCallback((e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        if (!isVisible) setIsVisible(true);
    }, [mouseX, mouseY, isVisible]);

    useEffect(() => {
        setMounted(true);
        
        // Skip cursor setup on mobile
        if (isMobile) return;

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
    }, [updateMousePosition, isMobile]);

    // Return nothing on mobile
    if (!mounted || isMobile) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* OUTER RING - Dark visible ring */}
                        <motion.div
                            style={{
                                x: smoothMouseX,
                                y: smoothMouseY,
                                translateX: "-50%",
                                translateY: "-50%",
                                scaleX,
                                scaleY,
                            }}
                            className="fixed top-0 left-0 flex items-center justify-center rounded-full"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: 1,
                                width: isHovered ? (isTextHovered ? 48 : 40) : 28,
                                height: isHovered ? (isTextHovered ? 48 : 40) : 28,
                                backgroundColor: isHovered ? "rgba(30, 30, 30, 0.9)" : "rgba(30, 30, 30, 0.7)",
                                border: isHovered ? "2px solid rgba(255, 255, 255, 0.9)" : "2px solid rgba(255, 255, 255, 0.5)",
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                            {isViewHovered && (
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-white text-center w-full"
                                >
                                    {cursorText}
                                </motion.span>
                            )}
                        </motion.div>

                        {/* CORE DOT - Bright white dot */}
                        <motion.div
                            style={{
                                x: dotX,
                                y: dotY,
                                translateX: "-50%",
                                translateY: "-50%",
                            }}
                            className="fixed top-0 left-0 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{
                                scale: isVisible ? 1 : 0,
                                width: isClicked ? 4 : (isTextHovered ? 12 : (isHovered ? 10 : 8)),
                                height: isClicked ? 4 : (isTextHovered ? 12 : (isHovered ? 10 : 8)),
                                backgroundColor: "#ffffff",
                                boxShadow: isHovered ? "0 0 10px rgba(255,255,255,0.8)" : "none",
                            }}
                            transition={{ type: "spring", damping: 25, stiffness: 600 }}
                        />

                        {/* CLICK RIPPLE */}
                        <AnimatePresence>
                            {isClicked && <Ripple key="ripple" x={mouseX} y={mouseY} />}
                        </AnimatePresence>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function Ripple({ x, y }: { x: any; y: any }) {
    return (
        <motion.div
            initial={{ opacity: 0.8, scale: 0 }}
            animate={{ opacity: 0, scale: 2.5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
                left: x.get(),
                top: y.get(),
                translateX: "-50%",
                translateY: "-50%",
            }}
            className="fixed top-0 left-0 rounded-full border-2 border-white"
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