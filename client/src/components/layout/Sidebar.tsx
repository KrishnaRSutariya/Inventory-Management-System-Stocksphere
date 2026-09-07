import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  History,
  LogOut,
  Boxes,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { UserRole } from '../../types/api.types';

export interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/products',
      label: 'Products',
      icon: Package
    },
    {
      to: '/categories',
      label: 'Categories',
      icon: FolderTree
    },
    {
      to: '/inventory',
      label: 'Stock Ledger',
      icon: History
    }
  ];

  return (
    <aside
      className={cn(
        'flex flex-col h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-18 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
            StockSphere
          </h1>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Inventory OS v1.0
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout section */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                {user?.name || 'Logged User'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {isAdmin ? (
                  <Badge variant="purple" className="text-[9px] px-1.5 py-0 leading-tight">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Admin
                  </Badge>
                ) : (
                  <Badge variant="info" className="text-[9px] px-1.5 py-0 leading-tight">
                    <UserCheck className="w-2.5 h-2.5 mr-0.5" /> Staff
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
