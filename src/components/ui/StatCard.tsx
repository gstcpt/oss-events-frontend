import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconColor, iconBgColor, title, value }) => {
  return (
    <div className="group relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      <div className="flex items-center relative z-10">
        <div className={`p-4 rounded-2xl ${iconBgColor} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}><Icon className={`h-6 w-6 ${iconColor}`} /></div>
        <div className="ml-5">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};