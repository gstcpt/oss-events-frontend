'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartData {
  name: string;
  [key: string]: any;
}

interface BarChartProps {
  title: string;
  data: BarChartData[];
  dataKey: string;
  color?: string;
  showCard?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, dataKey, color = "#3b82f6", showCard = true }) => {
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
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
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
                formatter={(value: any) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  title
                ]}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                cursor={{ fill: '#F3F4F6' }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
                {(data || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={Math.max(0.1, 1 - (index * 0.1))}
                  />
                ))}
              </Bar>
            </RechartsBarChart>
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