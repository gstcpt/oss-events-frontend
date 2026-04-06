"use client";

import { useState, useEffect, useMemo } from "react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { getItems } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { AreaChart } from "@/components/ui/AreaChart";
import { useAuth } from "@/context/AuthContext";
import { Package, DollarSign, Layers, TrendingUp, ShoppingBag, Eye, RefreshCw, Box } from "lucide-react";
import Image from "next/image";

interface Item {
  id: number;
  name: string;
  image: string;
  description: string;
  category: string;
  price: number;
  company: string;
  provider: string;
  status: number;
  event_id: number;
  events_count: number;
  created_at: string;
  updated_at?: string;
}

export default function ItemsReport() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!currentUser) return;
        const [itemsData, logsData] = await Promise.all([
          getItems(currentUser),
          getLogs()
        ]);

        const baseItems = itemsData.data || itemsData || [];
        const mergedItems = mergeLogsWithData(baseItems as Item[], logsData || [], 'items');

        setItems(mergedItems);
      } catch (error) {
        toast.error("Failed to fetch items: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [currentUser]);

  const stats = useMemo(() => {
    const total = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const categories = new Set(items.map(i => i.category)).size;
    const activeItems = items.filter(i => i.status === 1).length;
    return { total, totalValue, categories, activeItems };
  }, [items]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => {
      const cat = i.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [items]);

  const popularityTrend = useMemo(() => {
    return [...items]
      .sort((a, b) => b.events_count - a.events_count)
      .slice(0, 8)
      .map(i => ({ x: i.name, y: i.events_count }));
  }, [items]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} /> Synchronizing Product Catalog...
    </div>;
  }

  const isRoot = currentUser?.role === "Root";

  const columns: DataTableColumn<Item>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Product",
      accessor: "name",
      cell: (i) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
            <Image
              src={i.image || "/images/default-item.jpg"}
              alt={i.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 line-clamp-1">{i.name}</span>
            <span className="text-[10px] text-slate-400  font-bold tracking-wider">{i.category}</span>
          </div>
        </div>
      )
    },
    {
      header: "Price",
      accessor: "price",
      cell: (i) => (
        <span className="font-semibold text-blue-600">
          ${(i.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: "Provider",
      accessor: "provider",
      cell: (i) => <span className="text-xs text-slate-600 font-medium">{i.provider || "N/A"}</span>
    },
    {
      header: "Status",
      accessor: "status",
      cell: (i) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold  tracking-wider ${i.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
          {i.status === 1 ? 'Active' : 'N/A'}
        </span>
      )
    },
    {
      header: "Events",
      accessor: "events_count",
      cell: (i) => (
        <div className="flex items-center space-x-2">
          <TrendingUp size={12} className="text-emerald-500" />
          <span className="font-bold text-slate-700">{i.events_count}</span>
        </div>
      )
    },
    { header: "Added", accessor: "created_at" },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (i: any) => <span className="">{i.company || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <Box size={14} className="text-emerald-400" />
            <span>Inventory Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Catalog Analytics</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Monitoring aggregate item values, structural taxonomy, and comprehensive performance metrics.</p>
        </div>

        <div className="flex items-center bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-md relative z-10 hidden md:flex">
          <div className="px-6 py-3 flex flex-col items-center border-r border-white/10">
            <span className="text-xs text-white/50 font-medium mb-1">Active Share</span>
            <span className="text-2xl font-semibold text-emerald-400">{((stats.activeItems / (stats.total || 1)) * 100).toFixed(0)}%</span>
          </div>
          <div className="px-6 py-3 flex flex-col items-center">
            <span className="text-xs text-white/50 font-medium mb-1">Avg Yield</span>
            <span className="text-2xl font-semibold text-primary">${(stats.totalValue / (stats.total || 1)).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          title="Gross SKUs"
          value={stats.total}
        />
        <StatCard
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          title="Inventory Valuation"
          value={`$${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <StatCard
          icon={Layers}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          title="Niche Categories"
          value={stats.categories}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          title="Active Utilization"
          value={stats.activeItems}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AreaChart
            title="Top Performing Assets (Event Volume)"
            data={popularityTrend}
            color="#6366f1"
            label="Events"
          />
        </div>
        <div>
          <DonutChart
            title="Category Concentration"
            data={categoryDistribution}
            centerText="Types"
          />
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Detailed Inventory Ledger</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-white/20" />
            <span className="w-3 h-3 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={items}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "events_count", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
