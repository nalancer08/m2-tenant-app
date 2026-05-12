import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  step: number;
  total: number;
  label?: string;
}

export function ProgressBar({ step, total, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (step / total) * 100));
  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <span className={styles.label}>{label ?? `Paso ${step} de ${total}`}</span>
        <span className={styles.pct}>{Math.round(pct)}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
