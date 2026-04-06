import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Leadership() {
    const t = useTranslations('Leadership');
    const leaders = [
        {
            name: t('leader1Name'),
            role: t('leader1Role'),
            bio: t('leader1Desc'),
            image: "/images/default-images/team-members/member-1.jpg"
        },
        {
            name: t('leader2Name'),
            role: t('leader2Role'),
            bio: t('leader2Desc'),
            image: "/images/default-images/team-members/member-2.jpg"
        },
        {
            name: t('leader3Name'),
            role: t('leader3Role'),
            bio: t('leader3Desc'),
            image: "/images/default-images/team-members/member-3.jpg"
        }
    ];
    return (
        <section className="section-padding bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/50/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{t('title')}</h2>
                    <p className="text-lg text-slate-600">{t('subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {leaders.map((leader, index) => (
                        <div key={index} className="card group hover:-translate-y-2 bg-white overflow-hidden shadow-lg border-0 rounded-2xl">
                            <div className="h-96 relative overflow-hidden">
                                <Image src={leader.image} alt={leader.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" width={500} height={500} />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-2xl font-bold text-white mb-1">{leader.name}</h3>
                                    <p className="text-primary font-medium mb-3">{leader.role}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-white"><p className="text-slate-600 leading-relaxed">{leader.bio.replace("OSS Events", "OSS Events")}</p></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}