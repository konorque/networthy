export function formatMoney(amountMinor: number, currency: string) {
  const money = amountMinor / 100;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format(money);
}
