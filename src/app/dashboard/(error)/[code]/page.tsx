"use client";

import ErrorView from "@/components/common/ErrorView";
import { useParams } from "next/navigation";

/**
 * Premium Error Page - Dashboard Section
 * This file is a simple wrapper for the global ErrorView component.
 * It ensures the correct layout (DashboardLayout) is used.
 */
export default function DashboardErrorPage() {
    const params = useParams();
    const code = typeof params?.code === "string" ? params.code : "404";
    
    return <ErrorView code={code} />;
}

