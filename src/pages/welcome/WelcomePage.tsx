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
 * Post-signup landing. Two states:
 *   1. Wizard not yet completed → redirect into /wizard.
 *   2. Wizard completed → show "tu investigación está en proceso"
 *      placeholder. Status detail + verdict UI lives in T9.6.
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
    // Si aún no termina → entra al wizard.
    // Si ya terminó → entra a la vista read-only de su perfil. Welcome
    // funciona solo como gate: no debe quedarse aquí ningún usuario.
    if (!fullQ.data.tenant.wizard_completed) {
      navigate('/wizard', { replace: true });
    } else {
      navigate('/mi-informacion', { replace: true });
    }
  }, [fullQ.data, navigate]);

  const completed = !!fullQ.data?.tenant.wizard_completed;
  const deal = fullQ.data?.deals.find((d) => d.status !== 'cancelled') ?? null;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          {completed ? 'Investigación en proceso' : 'Cuenta creada'}
        </span>
        <h1 className={styles.title}>
          {completed ? (
            <>
              Tu investigación está <em>en curso</em>
            </>
          ) : (
            <>
              ¡Bienvenido a <em>Metro Cuadrado</em>!
            </>
          )}
        </h1>
        <p className={styles.subtitle}>
          {completed ? (
            <>
              Recibimos tu información{deal ? ` para el folio ${deal.folio}` : ''}.
              Te avisaremos por correo cuando esté listo el resultado.
            </>
          ) : (
            <>
              Tu cuenta está lista{email ? ` (${email})` : ''}. En seguida arrancamos la
              captura de información para tu investigación.
            </>
          )}
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

      {!completed ? (
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
      ) : (
        <Card>
          <span className={styles.placeholderLabel}>Tu perfil</span>
          <p className={styles.placeholderDesc}>
            Ya nos compartiste toda tu información. Aquí abajo puedes revisarla
            cuando quieras. Si encuentras algo que corregir, escríbele a tu
            asesor para que pueda destrabarte el paso.
          </p>
          <Button
            fullWidth
            rightIcon={<IconArrowRight />}
            onClick={() => navigate('/mi-informacion')}
          >
            Revisar mi información
          </Button>
        </Card>
      )}

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
