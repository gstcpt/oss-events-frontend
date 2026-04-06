'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
    className?: string;
    onShare?: () => void;
    iconOnly?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url, className, onShare, iconOnly }) => {
    const t = useTranslations("Interactions.share");
    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareData = {
            title,
            text,
            url: url || (typeof window !== 'undefined' ? window.location.href : ''),
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                if (onShare) onShare(); // Track share if needed
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast.success(t('linkCopied'));
                if (onShare) onShare();
            }
        } catch (error) {
            toast.error(t('errorSharing'));
        }
    };

    if (iconOnly) {
        return (
            <button
                onClick={handleShare}
                className={`flex items-center justify-center transition-all ${className || ''}`}
                aria-label={t('share')}
            >
                <Share2 className="h-5 w-5" />
            </button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className={`flex items-center gap-2 ${className || ''}`}
            aria-label={t('share')}
        >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('share')}</span>
        </Button>
    );
};
