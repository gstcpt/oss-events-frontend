import React from 'react';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  centerText?: string;
}

export const PieChart: React.FC<PieChartProps> = ({ title, data, centerText = "Events" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No data to display.</p>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const conicGradient = data
    .map((d) => {
      const start = cumulativePercentage;
      cumulativePercentage += d.value;
      const end = cumulativePercentage;
      return `${d.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="flex justify-center items-center h-64">
        <div className="rounded-full w-48 h-48" style={{ background: `conic-gradient(${conicGradient})` }}>
          <div className="flex justify-center items-center h-full">
            <div className="bg-white rounded-full w-32 h-32 flex justify-center items-center">
              <span className="text-2xl font-bold">{centerText}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center flex-wrap gap-x-4 gap-y-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
            <span className="text-sm">{entry.name} ({entry.value.toFixed(2)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};