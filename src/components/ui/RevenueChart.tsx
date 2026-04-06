import React from 'react';
import { DollarSign } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  title?: string;
  totalRevenue: string;
  data: RevenueData[];
  growthPercentage?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ 
  title = "Total Revenue", 
  totalRevenue, 
  data, 
  growthPercentage = "+5.2%" 
}) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue)) || 1;

  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-indigo-100">
          <DollarSign className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold">{totalRevenue}</p>
        </div>
      </div>
      <div className="mt-4 h-20 flex items-end justify-between px-1">
        {data.map((item, index) => (
          <div
            key={index}
            className="w-4 bg-indigo-300 hover:bg-indigo-400 rounded-t-md transition-colors"
            style={{ height: `${(item.revenue / maxRevenue) * 80}%` }}
            title={`${item.month}: $${item.revenue.toLocaleString()}`}
          />
        ))}
      </div>
      <p className="text-xs mt-2">
        <span className="text-green-500">{growthPercentage}</span> from last month
      </p>
    </div>
  );
};