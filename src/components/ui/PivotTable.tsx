import React from 'react';

interface PivotTableProps {
  title?: string;
  data: any[];
  rows: string[];
  columns: string[];
  values: string;
}

export const PivotTable: React.FC<PivotTableProps> = ({ title = 'Pivot Table', data, rows, columns, values }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">Pivot table goes here</div>
    </div>
  );
};
