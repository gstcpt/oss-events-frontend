"use client";
import Image from "next/image";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useInView,
    useScroll,
    HTMLMotionProps,
} from "framer-motion";
import { useRef, useEffect, useState, ReactNode, MouseEvent } from "react";

/* ─────────────────────────────────────────────────────────────
   1. TILT CARD  – mouse-reactive 3-D perspective tilt
───────────────────────────────────────────────────────────── */
interface TiltCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    intensity?: number;   // degrees max tilt (default 12)
    glare?: boolean;
    className?: string;
}
export function TiltCard({ children, intensity = 12, glare = false, className = "", ...rest }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 300, damping: 30 });
    const glareX = useTransform(x, [-0.5, 0.5], ["-30%", "130%"]);
    const glareY = useTransform(y, [-0.5, 0.5], ["-30%", "130%"]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformPerspective: 800, transformStyle: "preserve-3d" }}
            className={`relative ${className}`}
            {...rest}
        >
            {children}
            {glare && (
                <motion.div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none"
                    style={{
                        background: "radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.25) 0%, transparent 60%)",
                        "--gx": glareX,
                        "--gy": glareY,
                    } as any}
                />
            )}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   2. FLOATING  – gentle 3-D float animation
───────────────────────────────────────────────────────────── */
interface FloatingProps { children: ReactNode; amplitude?: number; duration?: number; delay?: number; className?: string; }
export function Floating({ children, amplitude = 12, duration = 4, delay = 0, className = "" }: FloatingProps) {
    return (
        <motion.div
            animate={{ y: [0, -amplitude, 0], rotateZ: [-1, 1, -1] }}
            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   3. REVEAL  – fade + slide-up on scroll enter
───────────────────────────────────────────────────────────── */
interface RevealProps { children: ReactNode; delay?: number; direction?: "up" | "left" | "right" | "down"; className?: string; }
export function Reveal({ children, delay = 0, direction = "up", className = "" }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-10% 0px" });
    const dirMap = { up: [0, 40], down: [0, -40], left: [40, 0], right: [-40, 0] };
    const [x, y] = dirMap[direction];
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x, y, scale: 0.95 }}
            animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   4. STAGGER CONTAINER – children animate in sequence
───────────────────────────────────────────────────────────── */
interface StaggerProps { children: ReactNode; staggerDelay?: number; className?: string; }
export function Stagger({ children, staggerDelay = 0.1, className = "" }: StaggerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-10% 0px" });
    return (
        <motion.div
            ref={ref}
            variants={{ hidden: {}, show: { transition: { staggerChildren: staggerDelay } } }}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={className}
        >
            {children}
        </motion.div>
    );
}
export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   5. PARALLAX LAYER – scroll-linked depth effect
───────────────────────────────────────────────────────────── */
interface ParallaxProps { children: ReactNode; speed?: number; className?: string; }
export function Parallax({ children, speed = 0.3, className = "" }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}px`, `${speed * 100}px`]);
    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div style={{ y }}>{children}</motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   6. MAGNETIC BUTTON – cursor-attracted hover
───────────────────────────────────────────────────────────── */
interface MagneticProps { children: ReactNode; strength?: number; className?: string; }
export function Magnetic({ children, strength = 0.4, className = "" }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useSpring(0, { stiffness: 200, damping: 20 });
    const y = useSpring(0, { stiffness: 200, damping: 20 });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * strength);
        y.set((e.clientY - cy) * strength);
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   7. FLIP CARD – 3-D Y-axis flip on hover
───────────────────────────────────────────────────────────── */
interface FlipCardProps { front: ReactNode; back: ReactNode; className?: string; }
export function FlipCard({ front, back, className = "" }: FlipCardProps) {
    const [flipped, setFlipped] = useState(false);
    return (
        <div
            className={`relative cursor-pointer ${className}`}
            style={{ perspective: 1000 }}
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
        >
            <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d", position: "relative" }}
            >
                {/* Front */}
                <div style={{ backfaceVisibility: "hidden" }}>{front}</div>
                {/* Back */}
                <div style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0, transform: "rotateY(180deg)" }}>{back}</div>
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   8. SCROLL PROGRESS BAR
───────────────────────────────────────────────────────────── */
export function ScrollProgressBar({ color = "var(--primary)" }: { color?: string }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    return (
        <motion.div
            style={{ scaleX, transformOrigin: "0%", background: color }}
            className="fixed top-0 left-0 right-0 h-1 z-[999] shadow-lg"
        />
    );
}

/* ─────────────────────────────────────────────────────────────
   9. COUNT-UP NUMBER – animates on scroll into view
───────────────────────────────────────────────────────────── */
export function CountUp({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const steps = 60;
        const increment = target / steps;
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) { setDisplay(target); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, (duration * 1000) / steps);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────
   10. PARTICLE FIELD – subtle ambient 3-D particles
───────────────────────────────────────────────────────────── */
export function ParticleField({ count = 20, color = "var(--primary)" }: { count?: number; color?: string }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 4,
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full opacity-20"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: color }}
                    animate={{ y: [0, -30, 0], x: [0, 10, -10, 0], scale: [1, 1.5, 1], opacity: [0.15, 0.4, 0.15] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   12. HOVER 3D TILT - Easy 3D tilt on any element
───────────────────────────────────────────────────────────── */
interface Tilt3DProps {
    children: ReactNode;
    className?: string;
    intensity?: number;
    glare?: boolean;
    speed?: number;
}

export function Tilt3D({ children, className = "", intensity = 10, glare = false, speed = 300 }: Tilt3DProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 100, damping: 15 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 100, damping: 15 });
    const glareX = useTransform(x, [-0.5, 0.5], ["-30%", "130%"]);
    const glareY = useTransform(y, [-0.5, 0.5], ["-30%", "130%"]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d" }}
            className={`relative ${className}`}
        >
            {children}
            {glare && (
                <motion.div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none"
                    style={{
                        background: "radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.2) 0%, transparent 60%)",
                        "--gx": glareX,
                        "--gy": glareY,
                    } as any}
                />
            )}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   13. GLOW CONTAINER - Creates a glowing effect on hover
───────────────────────────────────────────────────────────── */
interface GlowContainerProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
    intensity?: "low" | "medium" | "high";
}

export function GlowContainer({ children, className = "", glowColor = "var(--primary)", intensity = "medium" }: GlowContainerProps) {
    const intensities = { low: 20, medium: 40, high: 60 };
    return (
        <motion.div
            className={`relative ${className}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="absolute -inset-1 rounded-2xl blur-sm"
                style={{ background: glowColor, opacity: 0.3 }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.5 }}
                transition={{ duration: 0.3 }}
            />
            <div className="relative">{children}</div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   14. MAGNETIC CONTAINER - Element follows cursor slightly
