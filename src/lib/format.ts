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
  exterior_number?: string | null;
  interior_number?: string | null;
  neighborhood?: string | null;
  city: string;
}): string {
  // The "street" field is the broker-captured "Calle y número" — Google
  // already includes the exterior number ("Tabasco 311"), and manually-typed
  // entries usually include it too. We only append exterior_number when the
  // street string demonstrably does NOT already contain the number.
  const parts: string[] = [p.street];
  if (p.exterior_number && !streetIncludesNumber(p.street, p.exterior_number)) {
    parts.push(p.exterior_number);
  }
  if (p.interior_number) parts.push(`int. ${p.interior_number}`);
  const line = parts.join(' ');
  return p.neighborhood ? `${line}, ${p.neighborhood}` : line;
}

function streetIncludesNumber(street: string, ext: string): boolean {
  if (!street || !ext) return false;
  const re = new RegExp(`(?:^|\\D)${ext.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?:\\D|$)`);
  return re.test(street);
}
