import type { FieldErrors } from 'react-hook-form';

export function FormError({ errors }: { errors: FieldErrors }) {
  const message = Object.values(errors).find(
    (error) => error?.message,
  )?.message;
  if (typeof message !== 'string') return null;
  return (
    <p className="rounded-lg bg-accent-faint px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
