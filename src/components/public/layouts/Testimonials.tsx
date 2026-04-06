import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Testimonials() {
    const t = useTranslations("Home.testimonials");

    const testimonials = [
        {
            name: t("sarah.name"),
            rating: 5,
            text: t("sarah.text"),
            avatar: "/images/default-images/team-members/member-1.jpg",
            role: t("sarah.role"),
        },
        {
            name: t("michael.name"),
            rating: 5,
            text: t("michael.text"),
            avatar: "/images/default-images/team-members/member-2.jpg",
            role: t("michael.role"),
        },
        {
            name: t("emily.name"),
            rating: 5,
            text: t("emily.text"),
            avatar: "/images/default-images/team-members/member-3.jpg",
            role: t("emily.role"),
        },
    ];

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform origin-top-right"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-slate-200/50 rounded-full blur-3xl"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-sm font-bold text-primary tracking-widest  mb-3">{t("badge")}</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("title")}</h3>
                    <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">{t("subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} style={{ animationDelay: `${index * 150}ms` }} className="card p-8 hover:shadow-2xl transition-all duration-500 group animate-fade-in-up opacity-0 fill-mode-forwards bg-white">
                            <div className="relative mb-8">
                                <Quote className="absolute -top-4 -left-4 text-primary/10 w-12 h-12 group-hover:text-primary/20 transition-colors" />
                                <p className="text-slate-700 leading-relaxed italic relative z-10">"{testimonial.text}"</p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                                <div className="relative">
                                    <Image src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md group-hover:scale-110 transition-transform duration-300" width={50} height={50} />
                                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-white shadow-sm"><Star size={10} className="text-white fill-white" /></div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{testimonial.name}</h4>
                                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                                    <div className="flex gap-0.5 mt-1">{[...Array(testimonial.rating)].map((_, i) => (<Star key={i} size={12} className="text-amber-400 fill-amber-400" />))}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}