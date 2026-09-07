import React from 'react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { Boxes, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/layout/ThemeToggle';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-radial-[at_top_right] from-blue-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 overflow-x-hidden">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to StockSphere
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage inventory, tracking, and stock ledger
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800">
          <LoginForm />
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Enterprise Inventory & Stock Movement System</span>
        </div>
      </div>
    </div>
  );
};
