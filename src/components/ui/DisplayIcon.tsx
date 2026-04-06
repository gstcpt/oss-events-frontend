"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { LucideProps } from "lucide-react";

/**
 * Optimized DisplayIcon component that avoids importing entire icon libraries.
 * It uses dynamic imports to load only the required icons on demand.
 * This significantly reduces the bundle size and compilation time.
 */

interface DisplayIconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
    iconName: string;
    size?: number | string;
    className?: string;
    strokeWidth?: number;
}

const toPascalCase = (str: string) => {
    if (!str) return "";
    return str.replace(/(^\w|-\w)/g, (c) => c.replace("-", "").toUpperCase());
};

const dynamicIconCache = new Map<string, React.ComponentType<any>>();

const getIconComponent = (iconName: string) => {
    if (dynamicIconCache.has(iconName)) {
        return dynamicIconCache.get(iconName);
    }
    
    let IconComp;
    if (iconName.startsWith("tb:")) {
        const rawName = iconName.slice(3);
        const pascalName = toPascalCase(rawName);
        const tablerKey = pascalName.startsWith("Icon") ? pascalName : `Icon${pascalName}`;
        
        IconComp = dynamic<any>(() => 
            import("@tabler/icons-react").then((mod) => (mod as any)[tablerKey] || (() => null)),
            { ssr: true }
        );
    } else {
        const pascalCaseIconName = toPascalCase(iconName);
        
        IconComp = dynamic<any>(() => 
            import("lucide-react").then((mod) => (mod as any)[pascalCaseIconName] || (() => null)),
            { ssr: true }
        );
    }
    
    dynamicIconCache.set(iconName, IconComp as any);
    return IconComp;
};

const DisplayIcon = ({ iconName, size = 16, className, strokeWidth = 2, ...props }: DisplayIconProps) => {
    if (!iconName) return null;

    const IconComponent = getIconComponent(iconName);
    if (!IconComponent) return null;

    return <IconComponent size={size as any} className={className} strokeWidth={strokeWidth} {...props} />;
};

export default DisplayIcon;
