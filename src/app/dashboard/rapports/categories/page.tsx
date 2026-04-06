"use client";

import { useState, useEffect, useMemo } from "react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { getCategories } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { Tag, TrendingUp, Layers, PieChart, RefreshCw, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface Category {
    id: number;
    name: string;
    image: string;
    company: string;
    events_count: number;
    created_at: string;
    updated_at?: string;
}

export default function CategoriesReport() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (!currentUser) return;
                const [categoriesData, logsData] = await Promise.all([
                    getCategories(currentUser),
                    getLogs()
                ]);

                const baseCats = (categoriesData.data || categoriesData || []) as Category[];
                const mergedCats = mergeLogsWithData(baseCats, logsData || [], 'categories');

                setCategories(mergedCats);
            } catch (error) {
                toast.error("Failed to fetch categories: " + (error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [currentUser]);

    const stats = useMemo(() => {
        const total = categories.length;
        const totalEvents = categories.reduce((sum, cat) => sum + (cat.events_count || 0), 0);
        const mostPopular = categories.length > 0
            ? [...categories].sort((a, b) => b.events_count - a.events_count)[0]
            : null;
        const avgEvents = total > 0 ? totalEvents / total : 0;
        return { total, totalEvents, mostPopular, avgEvents };
    }, [categories]);

    const distributionData = useMemo(() => {
        return [...categories]
            .sort((a, b) => b.events_count - a.events_count)
            .slice(0, 8)
            .map(cat => ({ name: cat.name, value: cat.events_count }));
    }, [categories]);

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
            <RefreshCw className="animate-spin mr-3" size={16} /> Synchronizing Taxonomy Data...
        </div>;
    }

    const isRoot = currentUser?.role === "Root";

    const columns: DataTableColumn<Category>[] = [
        { header: "ID", accessor: "id" },
        {
            header: "Visual",
            accessor: "image",
            cell: (c) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100 relative shadow-sm">
                    {c.image ? (
                        <Image
                            src={c.image.startsWith("/") ? c.image : `/${c.image}`}
                            alt={c.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <Tag className="text-slate-300" size={16} />
                    )}
                </div>
            )
        },
        {
            header: "Category",
            accessor: "name",
            cell: (c) => <span className="font-bold text-slate-800">{c.name}</span>
        },
        {
            header: "Events",
            accessor: "events_count",
            cell: (c) => (
                <div className="flex items-center text-slate-700 font-semibold">
                    <Layers size={14} className="mr-2 text-slate-400" />
                    {c.events_count.toLocaleString()}
                </div>
            )
        },
        { header: "Created", accessor: "created_at" },
        ...(isRoot ? [{ header: "Company", accessor: "company", cell: (c: any) => <span className="">{c.company || "System Core"}</span> }] : []),
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
                        <Layers size={14} className="text-purple-400" />
                        <span>Vertical Intelligence</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-white">Taxonomy Matrix</h1>
                    <p className="text-slate-400 mt-3 max-w-xl font-medium">Structural classification intelligence, mapping category volume, and active semantic clustering.</p>
                </div>

                {stats.mostPopular && (
                    <div className="hidden lg:flex flex-col items-end relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full animate-ping bg-purple-400"></div>
                            <span className="text-xs font-medium text-white/50">Dominant Node</span>
                        </div>
                        <span className="text-2xl font-semibold text-white">{stats.mostPopular.name}</span>
                        <div className="text-xs text-purple-400 mt-1 font-medium">{stats.mostPopular.events_count} Active Resources</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Tag}
                    iconColor="text-purple-600"
                    iconBgColor="bg-purple-50"
                    title="Gross Verticals"
                    value={stats.total}
                />
                <StatCard
                    icon={TrendingUp}
                    iconColor="text-emerald-600"
                    iconBgColor="bg-emerald-50"
                    title="Top Vertical"
                    value={stats.mostPopular?.name || "N/A"}
                />
                <StatCard
                    icon={Layers}
                    iconColor="text-indigo-600"
                    iconBgColor="bg-indigo-50"
                    title="Aggregated Events"
                    value={stats.totalEvents}
                />
                <StatCard
                    icon={PieChart}
                    iconColor="text-amber-600"
                    iconBgColor="bg-amber-50"
                    title="Saturation High"
                    value={`${stats.mostPopular ? ((stats.mostPopular.events_count / (stats.totalEvents || 1)) * 100).toFixed(0) : 0}%`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <BarChart
                        title="Macro Category Distribution"
                        data={distributionData}
                        dataKey="value"
                        color="#8b5cf6"
                    />
                </div>
                <div>
                    <DonutChart
                        title="Market Dominance"
                        data={distributionData.slice(0, 5)}
                        centerText="Concentration"
                    />
                </div>
            </div>

            <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h2 className="text-lg font-medium text-slate-800">Classification Index</h2>
                </div>
                <div className="p-8">
                    <DataTable
                        columns={columns}
                        data={categories}
                        showEdit={false}
                        showDelete={false}
                        defaultSort={{ key: "events_count", direction: "descending" }}
                    />
                </div>
            </div>
        </div>
    );
}

