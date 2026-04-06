"use client";
import React, { useState } from "react";
import { Facebook, Phone, Twitter, Palette, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
interface SocialShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    blogTitle: string;
    blogUrl: string;
    blogImage?: string;
}
export const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose, blogTitle, blogUrl, blogImage }) => {
    const t = useTranslations('Components.socialShare');
    const [copied, setCopied] = useState(false);
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(blogUrl)}&text=${encodeURIComponent(blogTitle)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${blogTitle} - ${blogUrl}`)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(blogUrl)}&media=${encodeURIComponent(blogImage || '')}&description=${encodeURIComponent(blogTitle)}`
    };
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(blogUrl);
            setCopied(true);
            toast.success(t('link_copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { toast.error(t('copy_failed')); }
    };
    const handleSocialShare = (platform: keyof typeof shareUrls) => {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        onClose();
    };
    const shareOptions = [
        { name: t('facebook'), icon: Facebook, color: "bg-blue-600 hover:bg-blue-700", action: () => handleSocialShare('facebook') },
        { name: t('twitter'), icon: Twitter, color: "bg-black hover:bg-gray-800", action: () => handleSocialShare('twitter') },
        { name: t('whatsapp'), icon: Phone, color: "bg-green-500 hover:bg-green-600", action: () => handleSocialShare('whatsapp') },
        { name: t('pinterest'), icon: Palette, color: "bg-red-600 hover:bg-red-700", action: () => handleSocialShare('pinterest') },
        { name: t('copy_link'), icon: copied ? Check : Copy, color: "bg-slate-600 hover:bg-slate-700", action: handleCopyLink }
    ];
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('title')} showCloseButton={true} widthClass="max-w-md">
            <div className="p-6">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{blogTitle}</h3>
                    <p className="text-slate-600 text-sm">{t('subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {shareOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <Button key={option.name} onClick={option.action} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${option.color} text-white shadow-md hover:shadow-lg`}>
                                <IconComponent className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">{option.name}</span>
                            </Button>
                        );
                    })}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200"><p className="text-xs text-slate-500 text-center">{t('sharing_note')}</p></div>
            </div>
        </Modal>
    );
};