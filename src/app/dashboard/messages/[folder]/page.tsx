"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMessages, countMessages, markMessageAsRead, markMessageAsUnread, markAllInboxMessagesAsRead, moveMessageToTrash, restoreMessage, emptyTrash } from "@/lib/api/messages";
import { MessageData, MessageFolder } from "@/types/messages";
import moment from "moment";
import { Eye, EyeOff, Trash, ArrowUp, ArrowDown, RefreshCw, ArchiveRestore, SquareArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessageList() {
    const t = useTranslations('Dashboard.messages');
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const folder = params.folder as MessageFolder;
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [unreadCount, setUnreadCount] = useState<number | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    const extractCount = (res: any) => {
        if (res == null) return 0;
        if (typeof res === "number") return res;
        if (typeof res === "string" && !isNaN(Number(res))) return Number(res);
        if (typeof res === "object") {
            if ("count" in res) return Number((res as any).count) || 0;
            if ("total" in res) return Number((res as any).total) || 0;
            if ("data" in res && Array.isArray(res.data)) return res.data.length;
        }
        return 0;
    };

    const fetchMessages = async () => {
        if (!user || !folder) return;
        setLoading(true);
        try {
            const [msgs, unreadRes, totalRes] = await Promise.all([
                getMessages(folder, user.id),
                countMessages(folder, user.id, false).catch(() => null),
                countMessages(folder, user.id).catch(() => null)
            ]);
            setMessages(msgs || []);
            setUnreadCount(extractCount(unreadRes));
            setTotalCount(extractCount(totalRes));
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("messages_updated"));
            }
        } catch (err) {
            toast.error(`[${folder}] ${t('errorLoading')}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setMessages([]);
            setUnreadCount((c) => c ?? 0);
            setTotalCount((c) => c ?? 0);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchMessages(); }, [user, folder]);

    const handleRowClick = (messageId: number | string) => { router.push(`/dashboard/messages/${folder}/${messageId}`); };

    const handleMarkAsRead = async (e: React.MouseEvent, messageId: number | string) => {
        e.stopPropagation();
        try {
            await markMessageAsRead(Number(messageId));
            fetchMessages();
        } catch (err) { toast.error(t('errorLoading')); }
    };

    const handleMarkAllInboxMessagesAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        try {
            await markAllInboxMessagesAsRead(user.id);
            fetchMessages();
        } catch (err) { toast.error(t('errorLoading')); }
    };

    const handleEmptyTrash = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        try {
            await emptyTrash(user.id);
            fetchMessages();
        } catch (err) { toast.error(t('errorLoading')); }
    };

    const handleMarkAsUnread = async (e: React.MouseEvent, messageId: number | string) => {
        e.stopPropagation();
        try {
            await markMessageAsUnread(Number(messageId));
            fetchMessages();
        } catch (err) { toast.error(t('errorLoading')); }
    };

    const handleMoveToTrash = async (e: React.MouseEvent, messageId: number | string) => {
        e.stopPropagation();
        try {
            await moveMessageToTrash(Number(messageId), folder);
            fetchMessages();
        } catch (err) { toast.error(t('errorLoading')); }
    };

    const handleRestore = async (e: React.MouseEvent, message: MessageData) => {
        e.stopPropagation();
        if (user) {
            try {
                await restoreMessage(message, user.id);
                fetchMessages();
            } catch (error) { toast.error(t('errorLoading')); }
        }
    };

    const filteredMessages = useMemo(() => {
        if (!searchTerm) return messages;
        const q = searchTerm.toLowerCase();
        return messages.filter((message) => (message.name || "").toLowerCase().includes(q) || (message.email || "").toLowerCase().includes(q) || (message.subject || "").toLowerCase().includes(q));
    }, [messages, searchTerm]);

    const getTitle = () => {
        if (!folder) return t('title');
        const folderNames: Record<string, string> = {
            inbox: t('inbox'),
            sent: t('sent'),
            draft: t('draft'),
            trash: t('trash'),
            archive: t('archive')
        };
        return folderNames[folder] || folder;
    }

    const columns = useMemo(() => [
        {
            accessor: "name",
            header: folder === 'sent' || folder === 'draft' ? t('to') : t('from'),
            cell: (message: MessageData) => (<div className={`truncate text-sm ${folder === 'inbox' && message.status_for_receiver === 0 ? "font-bold" : ""}`}>{message.name}</div>),
            className: "w-[25%]"
        },
        {
            accessor: "subject",
            header: t('subject'),
            cell: (message: MessageData) => (<div className="truncate">{message.subject}</div>),
            className: "w-[40%]"
        },
        {
            accessor: "created_at",
            header: t('date'),
            cell: (message: MessageData) => moment(message.created_at).fromNow(),
            className: "w-[15%]"
        },
        {
            accessor: 'actions',
            header: 'Actions',
            cell: (message: MessageData) => (
                <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleRowClick(message.id)} title={t('viewMessage')}><SquareArrowRight className="cursor-pointer text-blue-500 rounded-full p-1" /></Button>
                    {folder === 'inbox' && message.status_for_receiver === 0 && (
                        <Button variant="ghost" size="icon" onClick={(e) => handleMarkAsRead(e, message.id)} title={t('markAsRead')}><Eye className="cursor-pointer text-green-500 rounded-full p-1" /></Button>
                    )}
                    {folder === 'inbox' && message.status_for_receiver === 1 && (
                        <Button variant="ghost" size="icon" onClick={(e) => handleMarkAsUnread(e, message.id)} title={t('markAsUnread')}><EyeOff className="cursor-pointer text-yellow-500 rounded-full p-1" /></Button>
                    )}
                    {folder !== 'trash' && (<Button variant="ghost" size="icon" onClick={(e) => handleMoveToTrash(e, message.id)} title={t('moveToTrash')}><Trash className="cursor-pointer text-red-500 rounded-full p-1" /></Button>)}
                    {folder === 'trash' && (<Button variant="ghost" size="icon" onClick={(e) => handleRestore(e, message)} title={t('restoreMessage')}><ArchiveRestore className="cursor-pointer text-green-500 rounded-full p-1" /></Button>)}
                </div>
            ),
            className: "w-[20%]"
        }
    ], [folder]);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <CardTitle>{getTitle()}</CardTitle>
                            <div className="text-sm">
                                {folder === 'inbox' && <span className="mr-3">{t('unread')}: <strong>{unreadCount ?? "-"}</strong></span>}
                                <span>{t('total')}: <strong>{totalCount ?? "-"}</strong></span>
                            </div>
                            {folder === 'inbox' && unreadCount != 0 && <Button onClick={handleMarkAllInboxMessagesAsRead} size="sm" variant="outline" className="text-sm bg-white text-gray-700 hover:bg-gray-700 hover:text-white">{t('markAllAsRead')}</Button>}
                            {folder === 'trash' && totalCount != 0 && <Button onClick={handleEmptyTrash} size="sm" variant="outline" className="text-sm bg-white text-gray-700 hover:bg-gray-700 hover:text-white">{t('emptyTrash')}</Button>}
                        </div>
                        <div className="w-1/3 flex items-center space-x-3">
                            <Input type="text" placeholder={t('search')} className="w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <Button onClick={fetchMessages} variant="outline" size="icon" title="Refresh" className="text-sm bg-white text-gray-700 hover:bg-gray-700 hover:text-white"><RefreshCw size={18} /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredMessages}
                        onEdit={(message: MessageData) => handleRowClick(message.id)}
                        onDelete={(message: MessageData) => handleMoveToTrash({ stopPropagation: () => { } } as React.MouseEvent, message.id)}
                        showEdit={false}
                        showDelete={false}
                        defaultSort={{ key: 'id', direction: 'descending' }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}