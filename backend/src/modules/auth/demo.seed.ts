import { randomUUID } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client.js';

// Demo data for "Try demo": realistic-looking two months of a user's finances.
// Amounts are in minor units (kopecks / cents), dates are relative to "now",
// so the demo always looks fresh.

type Tx = Prisma.TransactionClient;
type AccountKey = 'mono' | 'cash' | 'wise';
type CategoryKey =
  | 'salary'
  | 'freelance'
  | 'rent'
  | 'groceries'
  | 'utilities'
  | 'transport'
  | 'cafes'
  | 'entertainment'
  | 'subscriptions';

const ACCOUNTS: Record<AccountKey, { name: string; currency: string }> = {
  mono: { name: 'Monobank', currency: 'UAH' },
  cash: { name: 'Cash', currency: 'USD' },
  wise: { name: 'Wise', currency: 'EUR' },
};

const CATEGORIES: Record<CategoryKey, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  rent: 'Rent',
  groceries: 'Groceries',
  utilities: 'Utilities',
  transport: 'Transport',
  cafes: 'Cafes',
  entertainment: 'Entertainment',
  subscriptions: 'Subscriptions',
};

// [account, category, type, amount (minor units), days ago, note]
type Row = [AccountKey, CategoryKey, 'INCOME' | 'EXPENSE', number, number, string?];

const TRANSACTIONS: Row[] = [
  ['mono', 'salary', 'INCOME', 6_500_000, 55, 'Monthly salary'],
  ['mono', 'salary', 'INCOME', 6_500_000, 25, 'Monthly salary'],
  ['mono', 'rent', 'EXPENSE', 1_800_000, 53, 'Apartment'],
  ['mono', 'rent', 'EXPENSE', 1_800_000, 23, 'Apartment'],
  ['mono', 'groceries', 'EXPENSE', 145_000, 50],
  ['mono', 'groceries', 'EXPENSE', 98_000, 44],
  ['mono', 'groceries', 'EXPENSE', 167_500, 36],
  ['mono', 'groceries', 'EXPENSE', 112_000, 29],
  ['mono', 'groceries', 'EXPENSE', 154_000, 20],
  ['mono', 'groceries', 'EXPENSE', 89_000, 12],
  ['mono', 'groceries', 'EXPENSE', 131_000, 5],
  ['mono', 'utilities', 'EXPENSE', 320_000, 48, 'Electricity, water, internet'],
  ['mono', 'utilities', 'EXPENSE', 335_000, 18, 'Electricity, water, internet'],
  ['mono', 'transport', 'EXPENSE', 45_000, 47, 'Taxi'],
  ['mono', 'transport', 'EXPENSE', 38_000, 33, 'Metro card'],
  ['mono', 'transport', 'EXPENSE', 52_000, 15, 'Taxi'],
  ['mono', 'transport', 'EXPENSE', 41_000, 3, 'Metro card'],
  ['mono', 'cafes', 'EXPENSE', 18_500, 46],
  ['mono', 'cafes', 'EXPENSE', 22_000, 39],
  ['mono', 'cafes', 'EXPENSE', 16_000, 27],
  ['mono', 'cafes', 'EXPENSE', 24_500, 10],
  ['mono', 'cafes', 'EXPENSE', 19_000, 1],
  ['mono', 'entertainment', 'EXPENSE', 60_000, 41, 'Cinema'],
  ['mono', 'entertainment', 'EXPENSE', 120_000, 14, 'Concert'],
  ['cash', 'cafes', 'EXPENSE', 450, 30, 'Coffee'],
  ['cash', 'cafes', 'EXPENSE', 600, 8, 'Coffee'],
  ['cash', 'entertainment', 'EXPENSE', 2_500, 22, 'Board games'],
  ['wise', 'freelance', 'INCOME', 80_000, 40, 'Landing page'],
  ['wise', 'freelance', 'INCOME', 95_000, 9, 'Bug fixes'],
  ['wise', 'subscriptions', 'EXPENSE', 1_299, 38, 'Music'],
  ['wise', 'subscriptions', 'EXPENSE', 1_299, 8, 'Music'],
];

// [from, to, fromAmount, toAmount, days ago, note]
type TransferRow = [AccountKey, AccountKey, number, number, number, string];

const TRANSFERS: TransferRow[] = [
  ['wise', 'mono', 50_000, 2_400_000, 35, 'EUR to UAH'],
  ['mono', 'cash', 2_100_000, 50_000, 24, 'Bought dollars'],
];

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

// Runs inside the caller's DB transaction (tx), so either everything is created or nothing
export async function seedDemoData(tx: Tx, userId: string): Promise<void> {
  const accountIds = {} as Record<AccountKey, string>;
  for (const [key, data] of Object.entries(ACCOUNTS) as [AccountKey, { name: string; currency: string }][]) {
    const account = await tx.account.create({ data: { ...data, userId }, select: { id: true } });
    accountIds[key] = account.id;
  }

  const categoryIds = {} as Record<CategoryKey, string>;
  for (const [key, name] of Object.entries(CATEGORIES) as [CategoryKey, string][]) {
    const category = await tx.category.create({ data: { name, userId }, select: { id: true } });
    categoryIds[key] = category.id;
  }

  const transactions = TRANSACTIONS.map(([account, category, type, amount, days, note]) => ({
    accountId: accountIds[account],
    categoryId: categoryIds[category],
    type,
    amount,
    date: daysAgo(days),
    note: note ?? null,
  }));

  const transferHalves = TRANSFERS.flatMap(([from, to, fromAmount, toAmount, days, note]) => {
    const transferId = randomUUID();
    const date = daysAgo(days);
    return [
      { accountId: accountIds[from], type: 'TRANSFER_OUT' as const, amount: fromAmount, date, note, transferId },
      { accountId: accountIds[to], type: 'TRANSFER_IN' as const, amount: toAmount, date, note, transferId },
    ];
  });

  await tx.transaction.createMany({ data: [...transactions, ...transferHalves] });
}
