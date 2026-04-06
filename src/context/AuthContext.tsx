"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { User, AuthContextType } from "@/types/users";
import { login as apiLogin } from "@/lib/api/auth";
let refreshTimeout: NodeJS.Timeout | null = null;
const REFRESH_INTERVAL = 50 * 60 * 1000;
const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setUser: () => { }, logout: () => { }, login: async () => ({ success: false, error: 'Not implemented' }) });
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const logout = useCallback(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            const rawPath = pathname.replace(/^\/(fr|ar|en)(\/|$)/, "/") || "/";
            const protectedRoutes = ["/dashboard", "/settings", "/profile-setup"];
            const isProtectedRoute = protectedRoutes.some(route => rawPath === route || rawPath.startsWith(route + "/"));
            if (isProtectedRoute) { window.location.href = "/login"; }
        }
    }, [setUser]);
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) { setUser(JSON.parse(stored)); } else { logout(); } // If no user is stored, check if we need to redirect
        setLoading(false);
    }, [logout]);
    useEffect(() => {
        const handleUnauthorized = () => { logout(); };
        window.addEventListener("unauthorized", handleUnauthorized);
        return () => { window.removeEventListener("unauthorized", handleUnauthorized); };
    }, [logout]);
    useEffect(() => {
        let activityTimeout: NodeJS.Timeout;
        const resetTimer = () => {
            clearTimeout(activityTimeout);
            if (user) { activityTimeout = setTimeout(logout, 24 * 60 * 60 * 1000); }
        };
        const handleActivity = () => { resetTimer(); };
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("scroll", handleActivity);
        window.addEventListener("click", handleActivity);
        resetTimer();
        return () => {
            clearTimeout(activityTimeout);
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("scroll", handleActivity);
            window.removeEventListener("click", handleActivity);
        };
    }, [user, logout]);
    const refreshToken = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                logout();
                return;
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", });
            if (response.ok) {
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    document.cookie = `auth_token=${data.token}; path=/; max-age=604800; SameSite=Strict`;
                    setUser(data.user);
                    if (refreshTimeout) { clearTimeout(refreshTimeout); }
                    refreshTimeout = setTimeout(refreshToken, REFRESH_INTERVAL);
                }
            } else { logout(); }
        } catch (error) { logout(); }
    }, [logout]);
    useEffect(() => {
        if (user && !refreshTimeout) { refreshTimeout = setTimeout(refreshToken, REFRESH_INTERVAL); }
        return () => {
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
                refreshTimeout = null;
            }
        };
    }, [user, refreshToken]);
    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await apiLogin({ email, password, origin: window.location.origin });
            if (res.token && res.user) {
                // Store auth data
                document.cookie = `auth_token=${res.token}; path=/; max-age=604800; SameSite=Strict`;
                localStorage.setItem("token", res.token);
                const user = {
                    id: res.user.id,
                    firstname: res.user.firstname,
                    midname: res.user.midname || "",
                    lastname: res.user.lastname,
                    phone: res.user.phone || "",
                    username: res.user.username || "",
                    email: res.user.email,
                    email_verified: res.user.email_verified,
                    email_verification_token: res.user.email_verification_token || "",
                    password: res.user.password || "",
                    last_login: res.user.last_login,
                    password_reset_token: res.user.password_reset_token || "",
                    password_reset_token_expiry: res.user.password_reset_token_expiry || "",
                    role: res.user.role.title,
                    company_id: res.user.company?.id || null,
                    status: res.user.status || "active",
                    role_id: res.user.role_id,
                    avatar: res.user.avatar || "",
                    created_at: res.user.created_at,
                };
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);
                return { success: true, error: null };
            } else { return { success: false, error: "No user data received" }; }
        } catch (error: any) { return { success: false, error: error.message || "Login failed" }; }
    }, [setUser]);
    const value = useMemo(() => ({ user, loading, setUser, logout, refreshToken, login }), [user, loading, setUser, logout, refreshToken, login]);
    return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) { throw new Error('useAuth must be used within an AuthProvider'); }
    return context;
}