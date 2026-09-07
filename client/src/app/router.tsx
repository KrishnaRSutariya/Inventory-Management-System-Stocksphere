import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { InventoryHistoryPage } from '../pages/InventoryHistoryPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { Spinner } from '../components/ui/Loader';

// Protected Route Guard
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
        <p className="text-xs text-slate-400 mt-4 animate-pulse">
          Authenticating session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Public Only Route Guard (e.g. login/register when already logged in)
const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const router = createBrowserRouter([
  // Public Routes (Auth)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      }
    ]
  },

  // Authenticated App Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: '/dashboard',
            element: <DashboardPage />
          },
          {
            path: '/products',
            element: <ProductsPage />
          },
          {
            path: '/categories',
            element: <CategoriesPage />
          },
          {
            path: '/inventory',
            element: <InventoryHistoryPage />
          }
        ]
      }
    ]
  },

  // 404 Catch-All
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
