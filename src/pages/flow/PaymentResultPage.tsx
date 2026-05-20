import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Logo } from '../../components/primitives/Logo';
import { IconArrowRight, IconCheck, IconClock, IconX } from '../../components/icons';
import { tenantMeApi } from '../../api/tenant-me';
import { useAuth } from '../../auth/AuthProvider';
import styles from './PaymentResultPage.module.css';

type Mode = 'success' | 'cancelled';

interface Props {
  mode: Mode;
}

/**
 * Post-Stripe redirect page. Polls /tenant/me/full every 2s for up to ~30s
 * waiting for the webhook to mark wizard_completed=true (in test mode the
 * webhook lands within seconds; in dev-stub mode it's already done before
 * we even arrive). Once we see it, the "Volver a Metro Cuadrado" CTA goes
 * live and the auto-redirect timer kicks in.
 */
export function PaymentResultPage({ mode }: Props) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const { me } = useAuth();

  // Always invalidate full-tenant cache when arriving — webhook may have
  // just landed.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['tenant-me-full'] });
  }, [queryClient]);

  const fullQ = useQuery({
    queryKey: ['tenant-me-full'],
    queryFn: () => tenantMeApi.full(),
    enabled: mode === 'success' && !!me,
    refetchInterval: (q) => {
      const data = q.state.data;
      if (data?.tenant?.wizard_completed) return false;
      return 2000;
    },
  });

  const completed = !!fullQ.data?.tenant?.wizard_completed;
  const isStub = params.get('stub') === '1';
  const alreadyPaid = params.get('already_paid') === '1';

  // Auto-redirect once the webhook landed (3s delay so the user sees the
  // success state).
  useEffect(() => {
    if (mode !== 'success' || !completed) return;
    const t = setTimeout(() => navigate('/', { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [mode, completed, navigate]);

  if (mode === 'cancelled') {
    return (
      <div className={styles.root}>
        <Header />
        <div className={styles.body}>
          <span className={`${styles.iconWrap} ${styles.iconWrap_warn}`}>
            <IconX width={36} height={36} />
          </span>
          <h1 className={styles.title}>Pago cancelado</h1>
          <p className={styles.subtitle}>
            No pasa nada — tu información ya está guardada. Puedes intentar pagar
            de nuevo cuando estés listo.
          </p>
          <Card>
            <p className={styles.cardCopy}>
              Si tu tarjeta fue rechazada, prueba con otra o contacta a tu banco.
              Nada se cobró todavía.
            </p>
          </Card>
          <Link to="/wizard" style={{ display: 'block' }}>
            <Button fullWidth size="lg" rightIcon={<IconArrowRight />}>
              Reintentar el pago
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success path
  return (
    <div className={styles.root}>
      <Header />
      <div className={styles.body}>
        <span className={`${styles.iconWrap} ${completed ? styles.iconWrap_ok : styles.iconWrap_pending}`}>
          {completed ? <IconCheck width={36} height={36} /> : <IconClock width={36} height={36} />}
        </span>
        <h1 className={styles.title}>
          {completed ? '¡Pago confirmado!' : 'Confirmando tu pago…'}
        </h1>
        <p className={styles.subtitle}>
          {completed ? (
            <>
              Tu investigación ya está en curso. Te avisaremos por correo en cuanto
              esté lista (≈ 24 horas).
            </>
          ) : (
            <>Esto toma unos segundos. No cierres esta ventana.</>
          )}
        </p>

        {isStub ? (
          <Card>
            <p className={styles.cardCopy}>
              <strong>Modo desarrollo:</strong> el cargo no se procesó por Stripe (la
              API corre sin keys). En producción aquí verías el detalle de la
              transacción real.
            </p>
          </Card>
        ) : null}

        {alreadyPaid ? (
          <Card>
            <p className={styles.cardCopy}>
              Ya habías pagado esta investigación. Te llevamos a tu cuenta.
            </p>
          </Card>
        ) : null}

        {completed ? (
          <Link to="/" style={{ display: 'block' }}>
            <Button fullWidth size="lg" rightIcon={<IconArrowRight />}>
              Volver a Metro Cuadrado
            </Button>
          </Link>
        ) : (
          <Button fullWidth size="lg" disabled>
            Esperando confirmación…
          </Button>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <Logo size={28} />
        <span className={styles.headerBrandName}>Metro Cuadrado</span>
      </div>
    </header>
  );
}
