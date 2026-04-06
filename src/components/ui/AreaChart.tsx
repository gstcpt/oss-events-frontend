'use client';

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
  title?: string;
  data: { x: string | number; y: number }[];
  color?: string;
  label?: string;
  showCard?: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  title = 'Area Chart',
  data,
  color = "#3b82f6",
  label = "Items",
  showCard = true
}) => {
  const content = (
    <>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-64">
        {(!data || data.length === 0) ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={data}>
              <defs>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="x"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="y"
                name={label}
                stroke={color}
                fillOpacity={1}
                fill="url(#colorY)"
                strokeWidth={2}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
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
