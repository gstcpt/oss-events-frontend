'use client';

import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  title?: string;
  data: { x: string | number; y: number }[];
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ title = 'Line Chart', data, color = '#A70000' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="y" name="Item(s)" stroke={color} activeDot={{ r: 8 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
