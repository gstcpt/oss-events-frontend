"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal, Stagger, StaggerItem, TiltCard, ParticleField } from "@/components/ui/Motion3D";
import { motion } from "framer-motion";

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
        <section className="py-32 bg-[var(--background)] relative overflow-hidden">
            <ParticleField count={20} color="var(--primary)" />
            
            <div className="container mx-auto px-6 relative z-10">
                <Reveal className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-[var(--primary)] font-black tracking-[0.3em] text-[10px] uppercase mb-4 block">Our Team</span>
                    <h2 className="text-4xl md:text-6xl font-black text-[var(--footer)] mb-8 tracking-tighter leading-tight">{t('title')}</h2>
                    <p className="text-xl text-[#7a7a68] font-medium italic">{t('subtitle')}</p>
                </Reveal>

                <Stagger staggerDelay={0.15} className="grid md:grid-cols-3 gap-10">
                    {leaders.map((leader, index) => (
                        <StaggerItem key={index}>
                            <TiltCard intensity={10} glare className="h-full">
                                <div className="group bg-white overflow-hidden shadow-2xl shadow-black/5 border border-[#ece9e0] rounded-3xl h-full flex flex-col">
                                    <div className="h-[450px] relative overflow-hidden">
                                        <Image 
                                            src={leader.image} 
                                            alt={leader.name} 
                                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale hover:grayscale-0" 
                                            width={600} 
                                            height={800} 
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/default.jpg"; }}
                                        />
                                        
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--footer)] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700"></div>
                                        
                                        <div className="absolute bottom-0 left-0 w-full p-8 transform-gpu transition-transform duration-700">
                                            <motion.div 
                                                initial={{ y: 20, opacity: 0 }}
                                                whileInView={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <h3 className="text-3xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">{leader.name}</h3>
                                                <p className="text-[var(--primary)] font-black text-xs uppercase tracking-[0.2em] drop-shadow-md">{leader.role}</p>
                                            </motion.div>
                                        </div>
                                    </div>
                                    <div className="p-8 text-left bg-white flex-grow border-t border-[#ece9e0]/50">
                                        <p className="text-[#a1a194] leading-relaxed text-sm font-medium italic">"{leader.bio}"</p>
                                    </div>
                                </div>
                            </TiltCard>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </section>
    );
}