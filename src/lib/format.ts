export function formatCents(input: string | number | null | undefined, currency = 'MXN'): string {
  if (input === null || input === undefined) return '—';
  const cents = typeof input === 'string' ? Number(input) : input;
  if (!Number.isFinite(cents)) return '—';
  const value = cents / 100;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPropertyAddress(p: {
  street: string;
  exterior_number: string | null;
  interior_number: string | null;
  neighborhood: string | null;
  city: string;
}): string {
  const parts = [p.street];
  if (p.exterior_number) parts.push(p.exterior_number);
  if (p.interior_number) parts.push(`int. ${p.interior_number}`);
  const line = parts.join(' ');
  return p.neighborhood ? `${line}, ${p.neighborhood}` : line;
}
