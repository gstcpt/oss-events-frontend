"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Share2, Heart, MessageCircle, Loader2, Star, Eye, Image as ImageIcon, TrendingUp, ThumbsUp, MessageSquare } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getBlog, checkBlogLike, getBlogComments, getBlogAverageRating, getUserRatingForBlog, getRelatedBlogs, trackBlogShare } from "@/lib/api/public/blogs";
import { BlogDetail, BlogComment, FeaturedBlog } from "@/types/public/blogs";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import MediaGallery from "@/components/ui/MediaGallery";
import { SocialShareModal } from "@/components/SocialShareModal";
import { ReactionButtons } from "@/components/interactions/ReactionButtons";
import { RatingStars } from "@/components/interactions/RatingStars";
import { CommentSection } from "@/components/interactions/CommentSection";
import { FavoriteButton } from "@/components/interactions/FavoriteButton";
import { ShareButton } from "@/components/interactions/ShareButton";
import { useViewTracker } from "@/lib/tracking/view-tracker";
import Link from "next/link";
import PostCard from "@/components/public/blog/PostCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollProgressBar, TiltCard, Reveal, Stagger, StaggerItem, Floating, ParticleField, CountUp } from "@/components/ui/Motion3D";

export default function BlogPost() {
    const t = useTranslations("BlogPostPage");
    const tCommon = useTranslations("Common");
    const router = useRouter();
    const [blog, setBlog] = useState<BlogDetail | null>(null);
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [sharesCount, setSharesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [relatedBlogs, setRelatedBlogs] = useState<FeaturedBlog[]>([]);
    const [relatedBlogsLoading, setRelatedBlogsLoading] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);

    const params = useParams();
    const { user } = useAuth();
    const blogId = parseInt(params.id as string);

    // Track views
    useViewTracker("blogs", blogId);

    const [liveViews, setLiveViews] = useState<number>(0);
    const [liveStatsLoading, setLiveStatsLoading] = useState(false);

    const fetchBlogData = useCallback(async () => {
        if (!blogId) return;
        setLoading(true);
        try {
            const [blogData, commentsData, avgRatingData] = await Promise.all([
                getBlog(blogId),
                getBlogComments(blogId),
                getBlogAverageRating(blogId)
            ]);
            setBlog(blogData);
            setLikesCount(blogData.likes);
            setSharesCount(blogData.shares);
            setComments(Array.isArray(commentsData) ? commentsData : []);
            setAverageRating(avgRatingData.averageRating);
            setReviewCount(avgRatingData.reviewCount);
        } catch (err) {
            toast.error(t("error"));
            setError(t("error"));
        } finally {
            setLoading(false);
        }
    }, [blogId, t]);

    const fetchLiveStats = useCallback(async () => {
        if (!blogId) return;
        setLiveStatsLoading(true);
        try {
            const { audienceApi } = require("@/lib/api/rapports");
            const statsResp = await audienceApi.getAudienceStats({ resourceType: "blogs", resourceId: blogId });
            if (statsResp?.success && statsResp.data) {
                setLiveViews(statsResp.data.pageViews);
            }
        } catch (err) {
            console.error("Failed to fetch live blog stats:", err);
        } finally {
            setLiveStatsLoading(false);
        }
    }, [blogId]);

    useEffect(() => {
        fetchBlogData();
        fetchLiveStats();
        // Set interval to refresh stats every 30 seconds
        const interval = setInterval(fetchLiveStats, 30000);
        return () => clearInterval(interval);
    }, [fetchBlogData, fetchLiveStats]);

    const fetchRelatedBlogs = useCallback(async () => {
        if (!blogId) return;
        setRelatedBlogsLoading(true);
        try {
            const related = await getRelatedBlogs(blogId, 4);
            setRelatedBlogs(related);
        } catch (err) {
            toast.error("Failed to fetch related blogs");
        } finally {
            setRelatedBlogsLoading(false);
        }
    }, [blogId]);

    const checkUserSpecificData = useCallback(async () => {
        if (user && blogId) {
            try {
                const [likeStatus, userRatingData] = await Promise.all([
                    checkBlogLike(blogId),
                    getUserRatingForBlog(blogId)
                ]);
                setLiked(likeStatus.liked);
                setUserRating(userRatingData.rating);
            } catch (err) {
                if (err instanceof Error && !err.message.includes("timeout")) {
                    toast.error("Failed to check user-specific data");
                }
            }
        }
    }, [user, blogId]);

    useEffect(() => {
        if (blogId) { fetchRelatedBlogs(); }
    }, [blogId, fetchRelatedBlogs]);

    useEffect(() => {
        if (user) { checkUserSpecificData(); }
    }, [user, checkUserSpecificData]);

    const handleShare = async () => {
        setShareModalOpen(true);
        try {
            await trackBlogShare(blogId, "web");
            setSharesCount((prev) => prev + 1);
        } catch (err) {
            toast.error("Failed to increment share count");
        }
    };

    const handleLoginSuccess = async () => {
        try { await checkUserSpecificData(); } catch { toast.error("Failed to refresh user data (non-critical)."); }
        setLoginModalOpen(false);
    };

    const stats = useMemo(() => ({
        views: liveViews || blog?.views || 0,
        likes: likesCount || 0,
        shares: sharesCount || 0,
        comments: (Array.isArray(comments) ? comments.length : 0)
    }), [blog?.views, liveViews, likesCount, sharesCount, comments]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4" />
                    <p className="text-[#7a7a68]">{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-[#7a7a68] mb-4">{error || t("not_found")}</p>
                    <Button onClick={() => window.history.back()} className="px-4 py-2 bg-[#3a3a2e] text-white rounded-lg hover:bg-[var(--primary)] transition-colors">
                        {t("back")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <ScrollProgressBar />
            <LoginModal
                redirectTo="/dashboard"
                onLoginSuccess={handleLoginSuccess}
                isOpen={isLoginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />

            <SocialShareModal
                isOpen={isShareModalOpen}
                onClose={() => setShareModalOpen(false)}
                blogTitle={blog.title}
                blogUrl={typeof window !== "undefined" ? window.location.href : ""}
                blogImage={blog.image || ""}
            />

            {/* HERO SECTION – parallax zoom */}
            <div className="relative h-[70vh] min-h-[520px] flex items-center justify-center overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Image
                        src={blog.image || "/images/default.jpg"}
                        fill
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        priority
                    />
                </motion.div>
                <div className="absolute inset-0 bg-[#0a0a05]/50 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a05]/60 via-transparent to-[var(--background)]" />
                <ParticleField count={12} color="var(--primary)" />

                {/* Back + actions */}
                <div className="absolute top-32 left-6 right-6 md:left-12 md:right-12 z-50 flex justify-between items-center pointer-events-none">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        onClick={() => router.back()}
                        className="group pointer-events-auto flex items-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all duration-500 shadow-2xl"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">{t("back")}</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="pointer-events-auto flex items-center gap-3"
                    >
                        <ShareButton title={blog.title} onShare={handleShare} className="bg-white/10 backdrop-blur-2xl border-white/20 text-white hover:bg-white hover:text-primary transition-all duration-500" />
                        <FavoriteButton targetType="BLOG" targetId={blogId} isFavorite={liked} onFavoriteToggle={checkUserSpecificData} onDark={true} className="bg-white/10 backdrop-blur-2xl border-white/20 transition-all duration-500" />
                    </motion.div>
                </div>

                {/* Hero title */}
                <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-3xl md:text-5xl font-bold drop-shadow-2xl tracking-tighter leading-tight"
                    >
                        {blog.title}
                    </motion.h1>
                </div>
            </div>

            <main className="container mx-auto px-4 -mt-32 relative pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        <motion.article
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-2xl shadow-2xl shadow-black/5 border border-[#ece9e0] p-10 md:p-14 overflow-hidden relative"
                        >
                            <div className="mb-12">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                                    <Calendar className="w-4 h-4" />
                                    {t("published")} {new Date(blog.date || blog.created_at).toLocaleDateString()}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[var(--footer)] mb-6 tracking-tighter leading-[1.1]">{blog.title}</h1>

                                <div className="flex flex-wrap items-center gap-8 pb-12 border-b border-[#ece9e0]">
                                    <div className="flex items-center gap-5">
                                        {blog.author?.avatar
                                            ? (<Image src={blog.author.avatar} alt={blog.author.name} width={60} height={60} className="rounded-xl ring-4 ring-[var(--background)] shadow-lg" />)
                                            : (<div className="w-14 h-14 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg"><User className="w-8 h-8 text-white" /></div>)
                                        }
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-[0.3em]">Written By</p>
                                            <p className="text-xl font-bold text-[var(--footer)] tracking-tight">{blog.author?.name || "Team Axia"}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 hidden md:block"></div>

                                    <div className="flex items-center gap-10">
                                        <div className="space-y-1 text-center">
                                            <p className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-[0.2em]">{t("views")}</p>
                                            <p className="text-2xl font-bold text-[var(--footer)] tabular-nums">{stats.views}</p>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <p className="text-[10px] font-bold text-[#7a7a68] uppercase tracking-[0.2em]">{t("comments")}</p>
                                            <p className="text-2xl font-bold text-[var(--footer)] tabular-nums">{comments.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="prose prose-base md:prose-lg max-w-none mb-12">
                                <div
                                    className="text-[var(--footer)] leading-relaxed text-lg space-y-6 font-medium opacity-90"
                                    dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, "<br>") }}
                                />
                            </div>

                            {/* Tags & Bottom Interactions */}
                            <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-[#ece9e0]">
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags?.map((tag) => (
                                        <span key={tag} className="px-5 py-2.5 bg-[var(--background)] hover:bg-[#ece9e0] text-[#7a7a68] rounded-2xl text-xs font-bold transition-all cursor-pointer border border-[#ece9e0] uppercase tracking-wider">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4">
                                    <ReactionButtons targetType="BLOG" targetId={blogId} />
                                    <Button
                                        onClick={handleShare}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#3a3a2e] hover:bg-[var(--primary)] text-white rounded-full transition-all duration-500 hover:scale-105 shadow-xl shadow-black/10"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span className="font-bold uppercase text-[10px] tracking-widest">{t("share")}</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Media Gallery Section */}
                            {blog.media && blog.media.length > 0 && (
                                <div className="mt-16 pt-12 border-t border-[#ece9e0]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-bold text-[var(--footer)] flex items-center gap-3 uppercase tracking-tight">
                                            <ImageIcon className="w-6 h-6 text-[var(--primary)]" />
                                            {t("media_gallery")}
                                            <span className="text-[#7a7a68]/40 font-bold ml-2">({blog.media.length})</span>
                                        </h3>
                                    </div>
                                    <MediaGallery media={blog.media} moreLabel={t("more")} galleryLabel={t("gallery") || "Gallery"} />
                                </div>
                            )}
                        </motion.article>

                        {/* Comments Section */}
                        <div className="bg-white rounded-2xl shadow-2xl shadow-black/5 border border-[#ece9e0] p-10 md:p-14">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-bold text-[var(--footer)] uppercase tracking-tight">{t("community_discussion")}</h2>
                                <div className="px-4 py-2 bg-[var(--background)] rounded-full text-xs font-bold text-[var(--primary)] border border-[#ece9e0]">
                                    {comments.length} {t("comments")}
                                </div>
                            </div>
                            <CommentSection targetType="BLOG" targetId={blogId} />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
                        {/* Community Rating */}
                        <Reveal direction="left" delay={0.2}>
                        <TiltCard intensity={6}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8 transition-all duration-500 hover:shadow-2xl">
                            <h3 className="text-base font-bold text-[var(--footer)] mb-6 flex items-center gap-3 uppercase tracking-tight">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                {t("community_rating")}
                            </h3>
                            <RatingStars targetType="BLOG" targetId={blogId} />
                        </div>
                        </TiltCard>
                        </Reveal>

                        {/* Post Insights */}
                        <Reveal direction="left" delay={0.3}>
                        <TiltCard intensity={5}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8 transition-all duration-500 hover:shadow-2xl">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1.5 h-6 rounded-full bg-[var(--primary)]" />
                                <h2 className="text-xl font-bold text-[var(--footer)] uppercase tracking-tight">{t("post_insights")}</h2>
                            </div>

                            <Stagger staggerDelay={0.1} className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Eye, value: stats.views, label: tCommon("views"), color: "text-sky-500", bg: "bg-sky-50" },
                                    { icon: ThumbsUp, value: stats.likes, label: tCommon("likes"), color: "text-emerald-500", bg: "bg-emerald-50" },
                                    { icon: MessageSquare, value: stats.comments, label: tCommon("comments"), color: "text-violet-500", bg: "bg-violet-50" },
                                    { icon: Share2, value: stats.shares, label: tCommon("shares"), color: "text-amber-500", bg: "bg-amber-50" }
                                ].map((stat, idx) => (
                                    <StaggerItem key={idx}>
                                        <motion.div whileHover={{ scale: 1.04, y: -2 }} className="group/stat flex flex-col items-center justify-center p-6 rounded-xl bg-[var(--background)] border border-[#ece9e0] hover:border-[var(--primary)]/30 transition-all duration-300 cursor-default">
                                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3 group-hover/stat:scale-110 transition-transform`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-2xl font-bold text-[var(--footer)] tabular-nums tracking-tight"><CountUp target={stat.value} /></span>
                                            <span className="text-[9px] font-bold text-[#7a7a68] uppercase tracking-[0.2em] mt-2 whitespace-nowrap">{stat.label}</span>
                                        </motion.div>
                                    </StaggerItem>
                                ))}
                            </Stagger>
                        </div>
                        </TiltCard>
                        </Reveal>

                        {/* Content Tags / Categories */}
                        <Reveal direction="left" delay={0.4}>
                        <div className="bg-white rounded-xl shadow-xl shadow-black/5 border border-[#ece9e0] p-8 transition-all duration-500 hover:shadow-2xl">
                            <h3 className="text-xl font-bold text-[var(--footer)] mb-8 uppercase tracking-tight">{t("content_tags")}</h3>

                            {blog.categories && blog.categories.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-[10px] font-bold text-[#7a7a68] mb-4 uppercase tracking-[0.2em]">{t("categories")}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {blog.categories.map((category) => (
                                            <span
                                                key={category}
                                                className="px-5 py-2.5 bg-[#3a3a2e] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-xl hover:bg-[var(--primary)] transition-all duration-500 cursor-pointer hover:scale-105 uppercase tracking-widest border border-white/5"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-[10px] font-bold text-[#7a7a68] mb-4 uppercase tracking-[0.2em]">{t("tags")}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags?.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-4 py-2 bg-[var(--background)] hover:bg-[#ece9e0] text-[#7a7a68] rounded-2xl text-[10px] font-bold cursor-pointer hover:scale-105 transition-all border border-[#ece9e0] uppercase tracking-wider"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </Reveal>
                    </div>
                </div>

                {/* Related Articles Section */}
                {relatedBlogs.length > 0 && (
                    <section className="mt-20">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-4xl font-bold text-[var(--footer)] flex items-center gap-4 uppercase tracking-tighter">
                                <TrendingUp className="w-8 h-8 text-[var(--primary)]" />
                                {t("related_articles")}
                            </h2>
                            <Link href="/blogs" className="text-sm font-bold text-[var(--primary)] hover:underline uppercase tracking-[0.2em]">
                                Explore All Blogs
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedBlogs.map((related, idx) => (
                                <motion.div
                                    key={related.id}
                                    initial={{ opacity: 0, y: 30, rotateX: -8 }}
                                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ perspective: 600 }}
                                >
                                    <PostCard
                                        post={related as any}
                                        index={idx}
                                        t={t}
                                        tCommon={tCommon}
                                        viewType="grid"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}