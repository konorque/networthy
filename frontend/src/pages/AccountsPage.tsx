import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api.ts';
import { FormError } from '../components/FormError.tsx';
import { formatMoney } from '../lib/money.ts';
import { fieldClass, primaryButtonClass } from '../lib/styles.ts';

type Account = { id: string; name: string; currency: string; balance: number };

const accountSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(50),
  currency: z.enum(['EUR', 'USD', 'UAH']),
});
type AccountValues = z.infer<typeof accountSchema>;

export function AccountsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api<Account[]>('/accounts'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    reValidateMode: 'onSubmit',
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: AccountValues) =>
      api('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      reset();
    },
    onError: (err) => setError('root', { message: err.message }),
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Accounts</h1>
      <form
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        onChange={() => clearErrors()}
        className="mb-6 flex gap-2"
      >
        <input
          {...register('name')}
          placeholder="New account"
          className={`${fieldClass} flex-1`}
        />
        <select {...register('currency')} className={`${fieldClass} w-28`}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="UAH">UAH</option>
        </select>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className={primaryButtonClass}
        >
          {createMutation.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>
      <FormError errors={errors} />
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {data.map((account) => (
          <li
            key={account.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="font-medium">{account.name}</p>
              <p className="text-sm text-muted">{account.currency}</p>
            </div>
            <p
              className={`font-medium tabular-nums ${account.balance < 0 ? 'text-expense' : ''}`}
            >
              {formatMoney(account.balance, account.currency)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
