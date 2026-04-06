"use client";

import { useState, useEffect, useMemo } from "react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { getMedia, getMediaStats } from "@/lib/api/rapports";
import { getLogs } from "@/lib/api/logs";
import { mergeLogsWithData } from "@/lib/utils/logMerger";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/StatCard";
import { DonutChart } from "@/components/ui/DonutChart";
import { BarChart } from "@/components/ui/BarChart";
import { useAuth } from "@/context/AuthContext";
import { Image as ImageIcon, Film, FileText, FileArchive, HardDrive, Share2, Eye, Download, RefreshCw } from "lucide-react";
import Image from "next/image";

interface Media {
  id: number;
  filename: string;
  fileUrl: string;
  type: string;
  item_name: string;
  company_name: string;
  uploaded_at: string;
  created_at?: string;
  updated_at?: string;
}

interface MediaStats {
  total: number;
  image: number;
  video: number;
  document: number;
  other: number;
}

export default function MediaReport() {
  const [media, setMedia] = useState<Media[]>([]);
  const [stats, setStats] = useState<MediaStats>({ total: 0, image: 0, video: 0, document: 0, other: 0 });
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchMediaData = async () => {
      try {
        if (!currentUser) return;
        const [mediaData, statsData, logsData] = await Promise.all([
          getMedia(currentUser),
          getMediaStats(currentUser),
          getLogs()
        ]);

        const baseMedia = (mediaData.data || mediaData || []) as Media[];
        const mergedMedia = mergeLogsWithData(baseMedia, logsData || [], 'item_media');

        setMedia(mergedMedia);
        setStats(statsData);
      } catch (error) {
        toast.error("Failed to fetch media data: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaData();
  }, [currentUser]);

  const typeDistribution = useMemo(() => {
    return [
      { name: "Images", value: stats.image },
      { name: "Videos", value: stats.video },
      { name: "Documents", value: stats.document },
      { name: "Others", value: stats.other }
    ].filter(t => t.value > 0);
  }, [stats]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium animate-pulse text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} /> Establishing CDN Connection...
    </div>;
  }

  const isRoot = currentUser?.role === "Root";

  const columns: DataTableColumn<Media>[] = [
    { header: "ID", accessor: "id" },
    {
      header: "Visual",
      accessor: "fileUrl",
      cell: (m) => {
        const fileUrl = m.fileUrl;
        const isImage = m.type?.includes("image");
        return (
          <div className="w-12 h-12 relative group cursor-pointer overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
            {isImage ? (
              <Image
                src={fileUrl ? (fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`) : "/images/default.jpg"}
                alt={m.filename}
                fill
                sizes="48px"
                className="object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center">
                {m.type?.includes("video") ? <Film size={18} className="text-blue-500" /> : <FileText size={18} className="text-slate-400" />}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Filename",
      accessor: "filename",
      cell: (m) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="truncate font-bold text-slate-800">{m.filename}</span>
          <span className="text-[10px] text-slate-400  font-bold tracking-wider">{m.type}</span>
        </div>
      )
    },
    {
      header: "Item",
      accessor: "item_name",
      cell: (m) => <span className="text-xs font-semibold text-blue-600">{m.item_name}</span>
    },
    { header: "Ingested", accessor: "created_at" },
    ...(isRoot ? [{ header: "Company", accessor: "company", cell: (m: any) => <span className="">{m.company_name || "System Core"}</span> }] : []),
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 border border-white/10 backdrop-blur-sm">
            <HardDrive size={14} className="text-blue-400" />
            <span>Asset Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Media Asset Vault</h1>
          <p className="text-slate-400 mt-3 max-w-xl font-medium">Monitoring centralized storage quotas, multi-media distribution networks, and content indexing.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-colors">
            <HardDrive className="text-blue-400 w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={HardDrive}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          title="Total Assets"
          value={stats.total}
        />
        <StatCard
          icon={ImageIcon}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          title="Image Assets"
          value={stats.image}
        />
        <StatCard
          icon={Film}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          title="Video Library"
          value={stats.video}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <DonutChart
            title="Composition by Type"
            data={typeDistribution}
            centerText="Files"
          />
        </div>
      </div>

      <div className="card shadow-md overflow-hidden border-none bg-white rounded-2xl ring-1 ring-slate-100 group">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-medium text-slate-800">Content Repository</h2>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="w-3 h-3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={media}
            showEdit={false}
            showDelete={false}
            defaultSort={{ key: "id", direction: "descending" }}
          />
        </div>
      </div>
    </div>
  );
}
