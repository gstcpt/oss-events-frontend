"use client";

import { useState, useEffect } from "react";
import { Bell, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { findAllNotificationByUser, markNotificationAsReadById, markAllNotificationAsReadById, markNotificationAsUnreadById, countAllByUser } from "@/lib/api/notifications";
import { Notification } from "@/types/notifications";
import moment from "moment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Notifications() {
    const t = useTranslations('Dashboard.notifications');
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [totalNotifications, setTotalNotifications] = useState(0);

    useEffect(() => {
        if (user) {
            setLoading(true);
            findAllNotificationByUser(user.id, page, limit).then(data => {
                setNotifications(data || []);
                setLoading(false);
            }).catch(() => {
                setNotifications([]);
                setLoading(false);
            });
            countAllByUser(user.id).then(data => {
                setTotalNotifications(data || 0);
            });
        } else {
            setLoading(false);
        }
    }, [user, page, limit]);

    const handleMarkAsRead = (id: number) => {
        markNotificationAsReadById(id).then(() => {
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: 1 } : n));
        });
    };

    const handleMarkAsUnread = (id: number) => {
        markNotificationAsUnreadById(id).then(() => {
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: 0 } : n));
        });
    };

    const handleMarkAllAsRead = () => {
        if (user) {
            markAllNotificationAsReadById(user.id).then(() => {
                setNotifications(notifications.map(n => ({ ...n, status: 1 })));
            });
        } else {
            toast.error("User not found.");
        }
    };

    const hasUnread = notifications.some(n => n.status === 0);

    return (
        <div className="space-y-8">
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold ">Notifications</h2>
                    {hasUnread && (<Button onClick={handleMarkAllAsRead} className="text-sm text-white cursor-pointer">Mark all as read</Button>)}
                </div>
                <div className="p-6">
                    {loading ? (
                        <p>Loading notifications...</p>
                    ) : (
                        <div className="space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div key={notification.id} className={`flex items-start p-4 rounded-lg ${notification.status === 1 ? 'bg-gray-50' : 'bg-blue-50'}`}>
                                        <div className="shrink-0">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notification.status === 1 ? 'bg-gray-200 ' : 'bg-blue-100 text-blue-600'}`}>
                                                <Bell size={20} />
                                            </div>
                                        </div>
                                        <div className="ml-4 grow">
                                            <p className={`text-sm ${notification.status === 1 ? '' : 'font-medium '}`}>{notification.notification}</p>
                                            <p className="text-xs  mt-1">{moment(notification.created_at).format('LLL')} - {moment(notification.created_at).fromNow()}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {notification.status === 0 ? (
                                                <Button onClick={() => handleMarkAsRead(notification.id)} className="p-2 rounded-full bg-transparent hover:bg-gray-200 text-green-500" title="Mark as read"><Eye size={18} /></Button>
                                            ) : (
                                                <Button onClick={() => handleMarkAsUnread(notification.id)} className="p-2 rounded-full bg-transparent text-red-500 hover:bg-gray-200 " title="Mark as unread"><EyeOff size={18} /></Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (<p>You have no new notifications.</p>)}
                        </div>
                    )}
                </div>
                {totalNotifications > limit && (
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                        <Button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 text-sm font-medium bg-white text-slate-500 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-primary disabled:opacity-50">Previous</Button>
                        <span className="text-sm ">Page {page} of {Math.ceil(totalNotifications / limit)}</span>
                        <Button onClick={() => setPage(page + 1)} disabled={page * limit >= totalNotifications} className="px-4 py-2 text-sm font-medium bg-white text-slate-500 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-primary disabled:opacity-50">Next</Button>
                    </div>
                )}
            </div>
        </div>
    );
}