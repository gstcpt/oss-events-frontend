"use client";

import { useState, useEffect, useMemo } from "react";
import { UserCheck, UserX, Briefcase, Award, TrendingUp, CheckCircle, Lock } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { getProviders } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw } from "lucide-react";

interface Provider {
  id: number;
  name: string;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  username: string;
  phone: string;
  company: string;
  email_verified: boolean;
  status: string;
  events_provided: number;
  joined_date: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProvidersReport() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        if (!currentUser) return;
        const [providersData, logsData] = await Promise.all([getProviders(currentUser), getLogs()]);
        const baseProviders = (providersData.data || providersData || []) as Provider[];
        const mergedProviders = mergeLogsWithData(baseProviders, logsData || [], 'users');
        setProviders(mergedProviders);
      } catch (error) { toast.error("Failed to fetch providers: " + (error as Error).message); } finally { setLoading(false); }
    };

    fetchProviders();
  }, [currentUser]);

  const stats = useMemo(() => {
    const total = providers.length;
    const active = providers.filter(p => String(p.status) === '1').length;
    const totalItems = providers.reduce((sum, p) => sum + (p.events_provided || 0), 0);
    const topProvider = providers.length > 0 ? providers.reduce((a, b) => (a.events_provided > b.events_provided ? a : b)) : null;
    return { total, active, totalItems, topProvider };
  }, [providers]);

  const statusData = useMemo(() => {
    const active = providers.filter(p => String(p.status) === '1').length;
    const inactive = providers.filter(p => String(p.status) === '0').length;
    const blocked = providers.filter(p => String(p.status) === '2').length;
    return [{ name: "Active", value: active }, { name: "Inactive", value: inactive }, { name: "Blocked", value: blocked }];
  }, [providers]);

  const performanceData = useMemo(() => { return [...providers].sort((a, b) => b.events_provided - a.events_provided).slice(0, 5).map(p => ({ name: p.username || `${p.firstname} ${p.lastname.charAt(0)}.`, items: p.events_provided })); }, [providers]);

  if (loading) { return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm"><RefreshCw className="animate-spin mr-2" size={16} /> Synchronizing Provider Portfolios...</div>; }

  const isRoot = currentUser?.role === 'Root';

  const columns: DataTableColumn<Provider>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Partner",
      accessor: "name",
      cell: (p) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs mr-3 border border-slate-200">{p.firstname?.[0]}{p.lastname?.[0]}</div>
          <span className="font-bold text-slate-800">{`${p.firstname || ""} ${p.lastname || ""}`.trim()}</span>
        </div>
      ),
    },
    { header: "Username", accessor: "username" },
    {
      header: "Security",
      accessor: "email",
      cell: (p) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-700">{p.email}</span>
          <span className="text-[10px] text-slate-400 font-bold  tracking-wider">{p.email_verified ? 'Verified' : 'Unverified'}</span>
        </div>
      ),
    },
    { header: "Status", accessor: "status", cell: (p) => (<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold  tracking-wider ${String(p.status) === '1' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{String(p.status) === '1' ? 'Active' : 'Inactive'}</span>), },
    { header: "Items", accessor: "events_provided", cell: (p) => <span className="font-bold text-indigo-600 font-mono text-xs">{p.events_provided}</span> },
    { header: "Joined", accessor: "created_at" },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (p: any) => <span className="">{p.company || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm"><Briefcase size={14} className="text-indigo-400" /><span>Partner Supply Intelligence</span></div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Providers Portfolio</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Measuring performance, supply health, and item contribution across the provider network.</p>
        </div>

        <div className="flex items-center bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-md relative z-10 hidden md:flex">
          <div className="px-6 py-3 flex flex-col items-center border-r border-white/10">
            <span className="text-xs text-white/50 font-medium mb-1">Total Output</span>
            <span className="text-2xl font-semibold text-indigo-400">{stats.totalItems}</span>
          </div>
          <div className="px-6 py-3 flex flex-col items-center">
            <span className="text-xs text-white/50 font-medium mb-1">Avg Supply</span>
            <span className="text-2xl font-semibold text-white">{(stats.totalItems / (stats.total || 1)).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} iconColor="text-indigo-600" iconBgColor="bg-indigo-100" title="Total Providers" value={stats.total} />
        <StatCard icon={UserCheck} iconColor="text-emerald-600" iconBgColor="bg-emerald-100" title="Active Partners" value={stats.active} />
        <StatCard icon={Award} iconColor="text-amber-600" iconBgColor="bg-amber-100" title="Total Catalog Items" value={stats.totalItems} />
        <StatCard icon={TrendingUp} iconColor="text-blue-600" iconBgColor="bg-blue-100" title="Avg Items/Provider" value={(stats.totalItems / (stats.total || 1)).toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DonutChart title="Account Health distribution" data={statusData} centerText="Providers" />
        <BarChart title="Top 5 Performance (Items provided)" data={performanceData} dataKey="items" color="#6366f1" />
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Provider Detailed Registry</h2>
          {stats.topProvider && (
            <div className="flex items-center text-xs font-medium px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full shadow-sm ring-1 ring-indigo-100"><Award size={14} className="mr-1.5 text-indigo-600" />Top Provider: {stats.topProvider.username} ({stats.topProvider.events_provided} items)</div>
          )}
        </div>
        <div className="p-6"><DataTable columns={columns} data={providers} showEdit={false} showDelete={false} defaultSort={{ key: "events_provided", direction: "descending" }} /></div>
      </div>
    </div>
  );
}
