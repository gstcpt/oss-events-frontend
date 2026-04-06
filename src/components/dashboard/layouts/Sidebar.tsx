import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Tags, Users, Building, Mails, Bell, Settings, Shield, Puzzle, Package, UserCheck, UserCog, UserStar, Layers, FileText, File, Film, Logs, Key, ChevronDown, Phone, Server, BarChart3, Folder, Blocks, Rss, TableOfContents, EarthLock, Lock, Eye, Mail, Map } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface SidebarProps { sidebarCollapsed: boolean; }

export default function Sidebar({ sidebarCollapsed }: SidebarProps) {
    const t = useTranslations("Dashboard.sidebar");
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const [contactsOpen, setContactsOpen] = useState(true);
    const [saasOpen, setSaasOpen] = useState(true);
    const [companyOpen, setCompanyOpen] = useState(true);
    const [userSpaceOpen, setUserSpaceOpen] = useState(true);
    const [rapportsOpen, setRapportsOpen] = useState(true);

    if (loading) {
        return (
            <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm min-h-screen transition-all duration-300 relative border-r border-slate-200 p-4`}>
                <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-slate-100 rounded-md"></div>
                    <div className="h-10 bg-slate-100 rounded-md"></div>
                    <div className="h-10 bg-slate-100 rounded-md"></div>
                </div>
            </aside>
        );
    }

    let isRoot = false;
    let isAdmin = false;
    let isProvider = false;
    let isClient = false;
    if (user?.role === "Root") { isRoot = true; }
    if (user?.role === "Admin") { isAdmin = true; }
    if (user?.role === "Provider") { isProvider = true; }
    if (user?.role === "Client") { isClient = true; }

    // If no user is logged in after loading, don't show the dashboard menus
    if (!user) return null;

    return (
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm min-h-screen text-slate-700 transition-all duration-300 relative border-r border-slate-200`}>
            <nav className="mt-4">
                {/* DASHBOARD */}
                <div className="px-4">
                    <div className="mt-2 space-y-1">
                        {sidebarCollapsed ? (
                            <div className="relative group flex justify-center py-3 hover:bg-slate-100 rounded-md cursor-pointer">
                                <Link href="/dashboard" className={`flex items-center justify-center w-full ${pathname === '/dashboard' ? 'bg-slate-200 rounded-md text-slate-900' : ''}`}><LayoutDashboard className="h-6 w-6" /></Link>
                                <div className="absolute left-full ml-2 top-0 bg-white shadow-lg rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap pointer-events-none group-hover:pointer-events-auto border border-slate-100"><span className="text-sm text-slate-700">{t('dashboard')}</span></div>
                            </div>
                        ) : (
                            <Link href="/dashboard" className={`sb-elem ${pathname === '/dashboard' ? 'sb-elem-active' : ''}`}>
                                <LayoutDashboard className="mr-3 h-6 w-6" />
                                <span>{t('dashboard')}</span>
                            </Link>
                        )}
                    </div>
                </div>
                {/* CONTACT */}
                <div className="mt-6 px-4 relative group">
                    {sidebarCollapsed ? (
                        <div className="flex justify-center py-3 hover:bg-slate-100 rounded-md cursor-pointer relative">
                            <Phone className="h-6 w-6" />
                            <div className="absolute left-full ml-2 top-0 bg-white shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 min-w-48 pointer-events-none group-hover:pointer-events-auto border border-slate-100">
                                <div className="text-xs font-semibold tracking-wider mb-2 text-slate-500">{t('contacts')}</div>
                                <div className="space-y-1">
                                    <Link href="/dashboard/notifications" className={`sb-elem ${pathname === '/dashboard/notifications' ? 'sb-elem-active' : ''}`}><Bell className="mr-2 h-4 w-4" /><span>{t('notifications')}</span></Link>
                                    <Link href="/dashboard/messages/inbox" className={`sb-elem ${pathname === '/dashboard/messages' ? 'sb-elem-active' : ''}`}><Mails className="mr-2 h-4 w-4" /><span>{t('messages')}</span></Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button onClick={() => setContactsOpen(!contactsOpen)} className="flex items-center justify-between w-full text-xs font-semibold tracking-wider text-white">
                                <div className="flex items-center">
                                    <Phone className="mr-2 h-4 w-4" />
                                    <span>{t('contacts')}</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${contactsOpen ? 'rotate-180' : ''}`} />
                            </Button>
                            {contactsOpen && (
                                <div className="mt-2 space-y-1">
                                    <Link href="/dashboard/notifications" className={`sb-elem ${pathname === '/dashboard/notifications' ? 'sb-elem-active' : ''}`}><Bell className="mr-3 h-6 w-6" /><span>{t('notifications')}</span></Link>
                                    <Link href="/dashboard/messages/inbox" className={`sb-elem ${pathname === '/dashboard/messages' ? 'sb-elem-active' : ''}`}><Mails className="mr-3 h-6 w-6" /><span>{t('messages')}</span></Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {isRoot && (
                    <>
                        {/* SAAS */}
                        <div className="mt-6 px-4 relative group">
                            {sidebarCollapsed ? (
                                <div className="flex justify-center py-3 hover:bg-slate-100 rounded-md cursor-pointer relative">
                                    <Server className="h-6 w-6" />
                                    <div className="absolute left-full ml-2 top-0 bg-white shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 min-w-64 pointer-events-none group-hover:pointer-events-auto border border-slate-100">
                                        <div className="text-xs font-semibold tracking-wider mb-2 text-slate-500">{t('saas')}</div>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                            <Link href="/dashboard/app-settings" className={`sb-elem ${pathname === '/dashboard/app-settings' ? 'sb-elem-active' : ''}`}><Settings className="mr-2 h-4 w-4" /><span>{t('settings')}</span></Link>
                                            <Link href="/dashboard/modules" className={`sb-elem ${pathname === '/dashboard/modules' ? 'sb-elem-active' : ''}`}><Puzzle className="mr-2 h-4 w-4" /><span>{t('modules')}</span></Link>
                                            <Link href="/dashboard/permissions" className={`sb-elem ${pathname === '/dashboard/permissions' ? 'sb-elem-active' : ''}`}><Key className="mr-2 h-4 w-4" /><span>{t('permissions')}</span></Link>
                                            <Link href="/dashboard/roles" className={`sb-elem ${pathname === '/dashboard/roles' ? 'sb-elem-active' : ''}`}><Shield className="mr-2 h-4 w-4" /><span>{t('roles')}</span></Link>
                                            <Link href="/dashboard/packs" className={`sb-elem ${pathname === '/dashboard/packs' ? 'sb-elem-active' : ''}`}><Package className="mr-2 h-4 w-4" /><span>{t('packs')}</span></Link>
                                            <Link href="/dashboard/logs" className={`sb-elem ${pathname === '/dashboard/logs' ? 'sb-elem-active' : ''}`}><Logs className="mr-2 h-4 w-4" /><span>{t('logs')}</span></Link>
                                            <Link href="/dashboard/users/admins" className={`sb-elem ${pathname === '/dashboard/users/admins' ? 'sb-elem-active' : ''}`}><UserCog className="mr-2 h-4 w-4" /><span>{t('ownersAdmins')}</span></Link>
                                            <Link href="/dashboard/companies" className={`sb-elem ${pathname === '/dashboard/companies' ? 'sb-elem-active' : ''}`}><Building className="mr-2 h-4 w-4" /><span>{t('companies')}</span></Link>
                                            <Link href="/dashboard/subscriptions" className={`sb-elem ${pathname === '/dashboard/subscriptions' ? 'sb-elem-active' : ''}`}><FileText className="mr-2 h-4 w-4" /><span>{t('subscriptions')}</span></Link>
                                            <Link href="/dashboard/locations" className={`sb-elem ${pathname === '/dashboard/locations' ? 'sb-elem-active' : ''}`}><Map className="mr-2 h-4 w-4" /><span>{t('locations')}</span></Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Button onClick={() => setSaasOpen(!saasOpen)} className="flex items-center justify-between w-full text-xs font-semibold tracking-wider text-white">
                                        <div className="flex items-center">
                                            <Server className="mr-2 h-4 w-4" />
                                            <span>{t('saas')}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${saasOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    {saasOpen && (
                                        <div className="mt-2 space-y-1">
                                            <Link href="/dashboard/app-settings" className={`sb-elem ${pathname === '/dashboard/app-settings' ? 'sb-elem-active' : ''}`}><Settings className="mr-3 h-6 w-6" /><span>{t('appSettings')}</span></Link>
                                            <Link href="/dashboard/modules" className={`sb-elem ${pathname === '/dashboard/modules' ? 'sb-elem-active' : ''}`}><Puzzle className="mr-3 h-6 w-6" /><span>{t('modules')}</span></Link>
                                            <Link href="/dashboard/permissions" className={`sb-elem ${pathname === '/dashboard/permissions' ? 'sb-elem-active' : ''}`}><Key className="mr-3 h-6 w-6" /><span>{t('permissions')}</span></Link>
                                            <Link href="/dashboard/roles" className={`sb-elem ${pathname === '/dashboard/roles' ? 'sb-elem-active' : ''}`}><Settings className="mr-3 h-6 w-6" /><span>{t('roles')}</span></Link>
                                            <Link href="/dashboard/packs" className={`sb-elem ${pathname === '/dashboard/packs' ? 'sb-elem-active' : ''}`}><Package className="mr-3 h-6 w-6" /><span>{t('packs')}</span></Link>
                                            <Link href="/dashboard/logs" className={`sb-elem ${pathname === '/dashboard/logs' ? 'sb-elem-active' : ''}`}><Logs className="mr-3 h-6 w-6" /><span>{t('systemLogs')}</span></Link>
                                            <Link href="/dashboard/users/admins" className={`sb-elem ${pathname === '/dashboard/users/admins' ? 'sb-elem-active' : ''}`}><UserCog className="mr-3 h-6 w-6" /><span>{t('ownersAdmins')}</span></Link>
                                            <Link href="/dashboard/companies" className={`sb-elem ${pathname === '/dashboard/companies' ? 'sb-elem-active' : ''}`}><Building className="mr-3 h-6 w-6" /><span>{t('companies')}</span></Link>
                                            <Link href="/dashboard/subscriptions" className={`sb-elem ${pathname === '/dashboard/subscriptions' ? 'sb-elem-active' : ''}`}><FileText className="mr-3 h-6 w-6" /><span>{t('subscriptions')}</span></Link>
                                            <Link href="/dashboard/locations" className={`sb-elem ${pathname === '/dashboard/locations' ? 'sb-elem-active' : ''}`}><Map className="mr-3 h-6 w-6" /><span>{t('locations')}</span></Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
                {!isClient && (
                    <>
                        {/* COMPANY */}
                        <div className="mt-6 px-4 relative group">
                            {sidebarCollapsed ? (
                                <div className="flex justify-center py-3 hover:bg-slate-100 rounded-md cursor-pointer relative">
                                    <Building className="h-6 w-6" />
                                    <div className="absolute left-full ml-2 -top-20 bg-white shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 min-w-96 pointer-events-none group-hover:pointer-events-auto border border-slate-100">
                                        <div className="text-xs font-semibold tracking-wider mb-2 text-slate-500">{t('company')}</div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            {!isProvider && (
                                                <>
                                                    <Link href="/dashboard/company-settings" className={`sb-elem ${pathname === '/dashboard/company-settings' ? 'sb-elem-active' : ''}`}><Building className="mr-2 h-4 w-4" /><span>{t('settings')}</span></Link>
                                                    <Link href="/dashboard/users/moderators" className={`sb-elem ${pathname === '/dashboard/users/moderators' ? 'sb-elem-active' : ''}`}><UserCheck className="mr-2 h-4 w-4" /><span>{t('moderatorsAdmins')}</span></Link>
                                                    <Link href="/dashboard/faq" className={`sb-elem ${pathname === '/dashboard/faq' ? 'sb-elem-active' : ''}`}><TableOfContents className="mr-2 h-4 w-4" /><span>{t('faq')}</span></Link>
                                                    <Link href="/dashboard/privacy-policy" className={`sb-elem ${pathname === '/dashboard/privacy-policy' ? 'sb-elem-active' : ''}`}><EarthLock className="mr-2 h-4 w-4" /><span>{t('privacyPolicy')}</span></Link>
                                                    <Link href="/dashboard/terms-conditions" className={`sb-elem ${pathname === '/dashboard/terms-conditions' ? 'sb-elem-active' : ''}`}><Lock className="mr-2 h-4 w-4" /><span>{t('termsConditions')}</span></Link>
                                                    <Link href="/dashboard/categories" className={`sb-elem ${pathname === '/dashboard/categories' ? 'sb-elem-active' : ''}`}><Layers className="mr-2 h-4 w-4" /><span>{t('categories')}</span></Link>
                                                    <Link href="/dashboard/tags" className={`sb-elem ${pathname === '/dashboard/tags' ? 'sb-elem-active' : ''}`}><Tags className="mr-2 h-4 w-4" /><span>{t('tags')}</span></Link>
                                                    <Link href="/dashboard/forms" className={`sb-elem ${pathname === '/dashboard/forms' ? 'sb-elem-active' : ''}`}><Folder className="mr-2 h-4 w-4" /><span>{t('forms')}</span></Link>
                                                    <Link href="/dashboard/users/providers" className={`sb-elem ${pathname === '/dashboard/users/providers' ? 'sb-elem-active' : ''}`}><UserStar className="mr-2 h-4 w-4" /><span>{t('providers')}</span></Link>
                                                </>
                                            )}
                                            <Link href="/dashboard/items" className={`sb-elem ${pathname === '/dashboard/items' ? 'sb-elem-active' : ''}`}><File className="mr-2 h-4 w-4" /><span>{t('services')}</span></Link>
                                            {!isProvider && (
                                                <Link href="/dashboard/users/clients" className={`sb-elem ${pathname === '/dashboard/users/clients' ? 'sb-elem-active' : ''}`}><Users className="mr-2 h-4 w-4" /><span>{t('visitorsClients')}</span></Link>
                                            )}
                                            <Link href="/dashboard/events" className={`sb-elem ${pathname === '/dashboard/events' ? 'sb-elem-active' : ''}`}><Calendar className="mr-2 h-4 w-4" /><span>{t('events')}</span></Link>
                                            {!isProvider && (
                                                <>
                                                    <Link href="/dashboard/blogs" className={`sb-elem ${pathname === '/dashboard/blogs' ? 'sb-elem-active' : ''}`}><Rss className="mr-2 h-4 w-4" /><span>{t('blogs')}</span></Link>
                                                    <Link href="/dashboard/newsletter" className={`sb-elem ${pathname === '/dashboard/newsletter' ? 'sb-elem-active' : ''}`}><Mail className="mr-2 h-4 w-4" /><span>{t('newsletter')}</span></Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Button onClick={() => setCompanyOpen(!companyOpen)} className="flex items-center justify-between w-full text-xs font-semibold tracking-wider text-white">
                                        <div className="flex items-center">
                                            <Building className="mr-2 h-4 w-4" />
                                            <span>{t('company')}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${companyOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    {companyOpen && (
                                        <div className="mt-2 space-y-1">
                                            {!isProvider && (
                                                <>
                                                    <Link href="/dashboard/company-settings" className={`sb-elem ${pathname === '/dashboard/company-settings' ? 'sb-elem-active' : ''}`}><Building className="mr-3 h-6 w-6" /><span>{t('settings')}</span></Link>
                                                    <Link href="/dashboard/users/moderators" className={`sb-elem ${pathname === '/dashboard/users/moderators' ? 'sb-elem-active' : ''}`}><UserCheck className="mr-3 h-6 w-6" /><span>{t('moderatorsAdmins')}</span></Link>
                                                    <Link href="/dashboard/faq" className={`sb-elem ${pathname === '/dashboard/faq' ? 'sb-elem-active' : ''}`}><TableOfContents className="mr-3 h-6 w-6" /><span>{t('faq')}</span></Link>
                                                    <Link href="/dashboard/privacy-policy" className={`sb-elem ${pathname === '/dashboard/privacy-policy' ? 'sb-elem-active' : ''}`}><EarthLock className="mr-3 h-6 w-6" /><span>{t('privacyPolicy')}</span></Link>
                                                    <Link href="/dashboard/terms-conditions" className={`sb-elem ${pathname === '/dashboard/terms-conditions' ? 'sb-elem-active' : ''}`}><Lock className="mr-3 h-6 w-6" /><span>{t('termsConditions')}</span></Link>
                                                    <Link href="/dashboard/categories" className={`sb-elem ${pathname === '/dashboard/categories' ? 'sb-elem-active' : ''}`}><Layers className="mr-3 h-6 w-6" /><span>{t('categories')}</span></Link>
                                                    <Link href="/dashboard/tags" className={`sb-elem ${pathname === '/dashboard/tags' ? 'sb-elem-active' : ''}`}><Tags className="mr-3 h-6 w-6" /><span>{t('tags')}</span></Link>
                                                    <Link href="/dashboard/forms" className={`sb-elem ${pathname === '/dashboard/forms' ? 'sb-elem-active' : ''}`}><Folder className="mr-3 h-6 w-6" /><span>{t('forms')}</span></Link>
                                                    <Link href="/dashboard/users/providers" className={`sb-elem ${pathname === '/dashboard/users/providers' ? 'sb-elem-active' : ''}`}><UserStar className="mr-3 h-6 w-6" /><span>{t('providers')}</span></Link>
                                                </>
                                            )}
                                            <Link href="/dashboard/items" className={`sb-elem ${pathname === '/dashboard/items' ? 'sb-elem-active' : ''}`}><File className="mr-3 h-6 w-6" /><span>{t('services')}</span></Link>
                                            {!isProvider && (
                                                <Link href="/dashboard/users/clients" className={`sb-elem ${pathname === '/dashboard/users/clients' ? 'sb-elem-active' : ''}`}><Users className="mr-3 h-6 w-6" /><span>{t('visitorsClients')}</span></Link>
                                            )}
                                            <Link href="/dashboard/events" className={`sb-elem ${pathname === '/dashboard/events' ? 'sb-elem-active' : ''}`}><Calendar className="mr-3 h-6 w-6" /><span>{t('events')}</span></Link>
                                            {!isProvider && (
                                                <>
                                                    <Link href="/dashboard/blogs" className={`sb-elem ${pathname === '/dashboard/blogs' ? 'sb-elem-active' : ''}`}><Rss className="mr-3 h-6 w-6" /><span>{t('blogs')}</span></Link>
                                                    <Link href="/dashboard/newsletter" className={`sb-elem ${pathname === '/dashboard/newsletter' ? 'sb-elem-active' : ''}`}><Mail className="mr-3 h-6 w-6" /><span>{t('newsletter')}</span></Link>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
                {/* USER SPACE */}
                <div className="mt-6 px-4 relative group">
                    {sidebarCollapsed ? (
                        <div className="flex justify-center py-3 hover:bg-gray-200 rounded-md cursor-pointer relative">
                            <Blocks className="h-6 w-6" />
                            <div className="absolute left-full ml-2 -top-20 bg-white shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 min-w-96 pointer-events-none group-hover:pointer-events-auto">
                                <div className="text-xs font-semibold tracking-wider mb-2">{t('userSpace')}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <Link href="/dashboard/interactions" className={`sb-elem ${pathname === '/dashboard/interactions' ? 'sb-elem-active' : ''}`}><File className="mr-2 h-4 w-4" /><span>{t('interactions')}</span></Link>
                                    <Link href="/dashboard/calendar" className={`sb-elem ${pathname === '/dashboard/calendar' ? 'sb-elem-active' : ''}`}><Calendar className="mr-2 h-4 w-4" /><span>{t('calendar')}</span></Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button onClick={() => setUserSpaceOpen(!userSpaceOpen)} className="flex items-center justify-between w-full text-xs font-semibold tracking-wider text-white">
                                <div className="flex items-center">
                                    <Blocks className="mr-2 h-4 w-4" />
                                    <span>{t('userSpace')}</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${userSpaceOpen ? 'rotate-180' : ''}`} />
                            </Button>
                            {userSpaceOpen && (
                                <div className="mt-2 space-y-1">
                                    <Link href="/dashboard/interactions" className={`sb-elem ${pathname === '/dashboard/interactions' ? 'sb-elem-active' : ''}`}><File className="mr-3 h-6 w-6" /><span>{t('interactions')}</span></Link>
                                    <Link href="/dashboard/calendar" className={`sb-elem ${pathname === '/dashboard/calendar' ? 'sb-elem-active' : ''}`}><Calendar className="mr-3 h-6 w-6" /><span>{t('calendar')}</span></Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {!isClient && !isProvider && (
                    <>
                        {/* RAPPORTS */}
                        <div className="mt-6 px-4 relative group">
                            {sidebarCollapsed ? (
                                <div className="flex justify-center py-3 hover:bg-gray-200 rounded-md cursor-pointer relative">
                                    <BarChart3 className="h-6 w-6" />
                                    <div className="absolute left-full ml-2 -top-32 bg-white shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 min-w-96 pointer-events-none group-hover:pointer-events-auto">
                                        <div className="text-xs font-semibold tracking-wider mb-2">{t('reports')}</div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            {isRoot && (
                                                <>
                                                    <Link href="/dashboard/rapports/companies" className={`sb-elem ${pathname === '/dashboard/rapports/companies' ? 'sb-elem-active' : ''}`}><Building className="mr-2 h-4 w-4" /><span>{t('companies')}</span></Link>
                                                    <Link href="/dashboard/rapports/subscriptions" className={`sb-elem ${pathname === '/dashboard/rapports/subscriptions' ? 'sb-elem-active' : ''}`}><FileText className="mr-2 h-4 w-4" /><span>{t('subscriptions')}</span></Link>
                                                    <Link href="/dashboard/rapports/users" className={`sb-elem ${pathname === '/dashboard/rapports/users' ? 'sb-elem-active' : ''}`}><Users className="mr-2 h-4 w-4" /><span>{t('allUsers')}</span></Link>
                                                    <Link href="/dashboard/rapports/users/admins" className={`sb-elem ${pathname === '/dashboard/rapports/users/admins' ? 'sb-elem-active' : ''}`}><UserCog className="mr-2 h-4 w-4" /><span>{t('ownersAdmins')}</span></Link>
                                                </>
                                            )}
                                            <Link href="/dashboard/rapports/audiances" className={`sb-elem ${pathname === '/dashboard/rapports/audiances' ? 'sb-elem-active' : ''}`}><Eye className="mr-2 h-4 w-4" /><span>{t('audiences')}</span></Link>
                                            <Link href="/dashboard/rapports/categories" className={`sb-elem ${pathname === '/dashboard/rapports/categories' ? 'sb-elem-active' : ''}`}><Layers className="mr-2 h-4 w-4" /><span>{t('categories')}</span></Link>
                                            <Link href="/dashboard/rapports/tags" className={`sb-elem ${pathname === '/dashboard/rapports/tags' ? 'sb-elem-active' : ''}`}><Tags className="mr-2 h-4 w-4" /><span>{t('tags')}</span></Link>
                                            <Link href="/dashboard/rapports/users/providers" className={`sb-elem ${pathname === '/dashboard/rapports/users/providers' ? 'sb-elem-active' : ''}`}><UserStar className="mr-2 h-4 w-4" /><span>{t('providers')}</span></Link>
                                            <Link href="/dashboard/rapports/items" className={`sb-elem ${pathname === '/dashboard/rapports/items' ? 'sb-elem-active' : ''}`}><File className="mr-2 h-4 w-4" /><span>{t('services')}</span></Link>
                                            <Link href="/dashboard/rapports/media" className={`sb-elem ${pathname === '/dashboard/rapports/media' ? 'sb-elem-active' : ''}`}><Film className="mr-2 h-4 w-4" /><span>{t('media')}</span></Link>
                                            <Link href="/dashboard/rapports/users/clients" className={`sb-elem ${pathname === '/dashboard/rapports/users/clients' ? 'sb-elem-active' : ''}`}><Users className="mr-2 h-4 w-4" /><span>{t('visitorsClients')}</span></Link>
                                            <Link href="/dashboard/rapports/events" className={`sb-elem ${pathname === '/dashboard/rapports/events' ? 'sb-elem-active' : ''}`}><Calendar className="mr-2 h-4 w-4" /><span>{t('events')}</span></Link>
                                            <Link href="/dashboard/rapports/logs" className={`sb-elem ${pathname === '/dashboard/rapports/logs' ? 'sb-elem-active' : ''}`}><Logs className="mr-2 h-4 w-4" /><span>{t('logs')}</span></Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Button onClick={() => setRapportsOpen(!rapportsOpen)} className="flex items-center justify-between w-full text-xs font-semibold tracking-wider text-white">
                                        <div className="flex items-center">
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            <span>{t('reports')}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${rapportsOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    {rapportsOpen && (
                                        <div className="mt-2 space-y-1">
                                            {isRoot && (
                                                <>
                                                    <Link href="/dashboard/rapports/companies" className={`sb-elem ${pathname === '/dashboard/rapports/companies' ? 'sb-elem-active' : ''}`}><Building className="mr-3 h-6 w-6" /><span>{t('companies')}</span></Link>
                                                    <Link href="/dashboard/rapports/subscriptions" className={`sb-elem ${pathname === '/dashboard/rapports/subscriptions' ? 'sb-elem-active' : ''}`}><FileText className="mr-3 h-6 w-6" /><span>{t('subscriptions')}</span></Link>
                                                    <Link href="/dashboard/rapports/users" className={`sb-elem ${pathname === '/dashboard/rapports/users' ? 'sb-elem-active' : ''}`}><Users className="mr-3 h-6 w-6" /><span>{t('allUsers')}</span></Link>
                                                    <Link href="/dashboard/rapports/users/admins" className={`sb-elem ${pathname === '/dashboard/rapports/users/admins' ? 'sb-elem-active' : ''}`}><UserCog className="mr-3 h-6 w-6" /><span>{t('ownersAdmins')}</span></Link>
                                                </>
                                            )}
                                            <Link href="/dashboard/rapports/audiances" className={`sb-elem ${pathname === '/dashboard/rapports/audiances' ? 'sb-elem-active' : ''}`}><Eye className="mr-3 h-6 w-6" /><span>{t('audiences')}</span></Link>
                                            <Link href="/dashboard/rapports/categories" className={`sb-elem ${pathname === '/dashboard/rapports/categories' ? 'sb-elem-active' : ''}`}><Layers className="mr-3 h-6 w-6" /><span>{t('categories')}</span></Link>
                                            <Link href="/dashboard/rapports/tags" className={`sb-elem ${pathname === '/dashboard/rapports/tags' ? 'sb-elem-active' : ''}`}><Tags className="mr-3 h-6 w-6" /><span>{t('tags')}</span></Link>
                                            <Link href="/dashboard/rapports/users/providers" className={`sb-elem ${pathname === '/dashboard/rapports/users/providers' ? 'sb-elem-active' : ''}`}><UserStar className="mr-3 h-6 w-6" /><span>{t('providers')}</span></Link>
                                            <Link href="/dashboard/rapports/items" className={`sb-elem ${pathname === '/dashboard/rapports/items' ? 'sb-elem-active' : ''}`}><File className="mr-3 h-6 w-6" /><span>{t('services')}</span></Link>
                                            <Link href="/dashboard/rapports/media" className={`sb-elem ${pathname === '/dashboard/rapports/media' ? 'sb-elem-active' : ''}`}><Film className="mr-3 h-6 w-6" /><span>{t('media')}</span></Link>
                                            <Link href="/dashboard/rapports/users/clients" className={`sb-elem ${pathname === '/dashboard/rapports/users/clients' ? 'sb-elem-active' : ''}`}><Users className="mr-3 h-6 w-6" /><span>{t('visitorsClients')}</span></Link>
                                            <Link href="/dashboard/rapports/events" className={`sb-elem ${pathname === '/dashboard/rapports/events' ? 'sb-elem-active' : ''}`}><Calendar className="mr-3 h-6 w-6" /><span>{t('events')}</span></Link>
                                            <Link href="/dashboard/rapports/logs" className={`sb-elem ${pathname === '/dashboard/rapports/logs' ? 'sb-elem-active' : ''}`}><Logs className="mr-3 h-6 w-6" /><span>{t('logs')}</span></Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </nav>
        </aside>
    );
}
