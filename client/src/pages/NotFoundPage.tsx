import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        404 — Page Not Found
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6">
        The requested screen or URL does not exist or has been moved to another inventory section.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
