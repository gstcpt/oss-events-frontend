import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    widthClass?: string;
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, widthClass = "max-w-3xl", showCloseButton = true }) => {
    const modalContentRef = useRef<HTMLDivElement>(null);
    const modalBackdropRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { onClose(); } };
        const handleClickOutside = (event: MouseEvent) => { if (modalBackdropRef.current === event.target) { onClose(); } };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div ref={modalBackdropRef} className="fixed inset-0 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] flex items-start justify-center p-4" style={{ backgroundColor: "#00000045" }}>
            <div ref={modalContentRef} className={`relative flex flex-col w-full ${widthClass} shadow-2xl rounded-xl bg-white text-slate-900 my-auto animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}>
                {showCloseButton && (
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
                        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                        <Button onClick={onClose} variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>
                )}
                {!showCloseButton && title && (
                    <div className="px-6 py-4 border-b border-slate-100 shrink-0">
                        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    </div>
                )}
                <div className="flex flex-col flex-1 overflow-hidden p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;