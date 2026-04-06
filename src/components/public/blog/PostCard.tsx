"use client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Star, ChevronRight } from "lucide-react";
import { Blog } from "@/types/public/blogs";

interface PostCardProps {
    post: any;
    index: number;
    t: any;
    tCommon: any;
    viewType?: 'grid' | 'list';
}

export default function PostCard({ post, index, t, tCommon, viewType = 'grid' }: PostCardProps) {
    if (viewType === 'list') {
        return (
            <Link href={`/blogs/${post.id}`} className="group block h-full">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl hover:shadow-[var(--primary)]/15 transition-all duration-500 overflow-hidden border border-[#ece9e0] hover:border-[var(--primary)]/30 h-full flex flex-col md:flex-row">
                    {/* Image Container */}
                    <div className="md:w-2/5 m-3 rounded-xl overflow-hidden relative aspect-[16/10] md:aspect-auto">
                        <Image
                            src={post.image || "/images/default.jpg"}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/images/default.jpg"; }}
                        />
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[var(--primary)] text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wider">
                                {post.categories?.[0] || t("blog_post")}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-4 text-[10px] text-[#7a7a68] mb-4 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[var(--primary)]" /> {post.date ? new Date(post.date).toLocaleDateString() : t("unknown_date")}</span>
                                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[var(--primary)]" /> {post.author?.name || t("anonymous")}</span>
                            </div>
                            <h2 className="text-xl font-bold text-[var(--footer)] mb-4 group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-tight">{post.title}</h2>
                            <p className="text-[#a1a194] text-sm mb-6 line-clamp-3 leading-relaxed">{post.content?.substring(0, 150) || ""}...</p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-[#ece9e0]">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--footer)]">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    {(Number(post.rating) || 0).toFixed(1)}
                                </div>
                                <span className="text-[10px] font-bold text-[#a1a194]">({(post.reviewCount || 0)} {t("reviews")})</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300 shadow-sm shadow-black/5 hover:translate-x-1">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/blogs/${post.id}`} className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 border border-[#ece9e0] h-full flex flex-col p-5">
                {/* Image Section */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-6">
                    <Image
                        src={post.image?.startsWith('/') ? post.image : `/images/default-images/${post.image || 'home/home-blog-post-1.jpg'}`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/default.jpg"; }}
                    />
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-[var(--footer)] text-xl leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                            {post.title}
                        </h3>
                        <div className="bg-emerald-500 rounded-full p-1 shrink-0">
                            <Calendar className="w-2.5 h-2.5 text-white" />
                        </div>
                    </div>

                    <p className="text-[#a1a194] text-sm leading-relaxed line-clamp-2 mb-8">
                        {post.content?.substring(0, 100) || post.excerpt || t("no_description_provided")}
                    </p>

                    {/* Footer Section */}
                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                {Number(post.rating || 0).toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {post.reviewCount || 0}
                            </div>
                        </div>

                        <div className="px-5 py-2.5 bg-slate-50 rounded-full text-[10px] font-bold text-[var(--footer)] uppercase tracking-wider group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                            {tCommon("read_article")} +
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
