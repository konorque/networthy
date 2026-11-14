import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api.ts';
import { FormError } from '../components/FormError.tsx';
import { toast } from 'sonner';

type Category = { id: string; name: string };

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(50),
});

type CategoryForm = z.infer<typeof categorySchema>;

export function CategoriesPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/categories'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    reValidateMode: 'onSubmit',
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CategoryForm) =>
      api('/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      reset();
    },
    onError: (err) => setError('root', { message: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Categories</h1>
      <form
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        className="mb-6 flex gap-2"
      >
        <input
          {...register('name', { onChange: () => clearErrors() })}
          placeholder="New Category"
          className="rounded-lg border border-line px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring flex-1"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-24 px-4 rounded-lg bg-accent py-2 font-medium text-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {createMutation.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>
      <FormError errors={errors} />
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {data.map((category) => (
          <li
            key={category.id}
            className="px-5 py-4 font-medium flex items-center justify-between"
          >
            {category.name}
            <button
              onClick={() => deleteMutation.mutate(category.id)}
              className="px-4 rounded-lg bg-accent py-2 font-medium text-sm transition-colors hover:text-danger"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
