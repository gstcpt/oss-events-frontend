import React from 'react';

interface ComboChartProps {
  title?: string;
  data: { x: string | number; bar: number; line: number }[];
}

export const ComboChart: React.FC<ComboChartProps> = ({ title = 'Combo Chart', data }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">Combo chart goes here</div>
    </div>
  );
};
