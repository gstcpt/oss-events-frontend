import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }, { protocol: 'https', hostname: '**' }] },
    async rewrites() { return [{ source: "/api/:path*", destination: "http://localhost:3000/api/:path*" }]; },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);