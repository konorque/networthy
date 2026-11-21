import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api.ts';
import { formatMoney } from '../lib/money.ts';
import { FormError } from '../components/FormError.tsx';
import { z } from 'zod';
import { toast } from 'sonner';

type Transaction = {
  account: { name: string; currency: string };
  category: { name: string } | null;
  id: string;
  type: string;
  amount: number;
  date: string;
  transferId: string | null;
};

type Option = {
  id: string;
  name: string;
};

const transactionSchema = z.object({
  accountId: z.string().min(1, 'Choose an account'),
  categoryId: z.string().min(1, 'Choose a category'),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number({ error: 'Enter an amount' }).positive(),
  date: z.string().trim().min(1, 'Choose a date').max(50),
  note: z.string().trim().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

const fieldClass =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring';

function amountClass(type: string) {
  if (type === 'INCOME') return 'text-income';
  if (type === 'EXPENSE') return 'text-expense';
  return 'text-transfer';
}

function amountSign(type: string) {
  if (type === 'INCOME' || type === 'TRANSFER_IN') return '+';
  return '-';
}

export function TransactionsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api<Transaction[]>('/transactions'),
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api<Option[]>('/accounts'),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Option[]>('/categories'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { date: new Date().toLocaleDateString('en-CA') },
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: TransactionForm) =>
      api('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          amount: Math.round(data.amount * 100),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      reset();
    },
    onError: (err) => setError('root', { message: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transaction deleted');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTransferMutation = useMutation({
    mutationFn: (id: string) => api(`/transfers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transfer deleted');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Transactions</h1>
      <form
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        onChange={() => clearErrors()}
        className="mb-6 grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-3"
      >
        <select {...register('accountId')} className={fieldClass}>
          <option value="">Account</option>
          {accounts?.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <select {...register('categoryId')} className={fieldClass}>
          <option value="">Category</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select {...register('type')} className={fieldClass}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <input
          type="number"
          step="any"
          placeholder="Enter amount"
          {...register('amount', { valueAsNumber: true })}
          className={fieldClass}
        />
        <input type="date" {...register('date')} className={fieldClass} />
        <input
          placeholder="Note"
          {...register('note')}
          className={fieldClass}
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-accent px-4 py-2 font-medium text-ink transition-colors hover:bg-accent-hover disabled:opacity-60 sm:col-start-3"
        >
          {createMutation.isPending ? 'Adding…' : 'Add'}
        </button>
        <div className="empty:hidden sm:col-span-3">
          <FormError errors={errors} />
        </div>
      </form>
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {data.map((transaction) => (
          <li
            key={transaction.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="text-sm text-muted">
                {new Date(transaction.date).toLocaleDateString('en-GB')}
              </p>
              <p className="font-medium">
                {transaction.category?.name ?? 'Transfer'} ·{' '}
                {transaction.account.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p
                className={`font-medium tabular-nums ${amountClass(transaction.type)}`}
              >
                {amountSign(transaction.type)}
                {formatMoney(transaction.amount, transaction.account.currency)}
              </p>
              <div className="w-20 text-right">
                <button
                  type="button"
                  onClick={() =>
                    transaction.transferId
                      ? deleteTransferMutation.mutate(transaction.transferId)
                      : deleteMutation.mutate(transaction.id)
                  }
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium transition-colors hover:text-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
