"use client";

import ErrorView from "@/components/common/ErrorView";
import { useParams } from "next/navigation";

/**
 * Premium Error Page - Public Section
 * This file is a simple wrapper for the global ErrorView component.
 * It ensures the correct layout (PublicLayout) is used.
 */
export default function PublicErrorPage() {
    const params = useParams();
    const code = typeof params?.code === "string" ? params.code : "404";
    
    return <ErrorView code={code} />;
}

