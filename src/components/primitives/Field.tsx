import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import styles from './Field.module.css';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, leftIcon, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label className={styles.root} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.wrap}>
        {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(styles.input, leftIcon && styles.input_hasLeftIcon, error && styles.input_error, className)}
          {...rest}
        />
      </span>
      {error ? <span className={styles.error}>{error}</span> : hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
});
