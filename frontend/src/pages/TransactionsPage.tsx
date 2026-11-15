import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { formatMoney } from '../lib/money.ts';

type Transaction = {
  account: { name: string; currency: string };
  category: { name: string } | null;
  id: string;
  type: string;
  amount: number;
  date: string;
};

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

  if (isPending) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Transactions</h1>
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
            <p
              className={`font-medium tabular-nums ${amountClass(transaction.type)}`}
            >
              {amountSign(transaction.type)}
              {formatMoney(transaction.amount, transaction.account.currency)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
