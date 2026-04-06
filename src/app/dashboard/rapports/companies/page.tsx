"use client";

import { useState, useEffect, useMemo } from "react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { getCompanies, getCompaniesStats } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { Building2, TrendingUp, Users, Briefcase, Globe, BarChart3, RefreshCw } from "lucide-react";

interface Company {
  id: number;
  name: string;
  industry: string;
  employees_count: number;
  events_hosted: number;
  registration_date: string;
  created_at?: string;
  updated_at?: string;
}

interface CompanyStats {
  total: number;
  mostActive: {
    name: string;
    events: number;
  };
}

export default function CompaniesReport() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        if (!user) return;
        const [companyData, statsData, logsData] = await Promise.all([
          getCompanies({
            id: user.id,
            role: user.role,
            company_id: user.company_id
          }),
          getCompaniesStats({
            id: user.id,
            role: user.role,
            company_id: user.company_id
          }),
          getLogs()
        ]);

        const baseCompanies = (companyData.data || companyData || []) as Company[];
        const mergedCompanies = mergeLogsWithData(baseCompanies, logsData || [], 'companies');

        setCompanies(mergedCompanies);
        setStats(statsData);
      } catch (error) {
        toast.error("Failed to fetch companies: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user]);

  const performanceData = useMemo(() => {
    return [...companies]
      .sort((a, b) => b.events_hosted - a.events_hosted)
      .slice(0, 8)
      .map(c => ({ name: c.name, value: c.events_hosted }));
  }, [companies]);

  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    companies.forEach(c => {
      const ind = c.industry || "General";
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [companies]);

  const globalStats = useMemo(() => {
    const totalEmployees = companies.reduce((sum, c) => sum + (c.employees_count || 0), 0);
    const avgEvents = companies.length > 0
      ? companies.reduce((sum, c) => sum + (c.events_hosted || 0), 0) / companies.length
      : 0;
    return { totalEmployees, avgEvents };
  }, [companies]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} /> Synchronizing Enterprise Directory...
    </div>;
  }

  const columns: DataTableColumn<Company>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Enterprise",
      accessor: "name",
      cell: (c) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
            {c.name[0]}
          </div>
          <span className="font-bold text-slate-800">{c.name}</span>
        </div>
      )
    },
    {
      header: "Industry",
      accessor: "industry",
      cell: (c) => (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold  tracking-wider">
          {c.industry || "General"}
        </span>
      )
    },
    {
      header: "Workforce",
      accessor: "employees_count",
      cell: (c) => (
        <div className="flex items-center text-slate-600 font-medium text-xs">
          <Users size={12} className="mr-1.5 text-slate-400" />
          {c.employees_count.toLocaleString()}
        </div>
      )
    },
    {
      header: "Events",
      accessor: "events_hosted",
      cell: (c) => (
        <div className="flex items-center text-slate-700 font-bold text-xs">
          <BarChart3 size={14} className="mr-2 text-emerald-500" />
          {c.events_hosted}
        </div>
      )
    },
    { header: "Onboarded", accessor: "created_at" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <Globe size={14} className="text-primary" />
            <span>Enterprise Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">B2B Network Analytics</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Monitoring enterprise growth, corporate presence, and business entity engagement metrics.</p>
        </div>

        {stats?.mostActive && (
          <div className="hidden lg:flex flex-col items-end relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full animate-ping bg-emerald-400"></div>
              <span className="text-xs font-medium text-white/50">Market Leader</span>
            </div>
            <span className="text-2xl font-semibold text-white">{stats.mostActive.name || "N/A"}</span>
            <div className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-2"><TrendingUp size={12} /> {stats.mostActive.events || 0} Events Hosted</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          iconColor="text-slate-900"
          iconBgColor="bg-slate-50"
          title="Gross Entities"
          value={stats?.total ?? companies.length}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          title="Avg Host Rate"
          value={globalStats.avgEvents.toFixed(1)}
        />
        <StatCard
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          title="Aggregate Workforce"
          value={globalStats.totalEmployees.toLocaleString()}
        />
        <StatCard
          icon={Briefcase}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          title="Industry Diversity"
          value={industryData.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BarChart
            title="Top Hosting Organizations"
            data={performanceData}
            dataKey="value"
            color="#0f172a"
          />
        </div>
        <div>
          <DonutChart
            title="Sector Saturation"
            data={industryData}
            centerText="Industries"
          />
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Enterprise Entity Ledger</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="w-3 h-3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={companies}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "events_hosted", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
