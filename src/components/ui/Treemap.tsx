import React from 'react';

interface TreemapNode {
  name: string;
  value: number;
}

interface TreemapProps {
  title: string;
  data: TreemapNode[];
}

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
];

export const Treemap: React.FC<TreemapProps> = ({ title, data }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="flex flex-wrap content-start w-full h-72 bg-gray-50 p-1 rounded-lg">
        {data.map((item, index) => {
          const flexBasis = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          return (
            <div
              key={index}
              className="flex items-center justify-center m-1"
              style={{
                flex: `1 1 ${flexBasis}%`,
                backgroundColor: COLORS[index % COLORS.length],
                color: 'white',
                borderRadius: '4px',
                minHeight: '60px',
              }}
              title={`${item.name}: ${item.value}`}
            >
              <div className="text-center p-2">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};