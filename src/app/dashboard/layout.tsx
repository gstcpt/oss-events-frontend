'use client';

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/layouts/Sidebar";
import Navbar from "@/components/dashboard/layouts/Navbar";
import Footer from "@/components/dashboard/layouts/Footer";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { canAccess } from "@/lib/rbac";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (!canAccess(user.role, pathname)) {
                router.push('/dashboard'); // Or maybe a 403 page
            }
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-slate-500 font-medium">Synchronizing Command Center...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <main>
            {/* Dashboard Header */}
            <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="flex">
                    {/* Sidebar */}
                    <Sidebar sidebarCollapsed={sidebarCollapsed} />
                    {/* Main Content */}
                    <main className="flex-1 p-8 text-slate-900 font-sans">{children}</main>
                </div>
            </div>
            {/* Footer */}
            <Footer />
        </main>
    );
}