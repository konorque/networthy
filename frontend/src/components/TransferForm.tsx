import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldClass, formCardClass, primaryButtonClass } from '../lib/styles.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api.ts';
import { FormError } from './FormError.tsx';
import { z } from 'zod';
import { toast } from 'sonner';

type Option = {
  id: string;
  name: string;
};

const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Choose an account'),
  toAccountId: z.string().min(1, 'Choose an account'),
  amount: z.number({ error: 'Enter an amount' }).positive(),
  date: z.string().trim().min(1, 'Choose a date').max(50),
  note: z.string().trim().optional(),
});

type TransferValues = z.infer<typeof transferSchema>;

export function TransferForm() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api<Option[]>('/accounts'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { date: new Date().toLocaleDateString('en-CA') },
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: TransferValues) => {
      const cents = Math.round(data.amount * 100);
      return api('/transfers', {
        method: 'POST',
        body: JSON.stringify({
          fromAccountId: data.fromAccountId,
          toAccountId: data.toAccountId,
          fromAmount: cents,
          toAmount: cents,
          date: data.date,
          note: data.note,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transfer created');
      reset();
    },
    onError: (err) => setError('root', { message: err.message }),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => createMutation.mutate(data))}
      onChange={() => clearErrors()}
      className={formCardClass}
    >
      <h2 className="font-medium sm:col-span-3">Create transfer</h2>
      <select {...register('fromAccountId')} className={fieldClass}>
        <option value="">From account</option>
        {accounts?.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
      <select {...register('toAccountId')} className={fieldClass}>
        <option value="">To account</option>
        {accounts?.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        step="any"
        placeholder="Enter amount"
        {...register('amount', { valueAsNumber: true })}
        className={fieldClass}
      />
      <input type="date" {...register('date')} className={fieldClass} />
      <input placeholder="Note" {...register('note')} className={fieldClass} />
      <button
        type="submit"
        disabled={createMutation.isPending}
        className={`${primaryButtonClass} sm:col-start-3`}
      >
        {createMutation.isPending ? 'Transferring…' : 'Transfer'}
      </button>
      <div className="empty:hidden sm:col-span-3">
        <FormError errors={errors} />
      </div>
    </form>
  );
}
