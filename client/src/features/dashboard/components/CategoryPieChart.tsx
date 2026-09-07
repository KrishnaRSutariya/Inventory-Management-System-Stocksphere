import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { Card } from '../../../components/ui/Card';
import { StockStatus } from '../../../types/api.types';

export interface CategoryPieChartProps {
  data: Array<{
    name: string;
    count: number;
    status: StockStatus;
    color: string;
  }>;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = data.filter((item) => item.count > 0);
  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, count } = payload[0].payload;
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-xl text-xs space-y-0.5">
          <p className="font-bold text-slate-900 dark:text-white">{name}</p>
          <p className="text-slate-600 dark:text-slate-300">
            Products: <span className="font-semibold">{count}</span> ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Inventory Health Status
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution of catalog items by availability
        </p>
      </div>

      <div className="h-72 w-full flex items-center justify-center">
        {total === 0 ? (
          <div className="text-xs text-slate-400">No inventory status data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
