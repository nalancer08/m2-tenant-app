import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { IconArrowRight, IconCheck, IconClock, IconShield } from '../../components/icons';
import { tenantMeApi } from '../../api/tenant-me';
import { useAuth } from '../../auth/AuthProvider';
import styles from './WelcomePage.module.css';

/**
 * Post-signup landing. Loads the tenant aggregate and, if the wizard
 * isn't complete yet, redirects straight to /wizard. On a cold post-
 * signup load this means the user blinks here for a moment and lands
 * in Step 1 — the "you're done" state below only renders once the
 * wizard is completed.
 */
export function WelcomePage() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const email = me?.user?.email ?? '';

  const fullQ = useQuery({
    queryKey: ['tenant-me-full'],
    queryFn: () => tenantMeApi.full(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!fullQ.data) return;
    if (!fullQ.data.tenant.wizard_completed) {
      navigate('/wizard', { replace: true });
    }
  }, [fullQ.data, navigate]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden /> Cuenta creada
        </span>
        <h1 className={styles.title}>
          ¡Bienvenido a <em>Metro Cuadrado</em>!
        </h1>
        <p className={styles.subtitle}>
          Tu cuenta está lista{email ? ` (${email})` : ''}. En seguida arrancamos la
          captura de información para tu investigación.
        </p>
      </header>

      <Card>
        <div className={styles.line}>
          <span className={styles.lineIcon}><IconShield /></span>
          <div>
            <span className={styles.lineTitle}>Tus datos están protegidos</span>
            <p className={styles.lineDesc}>
              Tu información solo se comparte con el asesor que te invitó.
            </p>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.lineIcon}><IconClock /></span>
          <div>
            <span className={styles.lineTitle}>~24 horas</span>
            <p className={styles.lineDesc}>
              Tiempo promedio del resultado una vez que terminas y pagas.
            </p>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.lineIcon}><IconCheck /></span>
          <div>
            <span className={styles.lineTitle}>Reusable</span>
            <p className={styles.lineDesc}>
              Si aplicas a otra propiedad, reutilizas tu información sin empezar de cero.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <span className={styles.placeholderLabel}>Continúa</span>
        <p className={styles.placeholderDesc}>
          Empezamos por tu régimen fiscal, datos personales y tu situación actual.
          Puedes pausar y volver cuando quieras — guardamos tu avance en cada paso.
        </p>
        <Button
          fullWidth
          rightIcon={<IconArrowRight />}
          onClick={() => navigate('/wizard')}
        >
          Empezar investigación
        </Button>
      </Card>

      <div className={styles.footer}>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => {
            logout();
            navigate('/auth/login', { replace: true });
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
