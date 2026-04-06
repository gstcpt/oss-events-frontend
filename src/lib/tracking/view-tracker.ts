import { useEffect, useRef } from 'react';
import { trackItemView } from '@/lib/api/public/items';
import { trackBlogView } from '@/lib/api/public/blogs';
import { trackCategoryView } from '@/lib/api/public/categories';
import { trackProviderView } from '@/lib/api/providers';
import { audienceApi } from '@/lib/api/rapports';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) { return crypto.randomUUID(); }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const getClientInfo = () => {
    if (typeof window === 'undefined') return {};
    return {
        userAgent: window.navigator.userAgent,
        device: /Mobile|Android|iPhone/i.test(window.navigator.userAgent) ? 'mobile' : 'desktop',
        os: window.navigator.platform,
        browser: 'Unknown',
        locale: window.navigator.language
    };
};

export const initAudience = async (): Promise<{ visitorId: number, sessionId: number } | null> => {
    if (typeof window === 'undefined') return null;
    try {
        let clientId = localStorage.getItem('audience_client_id');
        if (!clientId) {
            clientId = generateUUID();
            localStorage.setItem('audience_client_id', clientId);
        }
        let visitorDbIdStr = localStorage.getItem('audience_visitor_db_id');
        let visitorDbId = visitorDbIdStr ? parseInt(visitorDbIdStr) : null;
        if (!visitorDbId) {
            const clientInfo = getClientInfo();
            const response = await audienceApi.createVisitor({ clientId, ...clientInfo });
            if (response && response.success && response.data?.id) {
                visitorDbId = response.data.id;
                if (visitorDbId) localStorage.setItem('audience_visitor_db_id', visitorDbId.toString());
            } else { return null; }
        }
        if (!visitorDbId) return null;
        let sessionUuid = sessionStorage.getItem('audience_session_uuid');
        if (!sessionUuid) {
            sessionUuid = generateUUID();
            sessionStorage.setItem('audience_session_uuid', sessionUuid);
            sessionStorage.removeItem('audience_session_db_id');
        }
        let sessionDbIdStr = sessionStorage.getItem('audience_session_db_id');
        let sessionDbId = sessionDbIdStr ? parseInt(sessionDbIdStr) : null;
        if (!sessionDbId) {
            const response = await audienceApi.createSession({ visitorId: visitorDbId, sessionUuid, entryUrl: window.location.href, referrer: document.referrer });
            if (response && response.success && response.data?.id) {
                sessionDbId = response.data.id;
                if (sessionDbId) sessionStorage.setItem('audience_session_db_id', sessionDbId.toString());
            } else { return null; }
        }
        if (!sessionDbId) return null;
        return { visitorId: visitorDbId, sessionId: sessionDbId };

    } catch (error) { return null; }
};

export type ResourceType = 'items' | 'providers' | 'blogs' | 'categories';

export const useViewTracker = (resourceType: ResourceType, resourceId: number) => {
    const trackedRef = useRef(false);

    useEffect(() => { trackedRef.current = false; }, [resourceId]);

    useEffect(() => {
        if (trackedRef.current || !resourceId) return;
        const track = async () => {
            const ids = await initAudience();
            if (!ids) return;
            const { visitorId, sessionId } = ids;
            try {
                if (resourceType === 'items') { await trackItemView(resourceId, sessionId, visitorId); }
                else if (resourceType === 'blogs') { await trackBlogView(resourceId, sessionId, visitorId); }
                else if (resourceType === 'categories') { await trackCategoryView(resourceId, sessionId, visitorId); }
                else if (resourceType === 'providers') { await trackProviderView(resourceId, sessionId, visitorId); }
            } catch (e) { }
        };
        track();
        trackedRef.current = true;
    }, [resourceType, resourceId]);
};
