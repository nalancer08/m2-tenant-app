import { useState } from 'react';
import { IconCheck } from '../icons';
import styles from './LegalDocCard.module.css';

interface LegalDocCardProps {
  title: string;
  /** Single-paragraph teaser shown next to the checkbox before the user expands. */
  teaser: string;
  /** Full canonical text of the document. */
  content: string;
  /** Version string from the API, shown discretely in the footer for audit clarity. */
  version: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  /** Disable interaction (e.g. while loading or submitting). */
  disabled?: boolean;
}

/**
 * One row of the consent gate: a card with a checkbox + title + "Leer
 * documento" toggle that expands the full canonical text. The text is
 * scrollable to keep the layout from blowing up vertically on mobile.
 *
 * The card visually celebrates the accepted state (tezontle dot, navy
 * border) so the user feels real progress as they tick all three.
 */
export function LegalDocCard({
  title,
  teaser,
  content,
  version,
  checked,
  onCheckedChange,
  disabled,
}: LegalDocCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`${styles.card} ${checked ? styles.card_checked : ''}`}>
      <label className={styles.row}>
        <span className={styles.checkbox}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.currentTarget.checked)}
            disabled={disabled}
          />
          <span className={styles.checkboxBox} aria-hidden>
            {checked ? <IconCheck width={12} height={12} /> : null}
          </span>
        </span>
        <span className={styles.text}>
          <span className={styles.title}>Acepto el {title}</span>
          <span className={styles.teaser}>{teaser}</span>
        </span>
      </label>

      <button
        type="button"
        className={styles.expandBtn}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? 'Ocultar texto completo' : 'Leer texto completo'}
        <span className={`${styles.chev} ${expanded ? styles.chev_open : ''}`} aria-hidden>
          ▾
        </span>
      </button>

      {expanded ? (
        <div className={styles.expanded}>
          <div className={styles.expandedText}>{content}</div>
          <p className={styles.versionTag}>Versión: {version}</p>
        </div>
      ) : null}
    </div>
  );
}
