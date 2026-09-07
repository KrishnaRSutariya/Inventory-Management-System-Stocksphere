import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = (pathname: string) => {
    if (pathname === '/' || pathname.startsWith('/dashboard')) {
      return {
        title: 'Inventory Dashboard',
        subtitle: 'Live stock analytics, KPI tracking, and operational alerts'
      };
    }
    if (pathname.startsWith('/products')) {
      return {
        title: 'Product Catalog',
        subtitle: 'Search, filter, manage stock thresholds, and view product details'
      };
    }
    if (pathname.startsWith('/categories')) {
      return {
        title: 'Category Manager',
        subtitle: 'Organize catalog items into structured operational categories'
      };
    }
    if (pathname.startsWith('/inventory')) {
      return {
        title: 'Stock Ledger & Audit Trail',
        subtitle: 'Immutable history of all inward and outward inventory transactions'
      };
    }
    return { title: 'StockSphere', subtitle: 'Enterprise Inventory Management' };
  };

  const pageInfo = getPageInfo(location.pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-10">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
