import React from 'react';

interface ScatterPlotProps {
  title?: string;
  data: { x: number; y: number; label?: string }[];
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ title = 'Scatter Plot', data }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">Scatter plot goes here</div>
    </div>
  );
};
