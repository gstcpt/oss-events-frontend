'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DonutChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface DonutChartProps {
  title?: string;
  data: DonutChartData[];
  centerText?: string;
  colors?: string[];
  showCard?: boolean;
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export const DonutChart: React.FC<DonutChartProps> = ({
  title = 'Donut Chart',
  data,
  centerText = 'Total',
  colors = DEFAULT_COLORS,
  showCard = true
}) => {
  const total = data?.reduce((acc, item) => acc + item.value, 0) || 0;

  const content = (
    <>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-64 relative">
        {(!data || data.length === 0 || total === 0) ? (
          <div className="h-full flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 36 36" className="w-48 h-48 opacity-20">
              <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#e5e7eb" strokeWidth="3.8" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-300">0</span>
              <span className="text-sm text-gray-400">{centerText}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">No data available</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-18px' }}>
              <span className="text-2xl font-bold text-gray-800">{total}</span>
              <span className="text-xs text-gray-500  tracking-wider">{centerText}</span>
            </div>
          </>
        )}
      </div>
    </>
  );

  if (!showCard) return content;

  return (
    <div className="card p-6">
      {content}
    </div>
  );
};
