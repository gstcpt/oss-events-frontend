"use client";

import { useEffect, useState, useMemo } from "react";
import { AppLogs } from "@/types/logs";
import { useAuth } from "@/context/AuthContext";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { getLogs } from "@/lib/api/logs";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/StatCard";
import { DonutChart } from "@/components/ui/DonutChart";
import { AreaChart } from "@/components/ui/AreaChart";
import { FileText, User as UserIcon, Activity, AlertCircle, ShieldCheck, Search, RefreshCw, LayoutDashboard, ScrollText } from "lucide-react";
export default function LogsReport() {
  const { user } = useAuth();
  const [appLogs, setLogs] = useState<AppLogs[]>([]);
  const [loading, setLoading] = useState(true);

  const isRootUser = Number(user?.role_id) === 1;

  const fetchLogs = async () => {
    try {
      const data = await getLogs();
      setLogs(data || []);
    } catch (error) {
      toast.error("Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const stats = useMemo(() => {
    const total = appLogs.length;
    const uniqueActors = new Set(appLogs.map(l => l.actor_id)).size;
    const mostActiveEntity = appLogs.length > 0
      ? Object.entries(appLogs.reduce((acc: any, curr) => {
        acc[curr.entity] = (acc[curr.entity] || 0) + 1;
        return acc;
      }, {})).sort((a: any, b: any) => b[1] - a[1])[0][0]
      : "N/A";

    const securityEvents = appLogs.filter(l =>
      l.action?.toLowerCase().includes("delete") ||
      l.action?.toLowerCase().includes("remove") ||
      l.action?.toLowerCase().includes("update")
    ).length;

    return { total, uniqueActors, mostActiveEntity, securityEvents };
  }, [appLogs]);

  const activityTrend = useMemo(() => {
    const countsByDate: Record<string, number> = {};
    appLogs.forEach(l => {
      const date = new Date(l.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      countsByDate[date] = (countsByDate[date] || 0) + 1;
    });
    return Object.entries(countsByDate).map(([x, y]) => ({ x, y })).slice(-10);
  }, [appLogs]);

  const actionDistribution = useMemo(() => {
    const counts = appLogs.reduce((acc: any, l) => {
      let type = "OTHER";
      const action = l.action?.toUpperCase() || "";
      if (action.includes("CREATE")) type = "CREATE";
      else if (action.includes("UPDATE")) type = "UPDATE";
      else if (action.includes("DELETE")) type = "DELETE";
      else if (action.includes("LOGIN")) type = "AUTH";

      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value: value as number }));
  }, [appLogs]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} /> Querying Audit Ledger...
    </div>;
  }

  const columns: DataTableColumn<AppLogs>[] = [
    { header: "ID", accessor: "id", className: "w-16" },
    {
      header: "Action",
      accessor: "action",
      cell: (l) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold  tracking-wider ${l.action?.includes("CREATE") ? "bg-emerald-100 text-emerald-700" :
          l.action?.includes("UPDATE") ? "bg-amber-100 text-amber-700" :
            l.action?.includes("DELETE") ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
          }`}>
          {l.action}
        </span>
      )
    },
    {
      header: "Entity",
      accessor: "entity",
      cell: (l) => <span className="font-mono text-xs font-bold text-indigo-600">{l.entity}</span>
    },
    {
      header: "Actor",
      accessor: "users",
      cell: (l) => (
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-[10px] font-bold text-slate-600 border border-slate-200">
            {l.users?.firstname?.[0] || "?"}
          </div>
          <span className="text-xs font-medium text-slate-700">
            {l.users ? `${l.users.firstname} ${l.users.lastname}` : `UID: ${l.actor_id}`}
          </span>
        </div>
      ),
    },
    {
      header: "Timestamp",
      accessor: "created_at",
      cell: (l) => (
        <div className="flex flex-col text-[10px] font-medium text-slate-500">
          <span className="font-bold text-slate-700">{new Date(l.created_at).toLocaleDateString()}</span>
          <span>{new Date(l.created_at).toLocaleTimeString()}</span>
        </div>
      ),
    },
    {
      header: "Message",
      accessor: "log_message",
      cell: (l) => (
        <div className="text-[11px] leading-relaxed text-slate-500 max-w-[300px] truncate hover:whitespace-normal hover:overflow-visible hover:bg-white hover:z-10 hover:relative hover:shadow-lg p-1 rounded transition-all">
          {l.log_message}
        </div>
      )
    },
    ...(isRootUser ? [{
      header: "Company",
      accessor: "companies",
      cell: (l: any) => <span className="">{l.companies?.title || "System Core"}</span>
    }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <LayoutDashboard size={14} className="text-blue-400" />
            <span>Security Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">System Audit Trail</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Monitoring comprehensive logs, access trails, and critical system events for continuous oversight.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-colors">
            <Activity className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          title="Total Audit Entries"
          value={stats.total}
        />
        <StatCard
          icon={Activity}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          title="Security Mutations"
          value={stats.securityEvents}
        />
        <StatCard
          icon={UserIcon}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          title="Unique Initiators"
          value={stats.uniqueActors}
        />
        <StatCard
          icon={AlertCircle}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          title="Hotspot Entity"
          value={stats.mostActiveEntity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AreaChart
            title="Event Velocity (Last 10 Records)"
            data={activityTrend}
            color="#6366f1"
            label="Log Count"
          />
        </div>
        <div>
          <DonutChart
            title="Action Taxonomy"
            data={actionDistribution}
            centerText="Events"
            colors={['#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#64748b']}
          />
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <ScrollText size={20} className="text-gray-700" />
            </div>
            <h2 className="text-lg font-medium text-slate-800">Audit Trail Explorer</h2>
          </div>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="w-3 h-3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="p-0">
          <DataTable
            columns={columns}
            data={appLogs}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "id", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
