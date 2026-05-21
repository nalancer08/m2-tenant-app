import { useId, type ChangeEvent } from 'react';
import styles from './YearsMonthsField.module.css';

export interface YearsMonthsFieldProps {
  label?: string;
  /** Total months. `null` is empty. */
  value: number | null;
  onChange: (months: number | null) => void;
  hint?: string;
  error?: string;
}

function decompose(months: number | null): { years: string; months: string } {
  if (months === null || months === undefined) return { years: '', months: '' };
  const y = Math.floor(months / 12);
  const m = months % 12;
  return { years: String(y), months: String(m) };
}

/**
 * YearsMonthsField — split-input para capturar antigüedad de forma
 * intuitiva. Internamente seguimos guardando un total en meses (lo que
 * el API espera), pero el UI muestra "Años" + "Meses" para que un
 * usuario con 20 años de antigüedad no tenga que multiplicar.
 *
 * Reglas:
 *   - Si ambos quedan vacíos → onChange(null)
 *   - Si solo años o solo meses → cuenta el otro como 0
 *   - Meses se clampa a 0..11 (anything >=12 escala a años automáticamente
 *     pero NO al teclear — solo al hacer blur, para que el usuario pueda
 *     borrar el primer dígito sin que se le mueva el cursor)
 */
export function YearsMonthsField({
  label,
  value,
  onChange,
  hint,
  error,
}: YearsMonthsFieldProps) {
  const yearsId = useId();
  const monthsId = useId();
  const { years, months } = decompose(value);

  const emit = (newYears: string, newMonths: string) => {
    if (newYears === '' && newMonths === '') {
      onChange(null);
      return;
    }
    const y = parseInt(newYears || '0', 10);
    const m = parseInt(newMonths || '0', 10);
    if (isNaN(y) || isNaN(m)) {
      onChange(null);
      return;
    }
    onChange(y * 12 + m);
  };

  const handleYears = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value.replace(/[^\d]/g, '').slice(0, 2);
    emit(raw, months);
  };

  const handleMonths = (e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.currentTarget.value.replace(/[^\d]/g, '').slice(0, 2);
    // Cap at 11 only on blur — see handleMonthsBlur. Allow user to type
    // freely (e.g. "1" then "2" cap together to "12" later).
    emit(years, raw);
    void raw;
  };

  const handleMonthsBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const m = parseInt(e.currentTarget.value || '0', 10);
    if (isNaN(m)) return;
    if (m >= 12) {
      // Roll excess into years.
      const totalYears = parseInt(years || '0', 10) + Math.floor(m / 12);
      const remainder = m % 12;
      emit(String(totalYears), String(remainder));
    }
  };

  return (
    <div className={styles.root}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div className={`${styles.wrap} ${error ? styles.wrap_error : ''}`}>
        <div className={styles.cell}>
          <input
            id={yearsId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={styles.input}
            value={years}
            onChange={handleYears}
            placeholder="0"
            aria-label="Años"
          />
          <label htmlFor={yearsId} className={styles.unit}>
            años
          </label>
        </div>
        <div className={styles.divider} aria-hidden />
        <div className={styles.cell}>
          <input
            id={monthsId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={styles.input}
            value={months}
            onChange={handleMonths}
            onBlur={handleMonthsBlur}
            placeholder="0"
            aria-label="Meses"
          />
          <label htmlFor={monthsId} className={styles.unit}>
            meses
          </label>
        </div>
      </div>
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}
