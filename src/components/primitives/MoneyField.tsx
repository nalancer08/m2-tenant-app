import { useId, type ChangeEvent } from 'react';
import styles from './MoneyField.module.css';

export interface MoneyFieldProps {
  label?: string;
  /** Value in cents. `null` represents empty. */
  value: number | null;
  /** Receives the new value in cents (or `null` if cleared). */
  onChange: (cents: number | null) => void;
  hint?: string;
  error?: string;
  /** Currency symbol shown on the left. Defaults to "$". */
  prefix?: string;
  /** Currency suffix on the right. Defaults to "MXN". */
  suffix?: string;
  placeholder?: string;
}

function formatPesos(cents: number | null): string {
  if (cents === null || cents === undefined) return '';
  const pesos = Math.round(cents / 100);
  // Hand-roll the thousands separator so we don't pull Intl on every keystroke.
  return pesos.toLocaleString('es-MX');
}

/**
 * MoneyField — captures whole-peso amounts with automatic thousands
 * separator. Stores the value in cents (the API expects cents).
 *
 * Behavior:
 *   - Strips everything that isn't a digit
 *   - Re-formats on every keystroke ("12500" → "12,500" mientras escribes)
 *   - Empty string → onChange(null), the wizard treats it as "not filled"
 *   - We do NOT capture decimals (centavos) because the wizard collects
 *     monthly net income — pesos exactos están bien. If we ever need
 *     centavos we'll switch to a decimal-aware parser.
 */
export function MoneyField({
  label,
  value,
  onChange,
  hint,
  error,
  prefix = '$',
  suffix = 'MXN',
  placeholder = '12,500',
}: MoneyFieldProps) {
  const id = useId();
  const display = formatPesos(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value.replace(/[^\d]/g, '');
    if (raw === '') {
      onChange(null);
      return;
    }
    const pesos = parseInt(raw, 10);
    if (isNaN(pesos)) {
      onChange(null);
      return;
    }
    onChange(pesos * 100);
  };

  return (
    <div className={styles.root}>
      {label ? (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      ) : null}
      <div className={`${styles.wrap} ${error ? styles.wrap_error : ''}`}>
        <span className={styles.prefix}>{prefix}</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={styles.input}
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
        />
        <span className={styles.suffix}>{suffix}</span>
      </div>
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}
