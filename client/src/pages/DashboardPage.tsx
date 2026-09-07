import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Boxes,
  AlertTriangle,
  XCircle,
  DollarSign,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { fetchDashboardMetrics } from '../features/dashboard/api/dashboard.api';
import { StatsCard } from '../features/dashboard/components/StatsCard';
import { StockChart } from '../features/dashboard/components/StockChart';
import { CategoryPieChart } from '../features/dashboard/components/CategoryPieChart';
import { RecentActivity } from '../features/dashboard/components/RecentActivity';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const {
    data: metrics,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !metrics) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const { kpis, statusBreakdown, categoryDistribution, recentTransactions } = metrics;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-600/15">
        <div>
          <h2 className="text-xl font-bold">Operational Overview</h2>
          <p className="text-xs text-blue-100 mt-0.5">
            Monitor real-time inventory levels, dynamic thresholds, and inventory valuation
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/inventory">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white dark:border-white/20"
              leftIcon={<ArrowUpDown className="w-4 h-4" />}
            >
              Adjust Stock
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/products?action=new">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Primary KPI Grid (2 rows for 3:3 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatsCard
          title="Total Products"
          value={kpis.totalProducts}
          subtitle="Catalog SKUs"
          icon={<Package className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        />

        <StatsCard
          title="Stock Volume"
          value={kpis.totalStockQuantity}
          subtitle="Units across all items"
          icon={<Boxes className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        />

        <StatsCard
          title="Valuation"
          value={formatCurrency(Math.round(kpis.totalInventoryValue))}
          subtitle="Total inventory worth"
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        />

        <StatsCard
          title="Categories"
          value={kpis.totalCategories}
          subtitle="Active sectors"
          icon={<FolderTree className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
        />

        <StatsCard
          title="Low Stock"
          value={kpis.lowStockItems}
          subtitle="Under threshold"
          icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
        />

        <StatsCard
          title="Out of Stock"
          value={kpis.outOfStockItems}
          subtitle="Zero quantity items"
          icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockChart data={categoryDistribution} />
        </div>
        <div>
          <CategoryPieChart data={statusBreakdown} />
        </div>
      </div>

      {/* Recent Movements Section */}
      <div>
        <RecentActivity transactions={recentTransactions} />
      </div>
    </div>
  );
};