───────────────────────────────────────────────────────────── */
interface MagneticContainerProps {
    children: ReactNode;
    className?: string;
    strength?: number;
}

export function MagneticContainer({ children, className = "", strength = 0.2 }: MagneticContainerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useSpring(0, { stiffness: 150, damping: 15 });
    const y = useSpring(0, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * strength);
        y.set((e.clientY - cy) * strength);
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   15. SPOTLIGHT CARD - Card with spotlight effect
───────────────────────────────────────────────────────────── */
interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
}

export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            ref={ref}
            className={`relative overflow-hidden ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: isHovered 
                        ? `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(170, 169, 153, 0.15), transparent 80%)`
                        : 'transparent'
                }}
            />
            <div className="relative">{children}</div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   16. PARALLAX IMAGE - Image with parallax scroll effect
───────────────────────────────────────────────────────────── */
interface ParallaxImageProps {
    src: string;
    alt: string;
    className?: string;
    speed?: number;
}

export function ParallaxImage({ src, alt, className = "", speed = 0.3 }: ParallaxImageProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <div ref={ref} className={`overflow-hidden relative ${className}`}>
            <motion.div style={{ y }} className="absolute inset-0">
                <Image src={src} alt={alt} fill className="object-cover" />
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   17. SPOTLIGHT - Spotlight follow cursor effect
───────────────────────────────────────────────────────────── */
interface SpotlightProps {
    children: ReactNode;
    className?: string;
    color?: string;
    size?: number;
}

export function Spotlight({ children, className = "", color = "rgba(170, 169, 153, 0.15)", size = 300 }: SpotlightProps) {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            className={`relative overflow-hidden ${className}`}
        >
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    left: mouseX,
                    top: mouseY,
                    x: "-50%",
                    y: "-50%",
                    width: size,
                    height: size,
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                }}
            />
            <div className="relative">{children}</div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   18. AURORA BACKGROUND - Animated aurora effect
───────────────────────────────────────────────────────────── */
interface AuroraBackgroundProps {
    children: ReactNode;
    className?: string;
    colors?: string[];
}

export function AuroraBackground({ children, className = "", colors = ["#AAA999", "#8a8a7a", "#6a6a5a"] }: AuroraBackgroundProps) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            <div className="absolute inset-0">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(45deg, ${colors[0]}20, ${colors[1]}20, ${colors[2]}20, ${colors[0]}20)`,
                        backgroundSize: "400% 400%",
                    }}
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
                    style={{ background: colors[0] }}
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -50, 100, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-25"
                    style={{ background: colors[1] }}
                    animate={{
                        x: [0, -80, 40, 0],
                        y: [0, 60, -30, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            <div className="relative">{children}</div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   19. WAVE DECORATION - Animated wave SVG
───────────────────────────────────────────────────────────── */
interface WaveDecorationProps {
    className?: string;
    flip?: boolean;
    color?: string;
}

export function WaveDecoration({ className = "", flip = false, color = "var(--primary)" }: WaveDecorationProps) {
    return (
        <div className={`relative ${className}`}>
            <svg
                viewBox="0 0 1440 120"
                fill="none"
                className={`w-full h-auto ${flip ? "transform rotate-180" : ""}`}
                preserveAspectRatio="none"
            >
                <path
                    d="M0 120C120 120 120 60 240 60C360 60 360 120 480 120C600 120 600 60 720 60C840 60 840 120 960 120C1080 120 1080 60 1200 60C1320 60 1320 120 1440 120V0H0V120Z"
                    fill={color}
                    fillOpacity="0.05"
                />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   20. TEXT REVEAL - Animated text reveal on scroll
───────────────────────────────────────────────────────────── */
interface TextRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function TextReveal({ children, className = "", delay = 0 }: TextRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   21. BUTTON WRAPPER - Enhanced button with effects
───────────────────────────────────────────────────────────── */
interface EnhancedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
}

export function EnhancedButton({
    children,
    onClick,
    className = "",
    variant = "primary",
    size = "md"
}: EnhancedButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    const variants = {
        primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    };
    
    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden rounded-xl font-medium transition-all ${variants[variant]} ${sizes[size]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <motion.span
                className="relative z-10"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.span>
            <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: "-100%" }}
                animate={{ x: isHovered ? "0%" : "-100%" }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}
