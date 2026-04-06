'use client';

import { Locale, useLocale } from 'next-intl';
import { useState } from 'react';

type Props = {
    changeLocaleAction: (locale: Locale) => Promise<void>;
    isTransparent?: boolean;
};

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
];

export default function LocaleSwitcher({ changeLocaleAction, isTransparent = false }: Props) {
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-1 text-sm transition-all duration-300 group uppercase tracking-widest ${isTransparent ? 'text-white hover:text-white/80' : 'text-[#4A4A4A] font-semibold hover:text-[#4A4A4A]/80'}`}>{locale}</button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-3 right-0 w-24 bg-white border border-[#ece9e0] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                        {LANGUAGES.map((lang) => (
                            <button key={lang.code}
                                onClick={async () => {
                                    setIsOpen(false);
                                    await changeLocaleAction(lang.code as Locale);
                                }}
                                className={`flex items-center justify-center w-full px-4 py-2.5 text-xs transition-colors duration-150 ${locale === lang.code ? 'text-[var(--primary)] bg-[var(--background)]' : 'text-[#7a7a68] hover:bg-[var(--background)] hover:text-[var(--footer)]'}`}
                            >
                                <span className="uppercase tracking-widest">{lang.code}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}