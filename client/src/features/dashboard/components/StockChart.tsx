import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils';

export interface StockChartProps {
  data: Array<{
    _id: string;
    categoryName: string;
    productCount: number;
    totalQuantity: number;
    totalValue: number;
  }>;
}

export const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.categoryName.length > 18 ? item.categoryName.substring(0, 16) + '...' : item.categoryName,
    fullName: item.categoryName,
    quantity: item.totalQuantity,
    value: item.totalValue
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">{payload[0]?.payload?.fullName || label}</p>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            Units in Stock: <span className="font-bold text-slate-900 dark:text-white">{payload[0]?.value}</span>
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
            Inventory Value: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(payload[0]?.payload?.value || 0)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Stock Volume by Category
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total product units categorized across warehouse sectors
          </p>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No category stock data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="quantity"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
