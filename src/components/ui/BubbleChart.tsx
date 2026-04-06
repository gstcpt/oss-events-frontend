import React from 'react';

interface BubbleChartData {
  x: number;
  y: number;
  size: number;
  label: string;
}

interface BubbleChartProps {
  title: string;
  data: BubbleChartData[];
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ title, data }) => {
  const maxX = Math.max(...data.map(d => d.x), 0);
  const maxY = Math.max(...data.map(d => d.y), 0);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="relative h-72 bg-gray-50 p-4 rounded-lg">
        {data.map((item, index) => {
          const left = maxX > 0 ? (item.x / maxX) * 100 : 0;
          const bottom = maxY > 0 ? (item.y / maxY) * 100 : 0;
          return (
            <div
              key={index}
              className="absolute bg-blue-500 rounded-full flex items-center justify-center"
              style={{
                left: `${left}%`,
                bottom: `${bottom}%`,
                width: `${item.size}px`,
                height: `${item.size}px`,
                transform: 'translate(-50%, 50%)',
              }}
              title={`${item.label}: (x: ${item.x}, y: ${item.y})`}
            >
              <span className="text-white text-xs truncate px-1">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};