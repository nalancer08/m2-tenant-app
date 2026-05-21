import { useEffect, useId, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/style.css';
import styles from './DateField.module.css';

export interface DateFieldProps {
  label?: string;
  /** ISO date "YYYY-MM-DD" or empty. */
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  /** Defaults to 100 years back. */
  minYear?: number;
  /** Defaults to today. */
  maxYear?: number;
  /** Defaults to a sensible year for DOB capture (25 years ago). */
  defaultMonth?: Date;
  placeholder?: string;
}

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function parseISO(value: string): Date | undefined {
  if (!value) return undefined;
  // Parse YYYY-MM-DD as local time (avoid TZ surprises that shift the day).
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toISO(date: Date | undefined): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatLong(date: Date): string {
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`;
}

/**
 * DateField — bottom-sheet style date picker for the wizard.
 *
 * Why this and not <input type="date">:
 *   - The native picker on iOS is a wheel that looks foreign on a "premium"
 *     flow, and the desktop version is a small calendar with no year nav.
 *   - With DayPicker we get a single, branded UI across all platforms,
 *     locale=es out of the box, and proper year navigation (caption dropdowns)
 *     so the user can jump to their birth year in two clicks instead of
 *     monthing back 30+ years.
 *
 * The picker pops up below the trigger button. Click outside or press Esc
 * to close. We never re-mount on every state change so DayPicker keeps
 * its internal month state when the wizard re-renders.
 */
export function DateField({
  label,
  value,
  onChange,
  hint,
  error,
  minYear,
  maxYear,
  defaultMonth,
  placeholder = 'Selecciona una fecha',
}: DateFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selected = parseISO(value);
  const now = new Date();
  const captionFrom = new Date(minYear ?? now.getFullYear() - 100, 0, 1);
  const captionTo = new Date(maxYear ?? now.getFullYear(), 11, 31);

  // Close popover on outside click / Esc.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.root}>
      {label ? (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      ) : null}
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`${styles.trigger} ${error ? styles.trigger_error : ''} ${selected ? styles.trigger_filled : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={styles.triggerText}>
          {selected ? formatLong(selected) : placeholder}
        </span>
        <span className={styles.triggerIcon} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="16" rx="2.5" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open ? (
        <div ref={popoverRef} className={styles.popover} role="dialog">
          <DayPicker
            mode="single"
            locale={es}
            captionLayout="dropdown"
            startMonth={captionFrom}
            endMonth={captionTo}
            defaultMonth={selected ?? defaultMonth ?? new Date(now.getFullYear() - 25, 0, 1)}
            selected={selected}
            onSelect={(d) => {
              onChange(toISO(d));
              if (d) setOpen(false);
            }}
            classNames={{
              root: styles.dpRoot,
              months: styles.dpMonths,
              month_caption: styles.dpCaption,
              dropdowns: styles.dpDropdowns,
              dropdown: styles.dpDropdown,
              weekdays: styles.dpWeekdays,
              weekday: styles.dpWeekday,
              week: styles.dpWeek,
              day: styles.dpDay,
              day_button: styles.dpDayButton,
              selected: styles.dpSelected,
              today: styles.dpToday,
              outside: styles.dpOutside,
              disabled: styles.dpDisabled,
              chevron: styles.dpChevron,
            }}
          />
        </div>
      ) : null}
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}
