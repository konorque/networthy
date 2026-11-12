import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { api } from '../lib/api.ts';

export function ProfilePage() {
  const { data, isPending, error } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ email: string }>('/auth/me'),
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.removeQueries();
      navigate('/login');
    },
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
      <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4">
        <p>{data.email}</p>
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="rounded-lg border border-line px-4 py-2 hover:bg-accent-faint"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
