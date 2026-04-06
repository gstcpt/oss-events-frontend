"use client";
import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
    category: any;
    className?: string;
    idx?: number;
    t?: any;
    tCommon?: any;
}

export default function CategoryCard({ category, className, idx, t, tCommon }: CategoryCardProps) {
    return (
        <Link
            href={`/items?category=${category.id}`}
            className={`block group bg-white rounded-2xl transition-all duration-500 h-full flex flex-col overflow-hidden ${className}`}
        >
            {/* Image */}
            <div className="relative overflow-hidden aspect-[3/4] bg-[#ece9e0]">
                <Image
                    src={category.image?.startsWith('/') ? category.image : `/images/default-images/${category.image || 'home/category.jpg'}`}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/default.jpg"; }}
                />
            </div>
            {/* Info */}
            <div className="px-6 pb-6 pt-5 text-left flex-grow flex flex-col justify-end bg-white">
                <h3 className="font-bold text-[#4A4A4A] text-[22px] group-hover:text-[#AAA999] transition-colors leading-tight line-clamp-1 mb-1">{category.title}</h3>
                <p className="text-[#a1a194] text-[14px]">
                    {category.item_category?.length || 0} {tCommon ? (category.item_category?.length === 1 ? tCommon("service") : tCommon("services")) : (t ? (category.item_category?.length === 1 ? t("service") : t("services")) : "Services")}
                </p>
            </div>
        </Link>
    );
}
