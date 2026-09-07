import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};
