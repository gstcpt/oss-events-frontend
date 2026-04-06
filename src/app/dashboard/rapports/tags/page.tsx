"use client";

import { useState, useEffect, useMemo } from "react";
import { Tag as TagIconComponent, TrendingUp, BarChart3, PieChart as PieIcon, Hash } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { getTags } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface TagData {
  id: number;
  name: string;
  color: string;
  company: string;
  usage_count: number;
  created_at: string;
  updated_at?: string;
}

export default function TagsReport() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        if (!currentUser) return;
        const [tagsData, logsData] = await Promise.all([getTags(currentUser), getLogs()]);
        const baseTags = (tagsData.data || tagsData || []) as TagData[];
        const mergedTags = mergeLogsWithData(baseTags, logsData || [], 'tags');
        setTags(mergedTags);
      } catch (error) { toast.error("Failed to fetch tags: " + (error as Error).message); } finally { setLoading(false); }
    };
    fetchTags();
  }, [currentUser]);

  const stats = useMemo(() => {
    const total = tags.length;
    const totalUsage = tags.reduce((sum, t) => sum + (t.usage_count || 0), 0);
    const avgUsage = totalUsage / (total || 1);
    const topTag = tags.length > 0 ? [...tags].sort((a, b) => b.usage_count - a.usage_count)[0] : null;
    return { total, totalUsage, avgUsage, topTag };
  }, [tags]);
  const barData = useMemo(() => { return [...tags].sort((a, b) => b.usage_count - a.usage_count).slice(0, 8).map(t => ({ name: t.name, usage: t.usage_count })); }, [tags]);
  const distributionData = useMemo(() => {
    const top5 = [...tags].sort((a, b) => b.usage_count - a.usage_count).slice(0, 5);
    const othersCount = tags.length > 5 ? tags.slice(5).reduce((sum, t) => sum + t.usage_count, 0) : 0;
    const data = top5.map(t => ({ name: t.name, value: t.usage_count }));
    if (othersCount > 0) { data.push({ name: "Others", value: othersCount }); }
    return data;
  }, [tags]);
  if (loading) { return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm"><Hash className="animate-spin mr-2" size={16} /> Synchronizing Tag Taxonomy...</div>; }
  const isRoot = currentUser?.role === "Root";
  const columns: DataTableColumn<TagData>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Label", accessor: "name", cell: (tag) => (
        <span className="font-bold text-slate-700">{tag.name}</span>
      )
    },
    { header: "Type", accessor: "color", cell: (tag) => (<span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium capitalize">{tag.color || "—"}</span>) },
    {
      header: "Popularity",
      accessor: "usage_count",
      cell: (tag) => (
        <div className="flex items-center">
          <div className="w-16 bg-slate-100 h-1 rounded-full mr-2 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (tag.usage_count / (stats.topTag?.usage_count || 1)) * 100)}%` }}></div></div>
          <span className="text-xs font-bold text-slate-600">{tag.usage_count}</span>
        </div>
      )
    },
    { header: "Created", accessor: "created_at", cell: (tag) => (<span className="text-xs text-slate-500">{tag.created_at ? new Date(tag.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>) },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (tag: any) => <span className="">{tag.company || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/50/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <Hash size={14} className="text-primary" />
            <span>Taxonomy Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Tag Meta-Analytics</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Analyzing content categorization patterns, identifier density, and discovery vectors across the ecosystem.</p>
        </div>

        {stats.topTag && (
          <div className="hidden lg:flex flex-col items-end relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: stats.topTag.color }}></div>
              <span className="text-xs font-semibold text-primary">Trending Now</span>
            </div>
            <span className="text-2xl font-semibold text-white">#{stats.topTag.name}</span>
            <div className="mt-2 text-xs text-white/50 font-medium">
              Used in {stats.topTag.usage_count} Entities
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TagIconComponent} iconColor="text-blue-600" iconBgColor="bg-blue-50" title="Unique Identifiers" value={stats.total} />
        <StatCard icon={BarChart3} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" title="Aggregate Usage" value={stats.totalUsage} />
        <StatCard icon={TrendingUp} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" title="Avg Density" value={stats.avgUsage.toFixed(1)} />
        <StatCard icon={PieIcon} iconColor="text-primary" iconBgColor="bg-primary/5" title="Saturation" value={`${((stats.totalUsage / (stats.total * 100)) * 100).toFixed(1)}%`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2"><BarChart title="Volume by Identifier (Top 8)" data={barData} dataKey="usage" color="#3b82f6" /></div>
        <div><DonutChart title="Usage Concentration" data={distributionData} centerText="Uses" /></div>
      </div>
      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Taxonomy Registry</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="w-3 h-3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="p-6"><DataTable columns={columns} data={tags} showEdit={false} showDelete={false} defaultSort={{ key: "usage_count", direction: "descending" }} /></div>
      </div>
    </div>
  );
}
