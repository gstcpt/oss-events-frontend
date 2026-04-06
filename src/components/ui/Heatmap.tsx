import React from 'react';

interface HeatmapProps {
  title?: string;
  data: number[][];
  xLabels?: string[];
  yLabels?: string[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ title = 'Heatmap', data, xLabels, yLabels }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">Heatmap goes here</div>
    </div>
  );
};
