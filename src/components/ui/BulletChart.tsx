import React from 'react';

interface BulletChartProps {
  title?: string;
  value: number;
  target: number;
  ranges: number[];
}

export const BulletChart: React.FC<BulletChartProps> = ({ title = 'Bullet Chart', value, target, ranges }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">Bullet chart goes here</div>
    </div>
  );
};
