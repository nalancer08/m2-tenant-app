import styles from './Logo.module.css';
import { cn } from '../../lib/cn';

export function Logo({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <span className={cn(styles.root, className)} style={{ fontSize: size }}>
      m<span className={styles.sup}>2</span>
    </span>
  );
}
