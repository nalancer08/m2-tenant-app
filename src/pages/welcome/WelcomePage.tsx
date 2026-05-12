import { useNavigate } from 'react-router';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { IconCheck, IconClock, IconShield } from '../../components/icons';
import { useAuth } from '../../auth/AuthProvider';
import styles from './WelcomePage.module.css';

export function WelcomePage() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const profile = (me?.profile as Record<string, string>) ?? {};
  const firstName = profile.first_name ?? 'Inquilino';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Hola, <em>{firstName}</em>
        </h1>
        <p className={styles.subtitle}>
          Tu cuenta esta lista. Cuando un asesor te comparta un link, llenas tu investigacion desde aqui.
        </p>
      </header>

      <Card>
        <div className={styles.line}>
          <span className={styles.lineIcon}>
            <IconShield />
          </span>
          <div>
            <span className={styles.lineTitle}>Datos protegidos</span>
            <p className={styles.lineDesc}>
              Tu informacion solo se comparte con el asesor que te invito.
            </p>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.lineIcon}>
            <IconClock />
          </span>
          <div>
            <span className={styles.lineTitle}>24 horas</span>
            <p className={styles.lineDesc}>
              Tiempo promedio para tener el resultado de la investigacion.
            </p>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.lineIcon}>
            <IconCheck />
          </span>
          <div>
            <span className={styles.lineTitle}>Datos reutilizables</span>
            <p className={styles.lineDesc}>
              Si aplicas a otra propiedad, reusas tu informacion sin volver a empezar.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <span className={styles.placeholderLabel}>Tus investigaciones</span>
        <p className={styles.placeholderDesc}>
          Aun no tienes investigaciones activas. Cuando recibas el link de un asesor lo veras aqui.
        </p>
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
          Cerrar sesion
        </Button>
      </div>
    </div>
  );
}
