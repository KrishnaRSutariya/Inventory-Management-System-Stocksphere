import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { registerSchema, RegisterFormData } from '../schemas/auth.schema';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { UserRole } from '../../../types/api.types';

export const RegisterForm: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.USER
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerAuth(data.name, data.email, data.password, data.role);
      navigate('/dashboard');
    } catch (_err) {
      // Handled in AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="jane@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Minimum 6 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Select label="Role Selection" error={errors.role?.message} {...register('role')}>
          <option value={UserRole.USER}>Warehouse Staff (Standard User)</option>
          <option value={UserRole.ADMIN}>Inventory Administrator (Full Access)</option>
        </Select>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          rightIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
