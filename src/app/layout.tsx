import type { Metadata } from "next";
import { Poppins, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { EventCartProvider } from "@/context/EventCartContext";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { CompanyProvider } from '@/context/CompanyContext';
import { cache } from 'react';
import CustomCursor from "@/components/ui/CustomCursor";

const getCompanyId = cache(async () => {
    try {
        const headersList = await headers();
        const origin = headersList.get('host') || 'localhost';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${apiUrl}/public/home/company`, { headers: { origin }, next: { revalidate: 3600 }, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
            return data?.id || '1';
        }
    } catch (error) { console.error('Failed to fetch company:', error); }
    return '1';
});

const poppins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-poppins" });
const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600", "700", "800", "900"], variable: "--font-cairo" });

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    const companyId = await getCompanyId();
    return {
        title: t('title'),
        description: t('description'),
        keywords: t('keywords').split(',').map(k => k.trim()),
        authors: [{ name: t('author') }],
        icons: { icon: `/images/companies/${companyId}/favicon.ico`, shortcut: `/images/companies/${companyId}/favicon.ico`, apple: `/images/companies/${companyId}/favicon.ico` },
        openGraph: { title: t('title'), description: t('description'), type: "website" }
    };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const locale = await getLocale();
    const messages = await getMessages();
    const companyId = await getCompanyId();

    return (
        <AuthProvider>
            <EventCartProvider>
                <CompanyProvider companyId={companyId}>
                    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${poppins.variable} ${cairo.variable} font-sans ${locale === 'ar' ? 'font-arabic' : ''}`}>
                        <head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" /></head>
                        <body className="antialiased min-h-screen selection:bg-primary/30">
                            <CustomCursor />
                            <NextIntlClientProvider locale={locale} messages={messages}>
                                <div className="flex flex-col min-h-screen">
                                    {children}
                                </div>
                            </NextIntlClientProvider>
                            <Toaster position="top-right" richColors />
                        </body>
                    </html>
                </CompanyProvider>
            </EventCartProvider>
        </AuthProvider>
    );
}