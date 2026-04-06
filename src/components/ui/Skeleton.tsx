"use client";
import React from "react";

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`shimmer rounded-md ${className}`} />
    );
};

export const ProviderCardSkeleton = () => (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#ece9e0] shadow-sm">
        <div className="relative h-56 w-full shimmer" />
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
        </div>
    </div>
);

export const ItemCardSkeleton = () => (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#ece9e0] shadow-sm h-full">
        <div className="relative h-64 w-full shimmer" />
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-full" />
            <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        </div>
    </div>
);

export const ProfileHeaderSkeleton = () => (
    <div className="relative bg-[#f8f9fa]">
        {/* Banner Skeleton */}
        <div className="h-[300px] md:h-[400px] w-full shimmer opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10">
            <div className="bg-white rounded-xl border border-[#ece9e0] p-6 md:p-10 shadow-xl">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                    {/* Circle Logo Skeleton */}
                    <div className="relative -mt-24 md:-mt-32 shrink-0">
                        <Skeleton className="w-44 h-44 md:w-64 md:h-64 rounded-full border-[12px] md:border-[16px] border-white shadow-2xl" />
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-4 w-full text-center md:text-left">
                        <Skeleton className="h-10 md:h-14 w-3/4 mx-auto md:mx-0 rounded-2xl" />
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <Skeleton className="h-6 w-32 rounded-full" />
                            <Skeleton className="h-6 w-48 rounded-full" />
                        </div>
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="mt-12 flex gap-8 border-t border-slate-50 pt-8">
                    <Skeleton className="h-6 w-24 rounded-lg" />
                    <Skeleton className="h-6 w-24 rounded-lg" />
                    <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);
