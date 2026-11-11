import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { formatMoney } from '../lib/money.ts';

type Account = { id: string; name: string; currency: string; balance: number };

export function AccountsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api<Account[]>('/accounts'),
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Accounts</h1>
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
