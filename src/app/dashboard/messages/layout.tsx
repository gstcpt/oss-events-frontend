"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Send, FileText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { countMessages } from "@/lib/api/messages";
import { useTranslations } from 'next-intl';
import { toast } from "sonner";

type MessageCounts = {
    inbox: number;
    sent: number;
    draft: number;
    trash: number;
};

const sidebarNavItems = (t: any) => [
    { href: "/dashboard/messages/inbox", label: t('inbox'), icon: Inbox, key: "inbox" as keyof MessageCounts },
    { href: "/dashboard/messages/sent", label: t('sent'), icon: Send, key: "sent" as keyof MessageCounts },
    { href: "/dashboard/messages/draft", label: t('draft'), icon: FileText, key: "draft" as keyof MessageCounts },
    { href: "/dashboard/messages/trash", label: t('trash'), icon: Trash2, key: "trash" as keyof MessageCounts },
];

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('Dashboard.messages');
    const pathname = usePathname();
    const { user } = useAuth();
    const [counts, setCounts] = useState<MessageCounts>({ inbox: 0, sent: 0, draft: 0, trash: 0 });

    useEffect(() => {
        if (user) {
            const fetchCounts = async () => {
                try {
                    const [inbox, sent, draft, trash] = await Promise.all([
                        countMessages("inbox", user.id),
                        countMessages("sent", user.id),
                        countMessages("draft", user.id),
                        countMessages("trash", user.id),
                    ]);
                    setCounts({ inbox, sent, draft, trash });
                } catch (error) {
                    toast.error(`Failed to fetch message counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            };
            fetchCounts();

            const handleUpdate = () => fetchCounts();
            window.addEventListener("messages_updated", handleUpdate);
            return () => window.removeEventListener("messages_updated", handleUpdate);
        }
    }, [user, pathname]);

    return (
        <div className="flex h-full card">
            <div className="w-64 shrink-0 border-r border-gray-200 bg-white">
                <div className="p-4">
                    <Link href="/dashboard/messages/new" className="NewMessageBtn">
                        {t('newMessage')}
                    </Link>
                </div>
                <nav className="px-2">
                    {sidebarNavItems(t).map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const count = counts[item.key];
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md ${isActive
                                    ? "bg-gray-100 "
                                    : " hover:bg-gray-50 hover:"
                                    }`}
                            >
                                <div className="flex items-center">
                                    <item.icon className="mr-3 h-5 w-5" />
                                    <span>{item.label}</span>
                                </div>
                                {count > 0 && <span className="text-xs font-semibold ">({count})</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="flex-1 p-6">{children}</div>
        </div>
    );
}