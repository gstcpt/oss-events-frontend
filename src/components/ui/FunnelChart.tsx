import React from 'react';

interface FunnelChartStep {
  name: string;
  value: number;
}

interface FunnelChartProps {
  title?: string;
  steps: FunnelChartStep[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ title = 'Funnel Chart', steps }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">Funnel chart goes here</div>
    </div>
  );
};
