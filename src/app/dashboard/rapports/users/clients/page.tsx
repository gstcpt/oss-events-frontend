"use client";

import { useState, useEffect, useMemo } from "react";
import { UserCheck, UserX, Users, Calendar, BarChart3, CheckCircle, Lock, Trophy } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { getClients } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw } from "lucide-react";

interface Client {
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
  registration_date: string;
  events_created: number;
  created_at?: string;
  updated_at?: string;
}

export default function ClientsReport() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (!currentUser) return;
        const [clientsData, logsData] = await Promise.all([
          getClients(currentUser),
          getLogs()
        ]);

        const baseClients = (clientsData.data || clientsData || []) as Client[];
        const mergedClients = mergeLogsWithData(baseClients, logsData || [], 'users');

        setClients(mergedClients);
      } catch (error) {
        toast.error("Failed to fetch clients: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [currentUser]);

  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => String(c.status) === '1').length;
    const totalEvents = clients.reduce((sum, c) => sum + (c.events_created || 0), 0);
    const topClient = clients.length > 0
      ? clients.reduce((a, b) => (a.events_created > b.events_created ? a : b))
      : null;

    return { total, active, totalEvents, topClient };
  }, [clients]);

  const engagementData = useMemo(() => {
    const active = clients.filter(c => String(c.status) === '1').length;
    const inactive = clients.filter(c => String(c.status) === '0').length;
    return [
      { name: "Active", value: active },
      { name: "Inactive", value: inactive }
    ];
  }, [clients]);

  const activityData = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.events_created - a.events_created)
      .slice(0, 5)
      .map(c => ({
        name: c.username || `${c.firstname} ${c.lastname.charAt(0)}.`,
        events: c.events_created
      }));
  }, [clients]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} /> Synchronizing Client Engagement Data...
    </div>;
  }

  const isRoot = currentUser?.role === 'Root';

  const columns: DataTableColumn<Client>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Client",
      accessor: "name",
      cell: (c) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs mr-3 border border-slate-200">
            {c.firstname?.[0]}{c.lastname?.[0]}
          </div>
          <span className="font-bold text-slate-800">{`${c.firstname || ""} ${c.lastname || ""}`.trim()}</span>
        </div>
      ),
    },
    { header: "Username", accessor: "username" },
    {
      header: "Security",
      accessor: "email",
      cell: (c) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-700">{c.email}</span>
          <span className="text-[10px] text-slate-400 font-bold  tracking-wider">{c.email_verified ? 'Verified' : 'Unverified'}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (c) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px]  font-bold tracking-wider ${String(c.status) === '1' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}>
          {String(c.status) === '1' ? 'Active' : 'Standard'}
        </span>
      ),
    },
    {
      header: "Events",
      accessor: "events_created",
      cell: (c) => <div className="text-center font-bold text-blue-600 font-mono text-xs">{c.events_created}</div>
    },
    { header: "Joined", accessor: "created_at" },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (user: any) => <span className="">{user.company || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <Users size={14} className="text-blue-400" />
            <span>Client Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Acquisition & Lifecycle</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Reviewing global user retention, platform utilization metrics, and engagement cycles.</p>
        </div>

        <div className="flex items-center bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-md relative z-10 hidden md:flex">
          <div className="px-6 py-3 flex flex-col items-center">
            <span className="text-xs text-white/50 font-medium mb-1">Retention Rate</span>
            <span className="text-2xl font-semibold text-emerald-400">{((stats.active / (stats.total || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          title="Gross User Base"
          value={stats.total}
        />
        <StatCard
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
          title="Recurring Clients"
          value={stats.active}
        />
        <StatCard
          icon={Calendar}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          title="Event Creations"
          value={stats.totalEvents}
        />
        <StatCard
          icon={BarChart3}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          title="Conversion Density"
          value={(stats.totalEvents / (stats.total || 1)).toFixed(2)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DonutChart title="User Connectivity Status" data={engagementData} centerText="Clients" colors={['#3b82f6', '#94a3b8']} />
        <BarChart title="Top 5 Power Users (Events Created)" data={activityData} dataKey="events" color="#3b82f6" />
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Complete Membership Registry</h2>
          {stats.topClient && (
            <div className="flex items-center text-xs font-medium px-4 py-1.5 bg-yellow-50 text-yellow-700 rounded-full shadow-sm ring-1 ring-yellow-200">
              <Trophy size={14} className="mr-1.5 text-yellow-600" />
              Premium User: {stats.topClient.username}
            </div>
          )}
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={clients}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "events_created", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
