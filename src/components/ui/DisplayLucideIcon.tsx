import React from "react";
import { icons, LucideProps } from "lucide-react";
interface DisplayLucideIconProps extends LucideProps {
    iconName: string;
}
const toPascalCase = (str: string) => {
    if (!str) return "";
    return str.replace(/(^\w|-\w)/g, (c) => c.replace("-", "").toUpperCase());
};
const DisplayLucideIcon = ({ iconName, ...props }: DisplayLucideIconProps) => {
    const pascalCaseIconName = toPascalCase(iconName);
    const LucideIcon = icons[pascalCaseIconName as keyof typeof icons];
    if (!LucideIcon) {
        return null;
    }
    return <LucideIcon {...props} />;
};
export default DisplayLucideIcon;
