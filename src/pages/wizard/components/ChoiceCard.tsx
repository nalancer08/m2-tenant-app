import type { ReactNode } from 'react';
import { IconCheck } from '../../../components/icons';
import styles from './ChoiceCard.module.css';

interface ChoiceCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  trailing?: ReactNode;
}

/**
 * Large mobile-friendly radio-style card used across the wizard wherever
 * the tenant picks from a small set of mutually-exclusive options
 * (régimen, sí/no, mex/ext, education, civil status, living situation,
 * employment status, income source, …).
 */
export function ChoiceCard({
  label,
  description,
  selected,
  onSelect,
  disabled,
  trailing,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.card_selected : ''}`}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className={styles.indicator} aria-hidden>
        {selected ? <IconCheck width={12} height={12} /> : null}
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
      {trailing}
    </button>
  );
}
