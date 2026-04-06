"use client";
import { useEffect, useState } from "react";
import { getUserHistory } from "@/lib/api/interactions";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, Star, Eye, Calendar, ArrowRight, Filter, ShoppingBag, FileText, Layers, Building2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function UserInteractionsPage() {
    const t = useTranslations('Dashboard.interactions');
    const { user } = useAuth();
    const [interactions, setInteractions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getUserHistory();
                setInteractions(data || []);
            } catch (error) {
                toast.error(t('errorLoadingHistory'));
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredInteractions = interactions.filter(i => {
        if (filter === 'ALL') return true;
        // Handle comments which might have type 'COMMENT' (manually set in backend)
        const type = (i.type || '').toUpperCase();
        return type === filter;
    });

    const getIcon = (type: string) => {
        switch ((type || '').toUpperCase()) {
            case 'LIKE': return <ThumbsUp className="w-5 h-5 text-blue-500" />;
            case 'DISLIKE': return <ThumbsDown className="w-5 h-5 text-red-500" />;
            case 'FAVORITE': return <Heart className="w-5 h-5 text-pink-500 fill-current" />;
            case 'RATING': return <Star className="w-5 h-5 text-yellow-500 fill-current" />;
            case 'COMMENT': return <MessageCircle className="w-5 h-5 text-green-500" />;
            default: return <Eye className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTargetIcon = (targetType: string) => {
        switch ((targetType || '').toUpperCase()) {
            case 'ITEM': return <ShoppingBag className="w-4 h-4" />;
            case 'BLOG': return <FileText className="w-4 h-4" />;
            case 'CATEGORY': return <Layers className="w-4 h-4" />;
            case 'PROVIDER': return <Building2 className="w-4 h-4" />;
            default: return <Star className="w-4 h-4" />;
        }
    };

    const getActionLabel = (type: string) => {
        const actionType = (type || '').toLowerCase();
        switch (actionType) {
            case 'like': return t('actions.like');
            case 'dislike': return t('actions.dislike');
            case 'favorite': return t('actions.favorite');
            case 'rating': return t('actions.rating');
            case 'comment': return t('actions.comment');
            default: return t('actions.default');
        }
    };

    const getLink = (interaction: any) => {
        const type = (interaction.target_type || '').toUpperCase();
        if (type === 'ITEM') return `/items/${interaction.target_id}`;
        if (type === 'BLOG') return `/blogs/${interaction.target_id}`;
        // Categories and Providers linking
        if (type === 'CATEGORY') return `/categories/${interaction.target_id}`; // Assumption
        if (type === 'PROVIDER') return `/providers/${interaction.target_id}`; // Assumption
        return '#';
    };

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'Unknown date';
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="space-y-8 container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">{t('subtitle')}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['ALL', 'LIKE', 'DISLIKE', 'FAVORITE', 'RATING', 'COMMENT'].map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(f)}
                            className={cn(
                                "capitalize rounded-full px-4 transition-all",
                                filter === f ? "shadow-md" : "hover:bg-gray-100"
                            )}
                        >
                            {t(`filters.${f.toLowerCase()}`)}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">{t('loading')}</p>
                </div>
            ) : filteredInteractions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{t('noActivities')}</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">{t('noActivitiesDesc')}</p>
                    <div className="mt-8">
                        <Link href="/items">
                            <Button size="lg" className="rounded-full px-8">{t('exploreNow')}</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="relative pl-8 md:pl-0">
                    {/* Vertical Line for Desktop */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2"></div>
                    {/* Vertical Line for Mobile */}
                    <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

                    <div className="space-y-12">
                        {filteredInteractions.map((interaction, index) => {
                            const target = interaction.target;
                            const isDeleted = !target;
                            const targetImage = target?.image || target?.cover || '/images/default.jpg';
                            const link = getLink(interaction);
                            const isDesktopRight = index % 2 === 0; // Alternating layout for desktop

                            return (
                                <div key={interaction.id || index} className={cn(
                                    "relative flex md:items-center gap-8",
                                    isDesktopRight ? "md:flex-row-reverse" : "md:flex-row"
                                )}>
                                    {/* Timeline Date/Time - Desktop Side */}
                                    <div className="hidden md:block w-1/2 text-right px-4">
                                        <div className={cn("text-sm text-gray-400 font-medium", !isDesktopRight && "text-left")}>
                                            {formatDate(interaction.created_at)}
                                        </div>
                                    </div>

                                    {/* Center Icon Node */}
                                    <div className="absolute left-0 md:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center transform md:-translate-x-1/2 z-10">
                                        {getIcon(interaction.type)}
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-full md:w-1/2 pl-8 md:pl-0 md:px-4">
                                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                            {/* Mobile Date */}
                                            <div className="md:hidden text-xs text-gray-400 mb-2 font-medium">
                                                {formatDate(interaction.created_at)}
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                                                    {getTargetIcon(interaction.target_type)}
                                                    {t(`targets.${interaction.target_type.toUpperCase()}`)}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {getActionLabel(interaction.type)}
                                                </span>
                                            </div>

                                            {isDeleted ? (
                                                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                                                    <p className="text-gray-400 text-sm italic">{t('contentUnavailable')}</p>
                                                </div>
                                            ) : (
                                                <Link href={link} className="block">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                                            <Image
                                                                src={targetImage.startsWith('/') ? targetImage : `/${targetImage}`}
                                                                alt={target.title || "Content"}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                                {target.title}
                                                            </h4>
                                                            {target.description && (
                                                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                                                    {target.description}
                                                                </p>
                                                            )}
                                                            {interaction.type === 'COMMENT' && interaction.content && (
                                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border border-gray-100 relative">
                                                                    <MessageCircle className="w-4 h-4 text-gray-300 absolute -top-2 left-3 bg-gray-50 px-0.5" />
                                                                    "{interaction.content}"
                                                                </div>
                                                            )}
                                                            {interaction.value && (
                                                                <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                                                                    <Star className="w-3 h-3 fill-current" />
                                                                    {interaction.value}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="self-center pl-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}