"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, CheckCircle, Clock, Users, Lock, TrendingUp, Compass, Activity, RefreshCw } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { AreaChart } from "@/components/ui/AreaChart";
import { DonutChart } from "@/components/ui/DonutChart";
import { getEvents, getEventsStats, getEventsByMonth } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Event {
  id: number;
  company: string;
  domain: string;
  category: string;
  start_date: string;
  end_date: string;
  attendees_count: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface EventStats {
  total: number;
  notApproved: number;
  waiting: number;
  retard: number;
  active: number;
  completed: number;
  suspended: number;
}

export default function EventsReport() {
  const { user: currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats>({ total: 0, notApproved: 0, waiting: 0, retard: 0, active: 0, completed: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [eventsByMonth, setEventsByMonth] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) return;
        const [eventsData, statsData, eventsByMonthData, logsData] = await Promise.all([
          getEvents(currentUser),
          getEventsStats(currentUser),
          getEventsByMonth(currentUser),
          getLogs()
        ]);

        const baseEvents = (eventsData.data || eventsData || []) as Event[];
        // Events usually have their own start_date/created_at, but we can augment with logs if needed
        const mergedEvents = mergeLogsWithData(baseEvents, logsData || [], 'events');

        setEvents(mergedEvents);
        setStats(statsData || { total: 0, notApproved: 0, waiting: 0, retard: 0, active: 0, completed: 0, suspended: 0 });
        setEventsByMonth(eventsByMonthData || []);
      } catch (error) {
        toast.error("Failed to fetch events: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const activityData = useMemo(() => {
    return eventsByMonth.map(d => ({ x: d.month, y: d.count }));
  }, [eventsByMonth]);

  const statusData = useMemo(() => {
    return [
      { name: "Active", value: stats.active },
      { name: "Completed", value: stats.completed },
      { name: "Waiting", value: stats.waiting },
      { name: "Delayed", value: stats.retard },
      { name: "Others", value: stats.notApproved + stats.suspended }
    ].filter(s => s.value > 0);
  }, [stats]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} /> Synchronizing Event Registry...
    </div>;
  }

  const isRoot = currentUser?.role === "Root";

  const columns: DataTableColumn<Event>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Domain",
      accessor: "domain",
      cell: (e) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{e.domain}</span>
          <span className="text-[10px] text-slate-400  font-bold tracking-wider">{e.category}</span>
        </div>
      )
    },
    {
      header: "Timeline",
      accessor: "start_date",
      cell: (e) => (
        <div className="flex flex-col text-[10px] font-medium text-slate-500">
          <div className="flex items-center">
            <Calendar size={10} className="mr-1.5 text-slate-400" /> {e.start_date}
          </div>
          <div className="flex items-center">
            <Clock size={10} className="mr-1.5 text-slate-400" /> {e.end_date}
          </div>
        </div>
      )
    },
    {
      header: "Guests",
      accessor: "attendees_count",
      cell: (e) => (
        <div className="flex items-center text-slate-700 font-semibold text-xs">
          <Users size={12} className="mr-2 text-slate-400" />
          {e.attendees_count.toLocaleString()}
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      cell: (e) => {
        const colors: Record<string, string> = {
          'Active': 'bg-blue-100 text-blue-700',
          'Completed': 'bg-emerald-100 text-emerald-700',
          'Waiting': 'bg-purple-100 text-purple-700',
          'Retard': 'bg-amber-100 text-amber-700',
          'Not Approved': 'bg-rose-100 text-rose-700'
        };
        const color = colors[e.status] || 'bg-slate-100 text-slate-700';
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold  tracking-wider ${color}`}>
            {e.status}
          </span>
        );
      }
    },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (e: any) => <span className="">{e.company || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <Compass size={14} className="text-primary" />
            <span>Platform Liveliness</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Events Chronicle</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Tracking temporal occurrences, participant engagement cycles, and platform event distributions.</p>
        </div>

        <div className="hidden lg:flex flex-col items-end relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 mb-2 font-medium text-xs">
            <div className="w-2 h-2 rounded-full animate-ping bg-emerald-400"></div>
            System Delta
          </div>
          <span className="text-2xl font-semibold text-white">Nominal Operational</span>
          <div className="mt-2 text-[10px] text-white/40 font-bold uppercase tracking-tighter">
            {stats.active} Concurrent Events Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          title="Total Scheduling"
          value={stats.total}
        />
        <StatCard
          icon={Activity}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          title="Live Concurrent"
          value={stats.active}
        />
        <StatCard
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          title="Successfully Exited"
          value={stats.completed}
        />
        <StatCard
          icon={Clock}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          title="Threshold Wait"
          value={stats.waiting}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AreaChart
            title="Aggregated Scheduling Intensity"
            data={activityData}
            color="#6366f1"
            label="Events"
          />
        </div>
        <div>
          <DonutChart
            title="Operational Status Bifurcation"
            data={statusData}
            centerText="Total"
            colors={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e']}
          />
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Temporal Ledger</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="w-3 h-3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={events}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "id", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
