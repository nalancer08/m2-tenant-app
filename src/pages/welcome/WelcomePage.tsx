import { useNavigate } from 'react-router';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { IconArrowRight, IconCheck, IconClock, IconShield } from '../../components/icons';
import { useAuth } from '../../auth/AuthProvider';
import styles from './WelcomePage.module.css';

/**
 * Post-signup landing inside the tenant app. The 9-step wizard hangs off
 * this route in Phase T9.3 — for now we show a friendly "ya estás dentro,
 * el wizard arranca aquí" page so the signup flow has somewhere to land.
 */
export function WelcomePage() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const email = me?.user?.email ?? '';

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
          Tu cuenta está lista{email ? ` (${email})` : ''}. En unos minutos te llevamos
          paso a paso por la información que necesitamos para hacer tu investigación de
          arrendamiento.
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
        <span className={styles.placeholderLabel}>Próximamente</span>
        <p className={styles.placeholderDesc}>
          Aquí va a vivir el wizard de captura: identidad, dirección, empleo,
          referencias, documentos y pago. Llega en la siguiente fase.
        </p>
        <Button fullWidth disabled rightIcon={<IconArrowRight />}>
          Empezar investigación (próximamente)
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
