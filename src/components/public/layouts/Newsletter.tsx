import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
interface NewsletterProps {
    newsletterEmail: string;
    newsletterSuccess: boolean;
    newsletterError: string | null;
    setNewsletterEmail: (email: string) => void;
    handleNewsletterSubmit: (e: React.FormEvent) => void;
}
export default function Newsletter({ newsletterEmail, newsletterSuccess, newsletterError, setNewsletterEmail, handleNewsletterSubmit }: NewsletterProps) {
    const t = useTranslations('NewsletterSection');
    return (
        <section className="relative py-24 bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('/images/default-images/image-1.jpg')" }}></div>
            <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-900/95 to-slate-900"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-8 animate-bounce"><Mail size={32} /></div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">{t('title')}</h2>
                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">{t('subtitle')}</p>
                {newsletterSuccess ? (
                    <div className="max-w-lg mx-auto p-6 bg-green-500/20 border border-green-500/30 rounded-xl mb-6 animate-fade-in">
                        <p className="text-green-300 font-medium">🎉 {t('success')}</p>
                        <p className="text-green-400 text-sm mt-2">{t('welcome_msg')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto relative group animate-fade-in-up delay-200">
                        <div className="relative flex-1">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                            <Input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder={t('placeholder')} required
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/10 focus:border-transparent transition-all"
                            />
                        </div>
                        <Button type="submit" className="btn-primary py-4 px-8 text-lg group-hover:shadow-primary/40 whitespace-nowrap"><span>{t('button')}</span><Send size={18} className="ml-2" /></Button>
                    </form>
                )}
                {newsletterError && (<div className="max-w-lg mx-auto mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg animate-fade-in"><p className="text-red-300 text-sm">{t('error')}</p></div>)}
                <p className="mt-6 text-sm text-slate-500 animate-fade-in-up delay-300">{t('privacy')}</p>
            </div>
        </section>
    );
}