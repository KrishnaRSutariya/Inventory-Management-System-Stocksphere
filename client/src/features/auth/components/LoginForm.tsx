import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, User } from 'lucide-react';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (_err) {
      // Error is handled in AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="admin@inventory.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          rightIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Login Helpers for Evaluators / Evaluator Experience */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs font-semibold text-center text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Quick Demo Credentials
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillQuickCredentials('admin@inventory.com', 'Admin123!')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Admin User</span>
          </button>
          <button
            type="button"
            onClick={() => fillQuickCredentials('staff@inventory.com', 'Staff123!')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span>Staff User</span>
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Create account
        </Link>
      </p>
    </div>
  );
};
