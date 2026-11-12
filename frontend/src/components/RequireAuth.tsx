import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { Navigate, Outlet, Link } from 'react-router';

export function RequireAuth() {
  const { data, isPending, error } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ email: string }>('/auth/me'),
    retry: false,
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <Navigate to="/login" replace />;

  return (
    <>
      <header className="border-b border-line bg-surface sticky top-0">
        <div className="flex h-16  items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted"
          >
            <span className="size-2.5 rounded-full bg-accent" />
            Networthy
          </Link>
          <Link
            to="/profile"
            className="flex size-9 items-center justify-center rounded-full bg-accent-soft font-semibold"
          >
            {data.email.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>
      <div className="p-8">
        <Outlet />
      </div>
    </>
  );
}
