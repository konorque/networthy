import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { Navigate, Outlet } from 'react-router';

export function RequireAuth() {
  const { isPending, error } = useQuery({
    queryKey: ['me'],
    queryFn: () => api('/auth/me'),
    retry: false,
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <Navigate to="/login" replace />;
  return <Outlet />;
}
