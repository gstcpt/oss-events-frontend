import { logout } from "./api/auth";
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void, reject: (reason: any) => void }> = [];
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => { if (error) { prom.reject(error); } else { prom.resolve(token); } });
    failedQueue = [];
};
const getCache = new Map<string, { data: any, timestamp: number }>();

export async function apiFetch<T = any>(path: string, options?: RequestInit & { responseType?: 'json' | 'blob' }): Promise<T> {
    const { responseType = 'json', ...fetchOptions } = options || {};

    // Simple client-side cache for GET requests
    const isGet = !fetchOptions.method || fetchOptions.method.toUpperCase() === 'GET';
    const cacheKey = `${path}_${JSON.stringify(fetchOptions.headers || {})}`;
    if (isGet && getCache.has(cacheKey)) {
        const cached = getCache.get(cacheKey)!;
        if (Date.now() - cached.timestamp < 5000) { // 5-second cache
            return cached.data;
        }
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const headers = new Headers(fetchOptions?.headers);
    if (!(fetchOptions?.body instanceof FormData)) { headers.set("Content-Type", "application/json"); }
    if (token) { headers.set("Authorization", `Bearer ${token}`); }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
        const fullUrl = `${API_URL}${path}`;
        const res = await fetch(fullUrl, { ...fetchOptions, headers, credentials: "include", signal: controller.signal });
        clearTimeout(timeoutId);

        // Define public endpoints that don't require authentication or shouldn't redirect on 401
        const publicPaths = [
            '/public',
            '/audience',
            '/raports',
            '/auth/login',
            '/auth/register',
            '/auth/refresh',
            '/auth/verify-email',
            '/auth/reset-password',
            '/auth/new-password',
            '/categories',
            '/items',
            '/blogs',
            '/providers',
            '/media',
            '/companies'
        ];
        const isPublicEndpoint = publicPaths.some(publicPath =>
            path === publicPath || path.startsWith(`${publicPath}/`) || path.startsWith(`${publicPath}?`)
        );

        if (isPublicEndpoint) {
            if (!res.ok) {
                if (responseType === 'blob') { return new Blob() as unknown as T; }
                try {
                    const text = await res.text();
                    try { return JSON.parse(text); } catch { return {} as T; }
                } catch { return {} as T; }
            }
            const text = await res.text();
            try { return text ? JSON.parse(text) : {} as T; } catch { return {} as T; }
        }

        if (res.status === 401 && typeof window !== 'undefined' && path !== '/auth/refresh') {
            if (!token) {
                window.dispatchEvent(new Event('unauthorized'));
                throw new Error('Session expired. Please log in again.');
            }
            const originalRequest = { path, options: fetchOptions };
            if (isRefreshing) {
                return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); }).then(token => {
                    const newHeaders = new Headers(originalRequest.options?.headers);
                    newHeaders.set('Authorization', `Bearer ${token}`);
                    return apiFetch(originalRequest.path, { ...originalRequest.options, headers: newHeaders });
                }).catch(err => { return Promise.reject(err); });
            }
            isRefreshing = true;
            try {
                const refreshResponse = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, credentials: 'include' });
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    if (refreshData.token) {
                        localStorage.setItem('token', refreshData.token);
                        document.cookie = `auth_token=${refreshData.token}; path=/; max-age=604800; SameSite=Strict`;
                        const retryHeaders = new Headers(fetchOptions?.headers);
                        if (!(fetchOptions?.body instanceof FormData)) { retryHeaders.set("Content-Type", "application/json"); }
                        retryHeaders.set("Authorization", `Bearer ${refreshData.token}`);
                        const retryRes = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers: retryHeaders, credentials: "include" });
                        processQueue(null, refreshData.token);
                        isRefreshing = false;
                        if (!retryRes.ok) { throw new Error(`Request failed with status ${retryRes.status}`); }
                        if (responseType === 'blob') { return retryRes.blob() as Promise<T>; }
                        const retryText = await retryRes.text();
                        try { return retryText ? JSON.parse(retryText) : {} as T; } catch { return {} as T; }
                    }
                }
                window.dispatchEvent(new Event('unauthorized'));
                processQueue(new Error('Token refresh failed'), null);
                isRefreshing = false;
                throw new Error('Session expired. Please log in again.');
            } catch (error) {
                window.dispatchEvent(new Event('unauthorized'));
                processQueue(error instanceof Error ? error : new Error(String(error)), null);
                isRefreshing = false;
                throw new Error('Session expired. Please log in again.');
            }
        }

        if (!res.ok) {
            const errorText = await res.text();
            let data;
            try { data = JSON.parse(errorText); } catch { /* ignore */ }
            let errorMessage = "An unexpected error occurred.";
            if (res.status === 401) { errorMessage = "Session expired. Please log in again."; }
            else if (data) {
                if (typeof data.message === "object" && data.message !== null && typeof data.message.message === "string") { errorMessage = data.message.message; }
                else if (typeof data.message === "string") { errorMessage = data.message; }
                else if (typeof data.error === "string") { errorMessage = data.error; }
            } else if (errorText) { errorMessage = errorText; }
            throw new Error(errorMessage);
        }

        if (responseType === 'blob') { return res.blob() as Promise<T>; }
        const text = await res.text();
        const data = text ? JSON.parse(text) : ({} as T);

        if (isGet) {
            getCache.set(cacheKey, { data, timestamp: Date.now() });
        }

        return data;

    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out after 15 seconds. The server is taking too long to respond.');
        }
        throw err;
    }
}