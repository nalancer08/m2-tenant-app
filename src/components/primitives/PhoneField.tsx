import { useId } from 'react';
import { PhoneInput, defaultCountries, parseCountry } from 'react-international-phone';
import 'react-international-phone/style.css';
import styles from './PhoneField.module.css';

export interface PhoneFieldProps {
  label?: string;
  value: string;
  /** E.164 string ("+5215512345678") or empty. */
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** ISO2 default. We pin to Mexico but the user can change with the flag dropdown. */
  defaultCountry?: string;
  name?: string;
}

// Filter the country list to keep all (long list is OK — the dropdown
// has a search box). But put Mexico first so the default flag is always
// MX even before the user picks anything. parseCountry gives [name,
// iso2, dial, fmt, priority, areaCodes].
const COUNTRIES = (() => {
  const all = defaultCountries.slice();
  const mxIdx = all.findIndex((c) => parseCountry(c).iso2 === 'mx');
  if (mxIdx > 0) {
    const [mx] = all.splice(mxIdx, 1);
    all.unshift(mx);
  }
  return all;
})();

/**
 * Phone input with country lada picker. Powered by
 * react-international-phone — light, accessible, no peer deps.
 *
 * Behavior:
 *   - Default flag: 🇲🇽 +52
 *   - User can change country via dropdown (with built-in search)
 *   - Input is restricted to digits matching the country's max national
 *     length (e.g. 10 for MX) — anything longer is silently dropped
 *   - onChange emits the full E.164 string (e.g. "+525512345678")
 *   - Empty string is emitted as "" (not "+52") so canAdvance() can
 *     detect "not filled yet" with a simple .trim().length check
 */
export function PhoneField({
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  defaultCountry = 'mx',
  name,
}: PhoneFieldProps) {
  const inputId = useId();
  return (
    <div className={styles.root}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <PhoneInput
        defaultCountry={defaultCountry}
        countries={COUNTRIES}
        value={value}
        onChange={(v) => {
          // When the user clears the input the library still emits
          // "+52" (just the dial code) — normalize to empty so the
          // wizard's canAdvance() sees the field as blank.
          const digits = v.replace(/[^\d]/g, '');
          const dial = (defaultCountry === 'mx' ? '52' : '');
          if (digits === dial || digits === '') {
            onChange('');
          } else {
            onChange(v);
          }
        }}
        disabled={disabled}
        inputProps={{ id: inputId, name }}
        className={styles.input}
        countrySelectorStyleProps={{
          buttonClassName: styles.country,
          dropdownStyleProps: { className: styles.dropdown },
        }}
        inputClassName={styles.nativeInput}
      />
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}
