"use client";

import { useState, useEffect, useMemo } from "react";
import { CreditCard, CheckCircle, XCircle, DollarSign, TrendingUp, Calendar, Zap, RefreshCw } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { AreaChart } from "@/components/ui/AreaChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { getSubscriptions, getSubscriptionsStats } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Subscription {
  id: number;
  user_name: string;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  amount: number;
  company: string;
  created_at?: string;
  updated_at?: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  totalRevenue: number;
}

export default function SubscriptionsReport() {
  const { user: currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({ total: 0, active: 0, expired: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) return;
        const [subsData, statsData, logsData] = await Promise.all([
          getSubscriptions(currentUser),
          getSubscriptionsStats(currentUser),
          getLogs()
        ]);

        const baseSubs = (subsData.data || subsData || []) as Subscription[];
        const mergedSubs = mergeLogsWithData(baseSubs, logsData || [], 'subscriptions');

        setSubscriptions(mergedSubs);
        setStats(statsData || { total: 0, active: 0, expired: 0, totalRevenue: 0 });
      } catch (error) {
        toast.error("Failed to fetch subscriptions: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const revenueTrendData = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];

    const countsByMonth: Record<string, number> = {};
    subscriptions.forEach(s => {
      if (s.start_date) {
        const date = new Date(s.start_date);
        const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        countsByMonth[month] = (countsByMonth[month] || 0) + (s.amount || 0);
      }
    });

    return Object.entries(countsByMonth).map(([x, y]) => ({ x, y }));
  }, [subscriptions]);

  const statusDistribution = useMemo(() => {
    return [
      { name: "Active", value: stats.active },
      { name: "Expired", value: stats.expired },
      { name: "Other", value: Math.max(0, stats.total - stats.active - stats.expired) }
    ];
  }, [stats]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} /> Synchronizing Financial Data...
    </div>;
  }

  const isRoot = currentUser?.role === "Root";

  const columns: DataTableColumn<Subscription>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Subscriber",
      accessor: "user_name",
      cell: (s) => <span className="font-bold text-slate-800">{s.user_name}</span>
    },
    {
      header: "Plan",
      accessor: "plan_name",
      cell: (s) => (
        <div className="flex items-center">
          <Zap size={14} className="mr-2 text-amber-500" />
          <span className="text-slate-700 font-medium">{s.plan_name}</span>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      cell: (s) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold  tracking-wider ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
          s.status === 'expired' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
          }`}>
          {s.status}
        </span>
      )
    },
    { header: "From", accessor: "created_at" },
    { header: "Expiry", accessor: "end_date" },
    {
      header: "Amount",
      accessor: "amount",
      cell: (s) => (
        <span className="font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          ${(s.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (s: any) => <span className="">{s.user_name || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <DollarSign size={14} className="text-emerald-400" />
            <span>Financial Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Subscription Portfolio</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Global financial auditing, recurring revenue health analytics, and user retention performance metrics.</p>
        </div>

        <div className="flex items-center bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-md relative z-10">
          <div className="px-6 py-3 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-xs text-white/50 font-medium">Churn Rate</span>
            </div>
            <span className="text-2xl font-semibold text-rose-400">{((stats.expired / (stats.total || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CreditCard}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          title="Gross Contracts"
          value={stats.total}
        />
        <StatCard
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          title="Active Yield"
          value={stats.active}
        />
        <StatCard
          icon={XCircle}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          title="Attrited Subs"
          value={stats.expired}
        />
        <StatCard
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          title="Total Realized Revenue"
          value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AreaChart
            title="Revenue Generation Trend (Monthly)"
            data={revenueTrendData}
            color="#10b981"
            label="Revenue ($)"
          />
        </div>
        <div>
          <DonutChart
            title="Contract Lifecycle"
            data={statusDistribution}
            centerText="Total"
            colors={['#10b981', '#f43f5e', '#64748b']}
          />
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Financial Transmission Ledger</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-white/20" />
            <span className="w-3 h-3 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={subscriptions}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "id", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
