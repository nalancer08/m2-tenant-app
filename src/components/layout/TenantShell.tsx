import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Logo } from '../primitives/Logo';
import { useAuth } from '../../auth/AuthProvider';
import styles from './TenantShell.module.css';

interface TenantShellProps {
  title?: string;
  step?: { current: number; total: number };
  onExit?: () => void;
}

/**
 * Shell para las páginas con header. El header es full-bleed (se sale
 * del max-width del cuerpo para que se vea como una barra unificada,
 * no como una tarjeta flotando dentro de la columna), mientras que
 * el main se queda centrado a 480px.
 *
 * Dentro del header todo se alinea contra un .headerInner con el mismo
 * max-width 480px, así el logo cuadra exactamente arriba del contenido.
 */
export function TenantShell({ step }: TenantShellProps) {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const email = me?.user?.email ?? '';
  const initial = email ? email[0].toUpperCase() : 'M';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo size={28} />
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
            <div className={styles.accountWrap}>
              <button
                type="button"
                className={styles.accountBtn}
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className={styles.avatar} aria-hidden>
                  {initial}
                </span>
                <span className={styles.accountText}>
                  {email || 'Mi cuenta'}
                </span>
                <span className={styles.caret} aria-hidden>
                  <svg width="10" height="10" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {menuOpen ? (
                <>
                  {/* Click-catcher to close on outside tap */}
                  <button
                    type="button"
                    className={styles.menuBackdrop}
                    aria-label="Cerrar menú"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className={styles.menu} role="menu">
                    {email ? (
                      <div className={styles.menuEmail}>
                        Sesión iniciada como
                        <strong>{email}</strong>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/mi-informacion');
                      }}
                    >
                      Mi información
                    </button>
                    <button
                      type="button"
                      className={`${styles.menuItem} ${styles.menuItem_danger}`}
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                        navigate('/auth/login', { replace: true });
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
