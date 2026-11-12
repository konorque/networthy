import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Enter password'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) =>
      api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['me'] });
      navigate('/');
    },
  });

  function onSubmit(data: LoginForm) {
    loginMutation.mutate(data);
  }

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <p className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted">
          <span className="size-2.5 rounded-full bg-accent" />
          Networthy
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-8"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <div className="flex flex-col gap-1">
          <input
            {...register('email')}
            placeholder="Email"
            className="rounded-lg border border-line px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring"
          />
          {errors.email && (
            <p className="text-sm text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            className="rounded-lg border border-line px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring"
          />
          {errors.password && (
            <p className="text-sm text-danger">{errors.password.message}</p>
          )}
        </div>

        {loginMutation.error && (
          <p className="rounded-lg bg-accent-faint px-3 py-2 text-sm text-danger">
            {loginMutation.error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="rounded-lg bg-accent py-2 font-medium text-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
