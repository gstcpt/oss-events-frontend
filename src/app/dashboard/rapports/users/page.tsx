"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, UserCheck, UserX, Shield, CheckCircle, Lock, TrendingUp, Briefcase } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { AreaChart } from "@/components/ui/AreaChart";
import {
  getUsers,
  getUsersStats,
  getUsersPerRoleAndStatus,
} from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { AppLogs } from "@/types/logs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

interface User {
  id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  [key: string]: number;
}

export default function UsersReport() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [usersPerRoleAndStatus, setUsersPerRoleAndStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const t = useTranslations('Dashboard.reports');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) return;
        const [usersData, statsData, usersPerRoleAndStatusData, logsData] = await Promise.all([
          getUsers(currentUser),
          getUsersStats(currentUser),
          getUsersPerRoleAndStatus(currentUser),
          getLogs()
        ]);

        const baseUsers = usersData.data || usersData || [];
        const mergedUsers = mergeLogsWithData(baseUsers as User[], logsData || [], 'users');

        setUsers(mergedUsers);
        setStats(statsData.data || statsData);
        setUsersPerRoleAndStatus(usersPerRoleAndStatusData.data || usersPerRoleAndStatusData);
      } catch (error) {
        toast.error("Failed to fetch data: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const growthData = useMemo(() => {
    if (!users || users.length === 0) return [];

    const countsByMonth: Record<string, number> = {};
    users.forEach(u => {
      if (u.created_at) {
        const date = new Date(u.created_at);
        const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        countsByMonth[month] = (countsByMonth[month] || 0) + 1;
      }
    });

    return Object.entries(countsByMonth).map(([x, y]) => ({ x, y }));
  }, [users]);

  const roleDistribution = useMemo(() => {
    return usersPerRoleAndStatus.map(r => ({
      name: r.role,
      value: r.active + r.inactive
    }));
  }, [usersPerRoleAndStatus]);

  const barData = useMemo(() => {
    return usersPerRoleAndStatus.map((r) => ({
      name: r.role,
      active: r.active,
      inactive: r.inactive
    }));
  }, [usersPerRoleAndStatus]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-sm font-medium text-slate-500">
      <div className="animate-pulse">Loading Advanced User Reports...</div>
    </div>;
  }

  const isRoot = currentUser?.role === 'Root';

  const columns: DataTableColumn<User>[] = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "firstname", cell: (user) => `${user.firstname || ""} ${user.middlename || ""} ${user.lastname || ""}`.trim(), },
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email", cell: (user) => (<div className="flex items-center">{user.email_verified ? (<CheckCircle size={16} className="mr-2 text-green-500" />) : (<Lock size={16} className="mr-2 text-amber-500" />)}{user.email}</div>), },
    { header: "Role", accessor: "role" },
    {
      header: "Status", accessor: "status",
      cell: (user) => (
        <span className={
          `px-2 py-1 rounded-full text-xs font-semibold ${String(user.status) === '1'
            ? 'bg-green-100 text-green-700'
            : String(user.status) === '0'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'}`
        }>
          {String(user.status) === '1' ? t('active') : String(user.status) === '0' ? t('inactive') : t('blocked')}
        </span>),
    },
    { header: "Joined", accessor: "created_at" },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (user: any) => <span className="">{user.company || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <Users size={14} className="text-primary" />
            <span>{t('intelligenceReport')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">{t('usersAnalytics')}</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">{t('strategicDemographic')}</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-colors">
            <Users className="text-primary w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          title="Total Population"
          value={stats?.total || 0}
        />
        <StatCard
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
          title="Verified & Active"
          value={stats?.active || 0}
        />
        <StatCard
          icon={Shield}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          title="System Admins"
          value={stats?.Admin || 0}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-primary"
          iconBgColor="bg-orange-100"
          title="Monthly Growth"
          value={`+${growthData[growthData.length - 1]?.y || 0}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AreaChart
            title="User Registration Trend"
            data={growthData}
            color="#8b5cf6"
            label="New Users"
          />
        </div>
        <div>
          <DonutChart
            title="Role Distribution"
            data={roleDistribution}
            centerText="Roles"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BarChart title="Status breakdown per Role" data={barData} dataKey="active" />
        <div className="card p-6 flex flex-col justify-center">
          <h3 className="text-lg font-medium mb-6">Engagement Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Activation Rate</span>
              <span className="font-bold text-emerald-600">
                {(((stats?.active || 0) / (stats?.total || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Admin Density</span>
              <span className="font-bold text-purple-600">
                {(((stats?.Admin || 0) / (stats?.total || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Monthly Growth</span>
              <span className="font-bold text-blue-600">
                {(users.length / (growthData.length || 1)).toFixed(1)} users/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Demographic Deep-Dive</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="w-3 h-3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={users}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "id", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
