"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Footer from "@/components/public/layouts/Footer";
import Header from "@/components/public/layouts/Header";
import GoToTop from "@/components/public/layouts/GoToTop";
import { audienceApi } from "@/lib/api/rapports";

/**
 * AudienceTracker — isolated to its own component so that useSearchParams
 * (which is unstable in Next.js 15 App Router) does NOT live in the main
 * PublicLayout render cycle and cannot cause layout re-renders.
 *
 * The lastTrackedRef guard prevents double-firing in React 19 StrictMode.
 */
function AudienceTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTrackedRef = useRef<string>("");

    useEffect(() => {
        // Gate: only fire when the URL actually changes
        const key = pathname + "?" + searchParams.toString();
        if (lastTrackedRef.current === key) return;
        lastTrackedRef.current = key;

        const clientIdKey = "aud_client_id";
        const visitorIdKey = "aud_visitor_id";
        const sessionUuidKey = "aud_session_uuid";
        const sessionIdKey = "aud_session_id";
        const genUuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

        const submit = async () => {
            const allowed = ['', 'about', 'blogs', 'categories', 'contact', 'createEvent', 'faq', 'items', 'privacy-policy', 'providers', 'terms-conditions'];
            const seg = (pathname || window.location.pathname).split('/').filter(Boolean)[0] || '';
            if (!allowed.includes(seg)) return;

            let clientId = localStorage.getItem(clientIdKey) || "";
            if (!clientId) {
                clientId = crypto?.randomUUID?.() || genUuid();
                localStorage.setItem(clientIdKey, clientId);
            }
            const userAgent = navigator.userAgent;
            const device = /Mobi|Android/i.test(userAgent) ? "Mobile" : "Desktop";
            const browser = (() => {
                if (userAgent.includes("Chrome")) return "Chrome";
                if (userAgent.includes("Firefox")) return "Firefox";
                if (userAgent.includes("Safari")) return "Safari";
                return "Other";
            })();
            const locale = navigator.language;

            let visitorId = Number(localStorage.getItem(visitorIdKey) || 0);
            if (!visitorId) {
                const vres = await audienceApi.createVisitor({ clientId, userAgent, device, os: "", browser, locale, ipHash: undefined });
                if (vres?.success && (vres as any).data?.id) {
                    visitorId = Number((vres as any).data.id);
                    localStorage.setItem(visitorIdKey, String(visitorId));
                }
            }

            let sessionUuid = localStorage.getItem(sessionUuidKey) || "";
            if (!sessionUuid) {
                sessionUuid = crypto?.randomUUID?.() || genUuid();
                localStorage.setItem(sessionUuidKey, sessionUuid);
            }
            let sessionId = Number(localStorage.getItem(sessionIdKey) || 0);
            if (!sessionId) {
                const sres = await audienceApi.createSession({
                    visitorId, sessionUuid,
                    entryUrl: window.location.href,
                    entryResource: undefined,
                    entryResourceId: undefined,
                    referrer: document.referrer || undefined
                });
                if (sres?.success && (sres as any).data?.id) {
                    sessionId = Number((sres as any).data.id);
                    localStorage.setItem(sessionIdKey, String(sessionId));
                }
            }

            const queryObj: Record<string, any> = {};
            searchParams.forEach((v, k) => { queryObj[k] = v; });

            let resourceType: string | undefined;
            let resourceId: number | undefined;
            const parts = pathname.split("/").filter(Boolean);
            if (parts.length >= 2) {
                const [seg2, id] = parts;
                if (["items", "providers", "categories", "blogs"].includes(seg2)) {
                    resourceType = seg2;
                    const n = Number(id);
                    resourceId = Number.isFinite(n) ? n : undefined;
                }
            }

            // Fire-and-forget — do NOT await
            audienceApi.createPageView({
                sessionId, visitorId, userId: undefined, resourceType, resourceId,
                path: pathname, title: document.title || undefined, query: queryObj,
                interactions: 0, durationMs: undefined, scrollDepthPct: undefined,
                isBounce: undefined,
                meta: { viewport: { w: window.innerWidth, h: window.innerHeight } }
            }).catch(() => {});
        };

        submit().catch(() => {});
    // searchParams.toString() produces a stable primitive –
    // combined with lastTrackedRef this is safe and won't loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams.toString()]);

    return null;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    console.log("PublicLayout: Render Start");

    return (
        <div className="public-section">
            <AudienceTracker />
            <Header />
            <main className="min-h-screen bg-linear-to-b from-[var(--background)] to-[#ece9e0]">
                {children}
            </main>
            <Footer />
            <GoToTop />
        </div>
    );
}
