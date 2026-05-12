import { Outlet } from 'react-router';
import { Logo } from '../primitives/Logo';
import styles from './TenantShell.module.css';

interface TenantShellProps {
  title?: string;
  step?: { current: number; total: number };
  onExit?: () => void;
}

export function TenantShell({ step }: TenantShellProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Logo size={26} />
        {step ? (
          <div className={styles.progress}>
            <span className={styles.progressLabel}>
              Paso {step.current} de {step.total}
            </span>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${(step.current / step.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <span className={styles.headerLabel}>Mi cuenta</span>
        )}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
