import type { ReactNode } from 'react';
import styles from './WarningCard.module.css';

interface WarningCardProps {
  title: string;
  intro?: string;
  items: string[];
  footnote?: ReactNode;
}

/**
 * Tezontle-accented info card that lists documents the tenant should have
 * on hand before continuing. Used in Step 1 (after picking persona física
 * vs moral) to set expectations on what they'll need to upload in Step 8.
 */
export function WarningCard({ title, intro, items, footnote }: WarningCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.dot} aria-hidden />
        <span className={styles.title}>{title}</span>
      </div>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {footnote ? <div className={styles.footnote}>{footnote}</div> : null}
    </div>
  );
}
