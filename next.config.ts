import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: '**' }
        ]
    },
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

        // When deploying to Vercel, this rewrite allows the client to call /api/... 
        // and have it proxied to the backend, avoiding CORS issues.
        // We strip /api from the destination if it's already included in apiUrl
        // or we handle it based on how the backend expect calls.

        return [
            {
                source: "/api/:path*",
                // We use the full API URL here. 
                // Note: If NEXT_PUBLIC_API_URL has /api at the end, 
                // we should ensure we don't double it.
                destination: apiUrl.endsWith('/api')
                    ? `${apiUrl}/:path*`
                    : `${apiUrl}/api/:path*`
            }
        ];
    },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);