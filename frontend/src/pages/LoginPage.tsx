import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
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

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) =>
      api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => navigate('/'),
  });

  function onSubmit(data: LoginForm) {
    loginMutation.mutate(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 max-w-sm mx-auto mt-16"
    >
      <h1 className="text-2xl font-semibold">Sign in</h1>

      <input
        {...register('email')}
        placeholder="Email"
        className="border rounded px-3 py-2"
      />
      {errors.email && (
        <p className="text-sm text-red-600">{errors.email.message}</p>
      )}

      <input
        {...register('password')}
        type="password"
        placeholder="Password"
        className="border rounded px-3 py-2"
      />
      {errors.password && (
        <p className="text-sm text-red-600">{errors.password.message}</p>
      )}

      {loginMutation.error && (
        <p className="text-sm text-red-600">{loginMutation.error.message}</p>
      )}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="bg-teal-700 text-white rounded py-2"
      >
        Sign in
      </button>
    </form>
  );
}
