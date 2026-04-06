"use client";

import { useState, useEffect, useMemo } from "react";
import { ShieldCheck, ShieldAlert, UserCheck, Calendar, CheckCircle, Lock } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { DonutChart } from "@/components/ui/DonutChart";
import { getAdmins } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Admin {
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
  created_at: string;
  updated_at?: string;
}

export default function AdminsReport() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        if (!currentUser) return;
        const [adminsData, logsData] = await Promise.all([
          getAdmins(currentUser),
          getLogs()
        ]);

        const baseAdmins = (adminsData.data || adminsData || []) as Admin[];
        const mergedAdmins = mergeLogsWithData(baseAdmins, logsData || [], 'users');

        setAdmins(mergedAdmins);
      } catch (error) {
        toast.error("Failed to fetch admins: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [currentUser]);

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter(a => String(a.status) === '1').length;
    const verified = admins.filter(a => a.email_verified).length;
    return { total, active, verified };
  }, [admins]);

  const statusData = useMemo(() => {
    const active = admins.filter(a => String(a.status) === '1').length;
    const inactive = admins.filter(a => String(a.status) === '0').length;
    return [
      { name: "Active", value: active },
      { name: "Inactive/Restricted", value: inactive }
    ];
  }, [admins]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">Synchronizing Admin Registry...</div>;
  }

  const isRoot = currentUser?.role === 'Root';

  const columns: DataTableColumn<Admin>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Administrator",
      accessor: "name",
      cell: (a) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs mr-3 border border-slate-200">
            {a.firstname?.[0]}{a.lastname?.[0]}
          </div>
          <span className="font-bold text-slate-800">{`${a.firstname || ""} ${a.lastname || ""}`.trim()}</span>
        </div>
      )
    },
    { header: "Username", accessor: "username" },
    {
      header: "Security",
      accessor: "email",
      cell: (a) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-700">{a.email}</span>
          <span className="text-[10px] text-slate-400 font-bold  tracking-wider">{a.email_verified ? 'Verified' : 'Unverified'}</span>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      cell: (a) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px]  font-bold tracking-wider ${String(a.status) === '1' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
          {String(a.status) === '1' ? 'Active' : 'Restricted'}
        </span>
      )
    },
    { header: "Joined", accessor: "created_at" },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (user: any) => <span className="">{user.company || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-zinc-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <ShieldCheck size={14} className="text-purple-400" />
            <span>Security Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Privileged Access Oversight</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Monitoring administrative credentials, system authority, and active authentications.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-colors">
            <ShieldCheck className="text-purple-400 w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ShieldCheck}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          title="Total Authorized"
          value={stats.total}
        />
        <StatCard
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
          title="Online Status"
          value={stats.active}
        />
        <StatCard
          icon={ShieldAlert}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          title="Verified Auth"
          value={stats.verified}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DonutChart title="Administrative Status Split" data={statusData} centerText="Admins" colors={['#8b5cf6', '#ef4444']} />
        <div className="card p-8 border-none from-slate-900 to-slate-800 text-white shadow-xl rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Calendar size={20} className="mr-3 text-purple-400" />
            Quick Audit Summary
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 text-sm">
              <span className="opacity-80 font-medium">Security Compliance</span>
              <span className="font-semibold text-lg">{((stats.verified / (stats.total || 1)) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 text-sm">
              <span className="opacity-80 font-medium">Access Density</span>
              <span className="font-semibold text-lg">{((stats.active / (stats.total || 1)) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-80 font-medium">Role Count</span>
              <span className="font-semibold text-lg">System Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Administrative Credential Ledger</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="w-3 h-3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={admins}
            showEdit={false}
            showDelete={false}
            onEdit={() => { }}
            onDelete={() => { }}
            defaultSort={{ key: "id", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
