import React from 'react';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  trend
}) => {
  return (
    <Card hoverEffect className="relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight"
            title={String(value)}
          >
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
            iconBgColor
          )}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs">
          <span
            className={cn(
              'font-semibold mr-1.5',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-400 text-[11px]">vs benchmark</span>
        </div>
      )}
    </Card>
  );
};
