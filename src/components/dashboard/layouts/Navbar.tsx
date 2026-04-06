import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Bell, Home, ChevronDown, Mail, LogOut, Settings, LayoutGrid, Menu, UserRound, Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { getAllCompanies } from "@/lib/api/companies";
import { useAuth } from "@/context/AuthContext";
import { getLast5UserMessages, countInboxUnreadMessagesByUser, markMessageAsRead, markAllInboxMessagesAsRead } from "@/lib/api/messages";
import { countUnreadNotificationsByUser, findLast5NotificationByUser, markAllNotificationAsReadById } from "@/lib/api/notifications";
import { MessageData } from "@/types/messages";
import { Notification } from "@/types/notifications";
import moment from "moment";
import { toast } from "sonner";
import Image from "next/image";
import { getUserById } from "@/lib/api/user";
import { User } from "@/types/users";
import { Company } from "@/types/companies";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import LocaleSwitcher from "@/app/LocaleSwitcher";
import { type Locale } from "@/i18n/config";

interface NavbarProps {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Navbar({ sidebarCollapsed, setSidebarCollapsed }: NavbarProps) {
    const t = useTranslations("Dashboard.navbar");
    const tNav = useTranslations("Navigation");
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [companyOpen, setCompanyOpen] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const profileRef = useRef<HTMLDivElement>(null);
    const companyRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!user) return;
        const fetchCurrentUser = async () => {
            if (user?.id) {
                try {
                    const currentUserData = await getUserById(user.id);
                    setCurrentUser(currentUserData);
                } catch (error) {
                    toast.error("Failed to fetch user data.");
                }
            }
        };
        const fetchCompanies = async () => {
            try {
                const data = await getAllCompanies();
                setCompanies(data);
                if (data.length > 0) { if (user?.id === 1) { setSelectedCompany(data[0]); } else { setSelectedCompany(data.find((company: { id: number }) => company.id === user?.company_id) || null); } }
                else { toast.error("No companies found."); }
            } catch (error) { toast.error("An error occurred while fetching companies."); }
        };
        fetchCurrentUser();
        fetchCompanies();
    }, [user]);
    useEffect(() => {
        if (user) {
            getLast5UserMessages(user.id).then(setMessages);
            findLast5NotificationByUser(user.id).then(setNotifications);
            countInboxUnreadMessagesByUser(user.id).then(setUnreadMessages);
            countUnreadNotificationsByUser(user.id).then(setUnreadNotifications);
        }
    }, [user]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) { setProfileOpen(false); }
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) { setCompanyOpen(false); }
            if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) { setMessagesOpen(false); }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) { setNotificationsOpen(false); }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);
    const handleCompanySelect = (company: Company) => {
        setSelectedCompany(company);
        setCompanyOpen(false);
    };
    const handleMarkAllNotificationsAsRead = async () => {
        if (user) {
            await markAllNotificationAsReadById(user.id);
            setUnreadNotifications(0);
            findLast5NotificationByUser(user.id).then(setNotifications);
        }
        else { toast.error("An error occurred while marking all notifications as read."); }
    };
    const handleMarkAllInboxMessagesAsRead = async () => {
        if (user) {
            await markAllInboxMessagesAsRead(user.id);
            setUnreadMessages(0);
            getLast5UserMessages(user.id).then(setMessages);
        }
        else { toast.error("An error occurred while marking all inbox messages as read."); }
    };
    return (
        <header className="bg-slate-50 shadow-md border-b border-slate-200">
            <div className="mx-auto px-4">
                <div className="flex items-center justify-between h-16 text-slate-700">
                    <div className="flex items-center space-x-4">
                        <div className="shrink-0"><Link href="/dashboard"><span className="text-2xl font-bold text-slate-900">{user?.company_id ? selectedCompany?.title : "Oss Event"}</span></Link></div>
                        <Button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-primary bg-transparent rounded-md hover:text-primary hover:bg-slate-100">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="grow"></div>
                    <div className="flex items-center space-x-4">
                        <div className="relative" ref={companyRef}>
                            <Button onClick={() => setCompanyOpen(!companyOpen)} className="flex items-center space-x-2 p-2 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700">
                                <LayoutGrid className="h-5 w-5" />
                                <span className="font-medium">{selectedCompany ? selectedCompany.title : t('selectCompany')}</span>
                                <ChevronDown className="h-5 w-5" />
                            </Button>
                            {companyOpen && (
                                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-slate-100">
                                    <ul className="py-1 text-slate-700">
                                        {companies.map((company) => (<li key={company.id}><Button onClick={() => handleCompanySelect(company)} className="w-full bg-transparent text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">{company.title}</Button></li>))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={notificationsRef}>
                            <Button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                                <Bell className="h-6 w-6" />
                                {unreadNotifications > 0 && (<span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">{unreadNotifications}</span>)}
                            </Button>
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-slate-100">
                                    <div className="p-4 font-bold border-b border-slate-100 flex justify-between items-center text-slate-800">
                                        <span>{tNav('notifications')}</span>
                                        {unreadNotifications > 0 && (<Button onClick={handleMarkAllNotificationsAsRead} className="text-xs text-primary hover:underline bg-transparent hover:bg-tranparent cursor-pointer">{t('markAllAsRead')}</Button>)}
                                    </div>
                                    <ul className="py-1">
                                        {notifications.map((notification) => (
                                            <li key={notification.id} className={`px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 ${notification.status === 0 ? "font-bold" : ""}`}>
                                                <Link href={`/dashboard/notifications`} className="text-sm">{notification.notification}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="p-2 text-center border-t border-slate-100"><Link href="/dashboard/notifications" className="text-sm text-primary hover:underline">{t('viewAllNotifications')}</Link></div>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={messagesRef}>
                            <Button onClick={() => setMessagesOpen(!messagesOpen)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                                <Mail className="h-6 w-6" />
                                {unreadMessages > 0 && (<span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">{unreadMessages}</span>)}
                            </Button>
                            {messagesOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-slate-100">
                                    <div className="p-4 font-bold border-b border-slate-100 flex justify-between items-center text-slate-800">
                                        <span>{tNav('messages')}</span>
                                        {unreadMessages > 0 && (<Button onClick={handleMarkAllInboxMessagesAsRead} className="text-xs text-primary hover:underline bg-transparent hover:bg-tranparent cursor-pointer">{t('markAllAsRead')}</Button>)}
                                    </div>
                                    <ul className="py-1">
                                        {unreadMessages > 0 && messages.map((message) => (
                                            <li key={message.id} className={`px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 ${message.status_for_receiver === 0 ? "bg-slate-50 font-bold hover:bg-slate-100" : ""}`}>
                                                <Link href={`/dashboard/messages/inbox/${message.id}`} className="text-sm">
                                                    {message.subject}<p className="text-xs text-slate-500">{message.created_at ? moment(message.created_at).fromNow() : "-"}</p>
                                                </Link>
                                            </li>
                                        ))}
                                        {unreadMessages === 0 && (<li key="no-messages" className="px-4 py-2 text-sm text-slate-500">{t('noNewMessages')}</li>)}
                                    </ul>
                                    <div className="p-2 text-center border-t border-slate-100"><Link href="/dashboard/messages/inbox" className="text-sm text-primary hover:underline">{t('viewAllMessages')}</Link></div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            <LocaleSwitcher
                                changeLocaleAction={async (newLocale) => {
                                    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
                                    window.location.reload();
                                }}
                            />
                        </div>
                        <div className="relative" ref={profileRef}>
                            <Button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center bg-transparent space-x-2 text-stone-600 hover:bg-gray-100 cursor-pointer hover:text-stone-700">
                                <div className="mr-2 font-medium">{(currentUser?.firstname || "") + " " + (currentUser?.lastname || "")}</div>
                                {currentUser?.avatar ? (
                                    <div className="relative h-9 w-9">
                                        <Image src={currentUser.avatar.startsWith('/') ? currentUser.avatar : `/${currentUser.avatar}`} alt="" fill sizes="36px" className="rounded-full object-cover ring-2 ring-slate-100" />
                                    </div>
                                ) : (<div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center"><UserRound className="h-5 w-5 text-slate-500" /></div>)}
                            </Button>
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-slate-100">
                                    <ul className="py-1 text-slate-700">
                                        <li><Link href="/" className="flex items-center px-4 py-2 text-sm hover:bg-slate-50"><Home className="h-4 w-4 mr-2" /> {tNav('home')}</Link></li>
                                        <li><Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm hover:bg-slate-50"><Settings className="h-4 w-4 mr-2" /> {tNav('settings')}</Link></li>
                                        <li><Link href="#" className="flex items-center px-4 py-2 text-sm hover:bg-slate-50" onClick={() => { setOpen(false); logout(); }}><LogOut className="h-4 w-4 mr-2" /> {tNav('logout')}</Link></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
