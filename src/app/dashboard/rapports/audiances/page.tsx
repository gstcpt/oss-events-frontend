"use client";
import { useState, useEffect } from "react";
import { audienceApi } from "@/lib/api/rapports";
import { Visitor, Session, PageView, AudienceStats, DailyAggregate } from "@/types/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { Users, Timer, Eye, TrendingUp, Monitor, Smartphone, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LineChart } from "@/components/ui/LineChart";
import { StatCard } from "@/components/ui/StatCard";

export default function AudienceDashboard() {
  const { user: currentUser } = useAuth();

  const isAuthorized = currentUser && (Number(currentUser.role_id) === 1 || Number(currentUser.role_id) === 2);
  const isRoot = Number(currentUser?.role_id) === 1;

  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'sessions' | 'page-views'>('overview');
  const [stats, setStats] = useState<AudienceStats | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [dailyAggregates, setDailyAggregates] = useState<DailyAggregate[]>([]);
  const [itemsAggregates, setItemsAggregates] = useState<DailyAggregate[]>([]);
  const [categoriesAggregates, setCategoriesAggregates] = useState<DailyAggregate[]>([]);
  const [providersAggregates, setProvidersAggregates] = useState<DailyAggregate[]>([]);
  const [blogsAggregates, setBlogsAggregates] = useState<DailyAggregate[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadStats();
      loadDailyAggregates();
      if (activeTab === 'visitors') loadVisitors();
      if (activeTab === 'sessions') loadSessions();
      if (activeTab === 'page-views') loadPageViews();
    }
  }, [activeTab, dateRange, currentUser]);

  useEffect(() => {
    if (currentUser && !isAuthorized) {
      toast.error("Unauthorized access to audience analytics.");
    }
  }, [currentUser, isAuthorized]);

  const loadStats = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const response = await audienceApi.getAudienceStats({ startDate: dateRange.start, endDate: dateRange.end });
      if (response.success && response.data) { setStats(response.data); } else { toast.error(response.error || "Failed to load audience statistics"); }
    } catch (error) { toast.error("An error occurred while loading statistics"); } finally { setIsLoading(false); }
  };
  const loadDailyAggregates = async () => {
    if (!isAuthorized) return;
    try {
      const results = await Promise.all([
        audienceApi.getDailyAggregates({ startDate: dateRange.start, endDate: dateRange.end }),
        audienceApi.getDailyAggregates({ startDate: dateRange.start, endDate: dateRange.end, resourceType: 'items' }),
        audienceApi.getDailyAggregates({ startDate: dateRange.start, endDate: dateRange.end, resourceType: 'categories' }),
        audienceApi.getDailyAggregates({ startDate: dateRange.start, endDate: dateRange.end, resourceType: 'providers' }),
        audienceApi.getDailyAggregates({ startDate: dateRange.start, endDate: dateRange.end, resourceType: 'blogs' }),
      ]);

      if (results[0].success && results[0].data) setDailyAggregates(results[0].data as DailyAggregate[]);
      if (results[1].success && results[1].data) setItemsAggregates(results[1].data as DailyAggregate[]);
      if (results[2].success && results[2].data) setCategoriesAggregates(results[2].data as DailyAggregate[]);
      if (results[3].success && results[3].data) setProvidersAggregates(results[3].data as DailyAggregate[]);
      if (results[4].success && results[4].data) setBlogsAggregates(results[4].data as DailyAggregate[]);
    } catch (error) {
      toast.error('Error loading daily aggregates');
    }
  };
  const loadVisitors = async () => {
    if (!isAuthorized) return;
    try {
      const response = await audienceApi.getVisitors({ startDate: dateRange.start, endDate: dateRange.end });
      if (response.success && response.data) { setVisitors(response.data as Visitor[]); } else { toast.error(response.error || "Failed to load visitors"); }
    } catch (error) { toast.error("An error occurred while loading visitors"); }
  };
  const loadSessions = async () => {
    if (!isAuthorized) return;
    try {
      const response = await audienceApi.getSessions({ startDate: dateRange.start, endDate: dateRange.end });
      if (response.success && response.data) { setSessions(response.data as Session[]); } else { toast.error(response.error || "Failed to load sessions"); }
    } catch (error) { toast.error("An error occurred while loading sessions"); }
  };
  const loadPageViews = async () => {
    if (!isAuthorized) return;
    try {
      const response = await audienceApi.getPageViews({ startDate: dateRange.start, endDate: dateRange.end });
      if (response.success && response.data) { setPageViews(response.data as PageView[]); } else { toast.error(response.error || "Failed to load page views"); }
    } catch (error) { toast.error("An error occurred while loading page views"); }
  };
  const handleExport = async (type: 'visitors' | 'sessions' | 'page-views') => {
    if (!isAuthorized) {
      toast.error("Unauthorized access");
      return;
    }
    setIsLoading(true);
    try {
      const response = await audienceApi.exportAudienceData(type, { startDate: dateRange.start, endDate: dateRange.end });
      if (response.success && response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename || `${type}_export.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        toast.success(`${type} data exported successfully`);
      } else {
        toast.error(response.error || `Failed to export ${type} data`);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };
  const toLineData = (field: 'views' | 'uniques') => {
    const list = dailyAggregates || [];
    if (granularity === 'day') {
      return list.map(da => ({ x: new Date(da.day).toLocaleDateString(), y: (da as any)[field] || 0 }));
    }
    if (granularity === 'week') {
      const buckets: Record<string, number> = {};
      list.forEach(da => {
        const d = new Date(da.day);
        const day = d.getUTCDay(); // 0-6
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday start
        const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
        const key = `${monday.getUTCFullYear()}-W${String(Math.ceil((monday.getUTCDate()) / 7)).padStart(2, '0')}-${String(monday.getUTCMonth() + 1).padStart(2, '0')}-${String(monday.getUTCDate()).padStart(2, '0')}`;
        buckets[key] = (buckets[key] || 0) + ((da as any)[field] || 0);
      });
      return Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ x: k, y: v }));
    }
    const buckets: Record<string, number> = {};
    list.forEach(da => {
      const d = new Date(da.day);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + ((da as any)[field] || 0);
    });
    return Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ x: k, y: v }));
  };
  const toLineDataFrom = (list: DailyAggregate[], field: 'views' | 'uniques') => {
    if (granularity === 'day') {
      return (list || []).map(da => ({ x: new Date(da.day).toLocaleDateString(), y: (da as any)[field] || 0 }));
    }
    if (granularity === 'week') {
      const buckets: Record<string, number> = {};
      (list || []).forEach(da => {
        const d = new Date(da.day);
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
        const key = `${monday.getUTCFullYear()}-W${String(Math.ceil((monday.getUTCDate()) / 7)).padStart(2, '0')}-${String(monday.getUTCMonth() + 1).padStart(2, '0')}-${String(monday.getUTCDate()).padStart(2, '0')}`;
        buckets[key] = (buckets[key] || 0) + ((da as any)[field] || 0);
      });
      return Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ x: k, y: v }));
    }
    const buckets: Record<string, number> = {};
    (list || []).forEach(da => {
      const d = new Date(da.day);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + ((da as any)[field] || 0);
    });
    return Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ x: k, y: v }));
  };
  const visitorColumns: DataTableColumn<Visitor>[] = [
    { header: "Client ID", accessor: "clientId", className: "font-mono text-sm" },
    { header: "First Seen", accessor: "firstSeen", cell: (visitor) => new Date(visitor.firstSeen).toLocaleString() },
    { header: "Last Seen", accessor: "lastSeen", cell: (visitor) => new Date(visitor.lastSeen).toLocaleString() },
    {
      header: "Duration", accessor: "id", cell: (visitor) => {
        const start = new Date(visitor.firstSeen).getTime();
        const end = new Date(visitor.lastSeen).getTime();
        const diff = end - start;
        return diff > 0 ? formatDuration(diff) : '—';
      }
    },
    { header: "Device", accessor: "device" },
    { header: "Browser", accessor: "browser" }
  ];
  const sessionColumns: DataTableColumn<Session>[] = [
    { header: "Session UUID", accessor: "sessionUuid", className: "font-mono text-sm" },
    { header: "Started At", accessor: "startedAt", cell: (session) => new Date(session.startedAt).toLocaleString() },
    { header: "Duration", accessor: "durationMs", cell: (session) => session.durationMs ? formatDuration(session.durationMs) : 'Active' },
    { header: "Entry URL", accessor: "entryUrl", className: "truncate max-w-xs" },
    { header: "Resource", accessor: "entryResource", cell: (session) => session.entryResource ? `${session.entryResource} (${session.entryResourceId})` : 'N/A' }
  ];
  const pageViewColumns: DataTableColumn<PageView>[] = [
    { header: "Path", accessor: "path", className: "font-mono text-sm truncate max-w-xs" },
    { header: "Title", accessor: "title" },
    { header: "Started At", accessor: "startedAt", cell: (pageView) => new Date(pageView.startedAt).toLocaleString() },
    { header: "Duration", accessor: "durationMs", cell: (pageView) => pageView.durationMs ? formatDuration(pageView.durationMs) : 'N/A' },
    { header: "Interactions", accessor: "interactions" }
  ];
  const handleEdit = (item: any) => { toast.info("Edit functionality would be implemented here"); };
  const handleDelete = (item: any) => { toast.info("Delete functionality would be implemented here"); };
  if (!currentUser) { return (<div className="p-6"><div className="text-center py-12"><p className="text-slate-500 font-medium">Please log in to access audience analytics</p></div></div>); }
  if (!isAuthorized) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-rose-500 mb-4 flex justify-center"><TrendingUp className="w-12 h-12" /></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 font-medium font-sans">You don't have permission to view audience intelligence</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-0 space-y-10 animate-in fade-in slide-in-from-right-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Traffic Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Audience Analytics</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Holistic monitoring platform engagement, visitor trajectories, and conversion funnel performance.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-colors">
            <Users className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-10 bg-slate-100/30 backdrop-blur-sm p-1.5 rounded-2xl self-start inline-flex border border-slate-200/50">
        {(['overview', 'visitors', 'sessions', 'page-views'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium capitalize transition-all duration-500 ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50 transform -translate-y-0.5' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
            {tab === 'overview' && <TrendingUp className="w-4 h-4 mr-2" />}
            {tab === 'visitors' && <Users className="w-4 h-4 mr-2" />}
            {tab === 'sessions' && <Timer className="w-4 h-4 mr-2" />}
            {tab === 'page-views' && <Eye className="w-4 h-4 mr-2" />}
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} iconColor="text-blue-600" iconBgColor="bg-blue-50" title="Total Visitors" value={stats.totalVisitors} />
            <StatCard icon={Timer} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" title="Active Sessions" value={stats.activeSessions} />
            <StatCard icon={Eye} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" title="Page Dimensions" value={stats.pageViews} />
            <StatCard icon={TrendingUp} iconColor="text-amber-600" iconBgColor="bg-amber-50" title="Engagement Rate" value={`${(100 - (stats.bounceRate || 0)).toFixed(1)}%`} />
          </div>

          <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Time Granularity</span>
              <div className="flex gap-1">
                {['day', 'week', 'month'].map((g) => (
                  <Button key={g} variant={granularity === g ? 'default' : 'ghost'} onClick={() => setGranularity(g as any)} className={`h-8 px-4 text-xs font-medium capitalize ${granularity === g ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
                    {g}
                  </Button>
                ))}
              </div>
              <div className="flex-1">
                <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-xl h-11 focus:ring-primary" />
              </div>
              <span className="text-xs font-medium text-slate-500">to</span>
              <div className="flex-1">
                <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full bg-slate-50 border-slate-100 rounded-xl h-11 focus:ring-primary" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card-no-decor p-1"><LineChart title="Visitors (Uniques)" data={toLineData('uniques')} color="#3b82f6" /></div>
            <div className="card-no-decor p-1"><LineChart title="Global View Traffic" data={toLineData('views')} color="#6366f1" /></div>
            <div className="card-no-decor p-1"><LineChart title="Resource Distribution" data={toLineDataFrom(itemsAggregates, 'views')} color="#10b981" /></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-xl shadow-slate-100 border border-white overflow-hidden group">
                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-600">Top Content Vectors</h3>
                </div>
                <div className="p-8 space-y-5">
                  {stats.topPages.map((page, index) => (
                    <div key={index} className="flex justify-between items-center group/item transition-all hover:translate-x-1 duration-300">
                      <div className="flex items-center space-x-4 truncate">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors flex items-center justify-center text-xs font-semibold text-slate-500">{index + 1}</div>
                        <a href={page.path} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-600 hover:text-primary truncate">{page.path}</a>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg group-hover/item:bg-slate-200 transition-colors">{page.views} Views</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-xl shadow-slate-100 border border-white overflow-hidden group">
                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-600">Device Archetypes</h3>
                </div>
                <div className="p-8 space-y-5">
                  {stats.deviceStats.map((device, index) => (
                    <div key={index} className="flex justify-between items-center group/item transition-all hover:translate-x-1 duration-300">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover/item:bg-indigo-100 transition-colors flex items-center justify-center mr-4">
                          {device.device?.toLowerCase().includes('mobile') ? (<Smartphone className="w-5 h-5 text-indigo-500" />) : (<Monitor className="w-5 h-5 text-slate-400" />)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{device.device || 'Unknown'}</span>
                      </div>
                      <span className="text-xs font-semibold text-white bg-slate-900 px-3 py-1 rounded-lg">{device.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'visitors' && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center">
              <Users size={18} className="mr-2 text-indigo-500" /> Member Trail
            </h3>
            <Button onClick={() => handleExport('visitors')} disabled={isLoading} variant="outline" className="border-slate-200 text-xs font-medium h-9">
              <Download className="w-3 h-3 mr-2" />Export .XLSX
            </Button>
          </div>
          <div className="p-0">
            <DataTable columns={visitorColumns} data={visitors} showEdit={false} showDelete={false} defaultSort={{ key: 'id', direction: 'descending' }} />
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center">
              <Timer size={18} className="mr-2 text-emerald-500" /> Temporal Sessions
            </h3>
            <Button onClick={() => handleExport('sessions')} disabled={isLoading} variant="outline" className="border-slate-200 text-xs font-medium h-9">
              <Download className="w-3 h-3 mr-2" />Export .XLSX
            </Button>
          </div>
          <div className="p-0">
            <DataTable columns={sessionColumns} data={sessions} showEdit={false} showDelete={false} defaultSort={{ key: 'id', direction: 'descending' }} />
          </div>
        </div>
      )}

      {activeTab === 'page-views' && (
        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white overflow-hidden ring-1 ring-slate-100">
          <div className="px-8 py-7 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center">
              <Eye size={20} className="mr-3 text-indigo-500" /> Path Trajectories
            </h3>
            <Button onClick={() => handleExport('page-views')} disabled={isLoading} variant="outline" className="border-slate-200 text-sm font-medium px-6 rounded-xl shadow-xl shadow-slate-100">
              <Download className="w-4 h-4 mr-2" />Export Data
            </Button>
          </div>
          <div className="p-4">
            <DataTable columns={pageViewColumns} data={pageViews} showEdit={false} showDelete={false} defaultSort={{ key: 'id', direction: 'descending' }} />
          </div>
        </div>
      )}
    </div>
  );
}
