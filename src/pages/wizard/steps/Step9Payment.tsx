import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/primitives/Button';
import { IconArrowRight, IconCheck, IconLock, IconShield } from '../../../components/icons';
import { tenantMeApi } from '../../../api/tenant-me';
import { publicDealApi } from '../../../api/public-deal';
import { formatCents } from '../../../lib/format';
import type { Action, WizardState } from '../state';
import styles from './Step.module.css';
import paymentStyles from './Step9Payment.module.css';

interface StepProps {
  state: WizardState;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 9 — Pago. Final stop. Shows the breakdown of what the tenant pays
 * and a single primary CTA that creates a Stripe Checkout Session and
 * redirects to stripe.com (or to the dev-stub success page when the API
 * doesn't have STRIPE_SECRET_KEY set).
 *
 * Unlike steps 1-8, no fields here — just the price + the button. The
 * WizardShell hides its own "Siguiente" footer on this step so the page
 * owns its CTA.
 */
export function Step9Payment({ state }: StepProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the public deal endpoint (no auth required, no profile_type guard)
  // so we can show the line-items + total on this screen with full clarity.
  const dealLinkToken = state.deal_id; // we stash the deal_id on hydrate;
  // however the public endpoint takes link_token, not id. So load the
  // total from /tenant/me/full via the same query the wizard already uses.
  const fullQ = useQuery({
    queryKey: ['tenant-me-full'],
    queryFn: () => tenantMeApi.full(),
    staleTime: 30_000,
  });

  // First non-cancelled deal (one tenant = one active deal today).
  const deal = fullQ.data?.deals.find((d) => d.status !== 'cancelled') ?? null;
  const linkToken = deal?.link_token;

  const publicQ = useQuery({
    queryKey: ['public-deal-paystep', linkToken],
    queryFn: () => publicDealApi.get(linkToken!),
    enabled: !!linkToken,
    staleTime: 30_000,
  });

  const lineItems = publicQ.data?.line_items ?? [];
  const totalCents = publicQ.data?.total_cents ?? 0;
  const currency = publicQ.data?.deal.currency ?? 'MXN';

  // Mark this state as referenced so eslint doesn't flag the prop; the
  // component is intentionally read-only of the wizard state besides
  // deal_id which we use to gate the API call.
  void dealLinkToken;

  const onPay = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const r = await tenantMeApi.createCheckoutSession();
      // Direct browser navigation: Stripe Checkout is its own origin, so
      // we hand the user over completely. They come back via success_url
      // (configured server-side).
      window.location.href = r.url;
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'No pudimos iniciar el pago.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Último paso. Procesamos tu pago con Stripe (la misma plataforma que usan
        Apple, Google y miles de empresas) y empezamos tu investigación.
      </p>

      <div className={paymentStyles.summaryCard}>
        <span className={styles.sectionLabel}>Resumen del pago</span>
        {publicQ.isLoading ? (
          <p className={paymentStyles.loading}>Cargando…</p>
        ) : lineItems.length === 0 ? (
          <p className={paymentStyles.loading}>Sin productos por cobrar.</p>
        ) : (
          <>
            <ul className={paymentStyles.lineList}>
              {lineItems.map((li) => (
                <li key={li.id} className={paymentStyles.lineRow}>
                  <div className={paymentStyles.lineLabel}>
                    <span className={paymentStyles.lineName}>
                      {li.product?.name ?? 'Producto'}
                    </span>
                    {li.product?.description ? (
                      <span className={paymentStyles.lineDesc}>{li.product.description}</span>
                    ) : null}
                  </div>
                  <span className={paymentStyles.linePrice}>
                    {formatCents(li.subtotal_cents, li.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className={paymentStyles.totalRow}>
              <span className={paymentStyles.totalLabel}>Total a pagar</span>
              <span className={paymentStyles.totalValue}>
                {formatCents(totalCents, currency)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className={paymentStyles.trustList}>
        <div className={paymentStyles.trustRow}>
          <span className={paymentStyles.trustIcon}><IconLock /></span>
          <div>
            <span className={paymentStyles.trustTitle}>Pago seguro</span>
            <span className={paymentStyles.trustDesc}>
              Stripe procesa tu tarjeta. Metro Cuadrado no ve ni guarda tus datos de pago.
            </span>
          </div>
        </div>
        <div className={paymentStyles.trustRow}>
          <span className={paymentStyles.trustIcon}><IconShield /></span>
          <div>
            <span className={paymentStyles.trustTitle}>Tu investigación arranca al instante</span>
            <span className={paymentStyles.trustDesc}>
              Al confirmarse el cargo, comenzamos las validaciones. Te avisamos por correo cuando esté lista.
            </span>
          </div>
        </div>
        <div className={paymentStyles.trustRow}>
          <span className={paymentStyles.trustIcon}><IconCheck /></span>
          <div>
            <span className={paymentStyles.trustTitle}>Sin cargos ocultos</span>
            <span className={paymentStyles.trustDesc}>
              Lo que ves arriba es lo que pagas. Una sola transacción.
            </span>
          </div>
        </div>
      </div>

      {error ? <div className={paymentStyles.error}>{error}</div> : null}

      <Button
        fullWidth
        size="lg"
        loading={submitting}
        disabled={submitting || totalCents === 0}
        rightIcon={<IconArrowRight />}
        onClick={onPay}
      >
        Pagar {totalCents > 0 ? formatCents(totalCents, currency) : ''} con Stripe
      </Button>

      <p className={paymentStyles.footnote}>
        Al continuar te llevamos al portal seguro de Stripe. Cuando termines, regresas
        automáticamente a Metro Cuadrado.
      </p>
    </div>
  );
}
