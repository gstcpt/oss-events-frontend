import React from 'react';

interface GeoChartProps {
  title?: string;
  data: { region: string; value: number }[];
}

export const GeoChart: React.FC<GeoChartProps> = ({ title = 'Geo Chart', data }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">Geo chart goes here</div>
    </div>
  );
};
