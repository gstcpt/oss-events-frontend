"use client";

import { useEffect, useState, useMemo } from "react";
import {
    BarChart as BarChartIcon,
    Calendar,
    CheckCircle2,
    Clock,
    Plus,
    Users,
    DollarSign,
    Package,
    Tag,
    TrendingUp,
    ArrowUpRight,
    LayoutDashboard,
    Zap,
    Briefcase,
    Heart,
    CalendarDays,
    BarChart3,
    Cog,
    Activity,
    Building2,
    PlusCircle,
    PlusSquare,
    Search
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { WeatherWidget } from "@/components/ui/WeatherWidget";
import { AreaChart } from "@/components/ui/AreaChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { useAuth } from "@/context/AuthContext";
import { getDashboard, getRevenuePerMonth } from "@/lib/api/dashboard";
import { getEventsPerCategory, getEventsByMonth } from "@/lib/api/rapports";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Data Intelligence Types
interface DashboardMetric {
    title: string;
    value: number | string;
    icon: any;
    trend?: string;
}

const EventList = ({ title, events }: { title: string, events: any[] }) => {
    const t = useTranslations('Dashboard.page');
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {events.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 rounded-lg">
                            <tr>
                                <th className="px-4 py-3 font-medium">{t('event')}</th>
                                <th className="px-4 py-3 font-medium">{t('start')}</th>
                                <th className="px-4 py-3 font-medium">{t('end')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {events.map((event, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">{event.title}</td>
                                    <td className="px-4 py-3 text-slate-500">{event.start_date}</td>
                                    <td className="px-4 py-3 text-slate-500">{event.end_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-slate-500 text-sm">{t('noEventsFound')}</p>
            )}
        </div>
    );
};

export default function Dashboard() {
    const t = useTranslations('Dashboard.page');
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({});
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [eventsPerCategory, setEventsPerCategory] = useState<any[]>([]);
    const [eventsByMonth, setEventsByMonth] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const fetchData = async () => {
            try {
                const [dashboardData, revenueData] = await Promise.all([getDashboard(user), getRevenuePerMonth(user)]);
                setData(dashboardData || {});
                setRevenueTrend(revenueData || []);
                if (user.role === "Root" || user.role === "Admin") {
                    const [categoryData, monthData] = await Promise.all([getEventsPerCategory(user), getEventsByMonth(user)]);
                    setEventsPerCategory(categoryData || []);
                    setEventsByMonth(monthData || []);
                }
            } catch (error) { toast.error(t('cloudSyncFailed', { error: error instanceof Error ? error.message : 'Unknown error' })); } finally { setLoading(false); }
        };
        fetchData();
    }, [user]);
    const revenueChartData = useMemo(() => { return revenueTrend.map(r => ({ x: r.month, y: r.revenue })); }, [revenueTrend]);
    const eventChartData = useMemo(() => { return eventsByMonth.map(m => ({ x: m.month, y: m.count })); }, [eventsByMonth]);
    const categoryChartData = useMemo(() => { return eventsPerCategory.map(c => ({ name: c.name, value: c.events })); }, [eventsPerCategory]);
    const stats = data.stats || {};
    const isAdmin = user?.role === "Root" || user?.role === "Admin";
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-slate-500 font-medium animate-pulse tracking-wide text-sm">{t('loading')}</div>
            </div>
        );
    }
    if (!user) return null;
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            {/* Dashboard Header */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
                    <p className="mt-1 text-slate-500 font-medium">{t('welcomeBack', { firstname: user.firstname })}</p>
                </div>
            </div>

            {/* Stats Cards - Admin/Root View */}
            {(user.role === 'Root' || user.role === 'Admin') && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Users} iconColor="text-blue-600" iconBgColor="bg-blue-100" title={t('providers')} value={stats.providers || 0} />
                        <StatCard icon={Users} iconColor="text-green-600" iconBgColor="bg-green-100" title={t('clients')} value={stats.clients || 0} />
                        <StatCard icon={Calendar} iconColor="text-yellow-600" iconBgColor="bg-yellow-100" title={t('events')} value={stats.events || 0} />
                        <StatCard icon={Package} iconColor="text-purple-600" iconBgColor="bg-purple-100" title={t('items')} value={stats.items || 0} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard icon={BarChartIcon} iconColor="text-pink-600" iconBgColor="bg-pink-100" title={t('categories')} value={stats.categories || 0} />
                        <StatCard icon={Tag} iconColor="text-primary" iconBgColor="bg-orange-100" title={t('tags')} value={stats.tags || 0} />
                        <StatCard icon={DollarSign} iconColor="text-emerald-600" iconBgColor="bg-emerald-100" title={t('revenues')} value={`${(data.revenues || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                    </div>

                    {/* Weather Widget */}
                    <WeatherWidget />

                    {/* Charts Section */}
                    {(eventChartData.length > 0 || categoryChartData.length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {eventChartData.length > 0 && (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><AreaChart title={t('eventsPerMonth')} data={eventChartData} color="#3b82f6" label={t('events')} showCard={false} /></div>)}
                            {categoryChartData.length > 0 && (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full min-h-[300px]"><DonutChart title={t('eventsByCategory')} data={categoryChartData} centerText={t('events')} showCard={false} /></div>)}
                        </div>
                    )}

                    {/* Top Items, Categories, Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-purple-600" />{t('topItems')}</h3>
                            {(data.topItems && data.topItems?.length > 0) ? (
                                <ul className="space-y-3">
                                    {data.topItems?.map((item: any, idx: number) => (
                                        <li key={idx} className="flex justify-between items-center group">
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.title}</span>
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{item.count} {t('events_count')}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-500 text-sm">{t('noItemsYet')}</p>)}
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChartIcon className="h-5 w-5 text-pink-600" />{t('topCategories')}</h3>
                            {(data.topCategories && data.topCategories?.length > 0) ? (
                                <ul className="space-y-3">
                                    {data.topCategories?.map((cat: any, idx: number) => (
                                        <li key={idx} className="flex justify-between items-center group">
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.title}</span>
                                            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">{cat.count} {t('uses')}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-500 text-sm">{t('noCategoriesYet')}</p>)}
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />{t('topTags')}</h3>
                            {(data.topTags && data.topTags?.length > 0) ? (
                                <ul className="space-y-3">
                                    {data.topTags?.map((tag: any, idx: number) => (
                                        <li key={idx} className="flex justify-between items-center group">
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">{tag.title}</span>
                                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">{tag.count} {t('uses')}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-500 text-sm">{t('noTagsYet')}</p>)}
                        </div>
                    </div>

                    {/* Last Added Items, Providers, Clients */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-800">{t('last5ItemsAdded')}</h3>
                            {(data.lastItems && data.lastItems?.length > 0) ? (
                                <ul className="space-y-3">
                                    {data.lastItems?.map((item: any, idx: number) => (
                                        <li key={idx} className="text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div className="font-medium text-slate-700">{item.title}</div>
                                            <div className="text-xs text-gray-500">{item.created_at || t('recently')}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-500 text-sm">{t('noItemsAddedYet')}</p>)}
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-800">{t('last5Providers')}</h3>
                            {(data.lastProviders && data.lastProviders?.length > 0) ? (
                                <ul className="space-y-3">
                                    {data.lastProviders?.map((prov: any, idx: number) => (
                                        <li key={idx} className="text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div className="font-medium text-slate-700">{prov.name}</div>
                                            <div className="text-xs text-gray-500">{prov.created_at || t('recently')}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-500 text-sm">{t('noProvidersAddedYet')}</p>)}
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-800">{t('last5Clients')}</h3>
                            {(data.lastClients && data.lastClients?.length > 0) ? (
                                <ul className="space-y-3">
                                    {data.lastClients?.map((cli: any, idx: number) => (
                                        <li key={idx} className="text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div className="font-medium text-slate-700">{cli.name}</div>
                                            <div className="text-xs text-gray-500">{cli.created_at || t('recently')}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-500 text-sm">{t('noClientsAddedYet')}</p>)}
                        </div>
                    </div>
                    {/* Last 10 Events List */}
                    {data.lastEvents?.length > 0 && (<EventList title={t('last10Events')} events={data.lastEvents.slice(0, 10)} />)}
                </>
            )}

            {/* Stats Cards - Provider View */}
            {user.role === 'Provider' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={Package} iconColor="text-blue-600" iconBgColor="bg-blue-100" title={t('myItems')} value={stats.items || 0} />
                        <StatCard icon={Calendar} iconColor="text-yellow-600" iconBgColor="bg-yellow-100" title={t('eventsUsingMyItems')} value={stats.events || 0} />
                        <StatCard icon={Users} iconColor="text-green-600" iconBgColor="bg-green-100" title={t('clientsUsingMyItems')} value={stats.clients || 0} />
                    </div>

                    <WeatherWidget />

                    {/* Live Activity feed */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800"><Activity className="h-5 w-5 text-indigo-600" />{t('liveActivityStream')}</h3>
                            {(data.liveActivity && data.liveActivity?.length > 0) ? (
                                <ul className="space-y-3 divide-y divide-slate-50">
                                    {data.liveActivity?.slice(0, 5).map((activity: any, idx: number) => {
                                        const tLive = useTranslations('Dashboard.page.liveActivity');
                                        const userName = activity.user || 'User';
                                        const targetType = activity.targetType || '';
                                        let description = '';
                                        if (activity.type === 'interaction') {
                                            const actionKey = activity.description?.typeKey || 'interacted';
                                            const actionText = tLive(actionKey as any);
                                            description = `${userName} ${actionText} ${targetType}`;
                                        } else if (activity.type === 'event') {
                                            description = tLive('newEventBooking') + ': ' + (activity.description?.title || activity.title);
                                        }
                                        return (
                                            <li key={idx} className="text-sm py-2 first:pt-0 last:pb-0">
                                                <div className="font-medium text-slate-800">{description}</div>
                                                <div className="text-xs text-slate-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (<p className="text-slate-500 text-sm">{t('noRecentActivityDetected')}</p>)}
                        </div>
                    </div>
                </>
            )}

            {/* Stats Cards - Client View */}
            {user.role === 'Client' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard icon={Calendar} iconColor="text-blue-600" iconBgColor="bg-blue-100" title={t('myEvents')} value={stats.events || 0} />
                        <StatCard icon={DollarSign} iconColor="text-amber-600" iconBgColor="bg-amber-100" title={t('totalSpent')} value={`${(data.revenues || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                    </div>

                    <WeatherWidget />

                    {/* Live Activity feed */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800"><Activity className="h-5 w-5 text-indigo-600" />{t('liveActivityStream')}</h3>
                            {(data.liveActivity && data.liveActivity?.length > 0) ? (
                                <ul className="space-y-3 divide-y divide-slate-50">
                                    {data.liveActivity?.slice(0, 5).map((activity: any, idx: number) => {
                                        const tLive = useTranslations('Dashboard.page.liveActivity');
                                        const userName = activity.user || 'User';
                                        const targetType = activity.targetType || '';
                                        let description = '';
                                        if (activity.type === 'interaction') {
                                            const actionKey = activity.description?.typeKey || 'interacted';
                                            const actionText = tLive(actionKey as any);
                                            description = `${userName} ${actionText} ${targetType}`;
                                        } else if (activity.type === 'event') {
                                            description = tLive('newEventBooking') + ': ' + (activity.description?.title || activity.title);
                                        }
                                        return (
                                            <li key={idx} className="text-sm py-2 first:pt-0 last:pb-0">
                                                <div className="font-medium text-slate-800">{description}</div>
                                                <div className="text-xs text-slate-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (<p className="text-slate-500 text-sm">{t('noRecentActivityDetected')}</p>)}
                        </div>
                    </div>
                </>
            )}

            {/* Quick Actions */}
            {data.quickAccess && data.quickAccess.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {data.quickAccess?.map((action: any, idx: number) => {
                        const iconMap: Record<string, any> = { Plus, BarChart: BarChartIcon, BarChart3, Users, Calendar, CalendarDays, CheckCircle2, Package, Building2, PlusCircle, PlusSquare, Search, Heart, LayoutDashboard, Activity, Cog };
                        const IconComponent = iconMap[action.icon] || Plus;
                        return (
                            <QuickActionCard
                                key={idx}
                                icon={IconComponent}
                                keyProp={action.key}
                                href={action.href}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}