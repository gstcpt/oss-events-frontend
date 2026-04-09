"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function GoToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => {if (window.pageYOffset > 300) {setIsVisible(true);} else {setIsVisible(false);}};
    const scrollToTop = () => {window.scrollTo({top: 0,behavior: "smooth",});};
    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => { window.removeEventListener("scroll", toggleVisibility); };
    }, []);
    return (
        <div className="fixed bottom-8 right-8 z-40">
            {isVisible && (
                <Button onClick={scrollToTop} className="bg-linear-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white font-bold rounded-full p-3 shadow-lg transition-transform transform hover:scale-110 border border-stone-300">
                    <ArrowUp size={24} />
                </Button>
            )}
        </div>
    );
}