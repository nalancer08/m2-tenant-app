import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Logo } from '../../components/primitives/Logo';
import { IconCheck, IconClock, IconShield } from '../../components/icons';
import { publicDealApi } from '../../api/public-deal';
import { formatCents, formatPropertyAddress } from '../../lib/format';
import styles from './LinkLandingPage.module.css';

export function LinkLandingPage() {
  const { linkToken = '' } = useParams<{ linkToken: string }>();
  const q = useQuery({
    queryKey: ['public-deal', linkToken],
    queryFn: () => publicDealApi.get(linkToken),
    retry: false,
  });

  if (q.isLoading) {
    return (
      <div className={styles.root}>
        <header className={styles.header}><Logo size={30} /></header>
        <div className={styles.body}>
          <p className={styles.subtitle}>Cargando tu invitacion...</p>
        </div>
      </div>
    );
  }

  if (q.error || !q.data) {
    return (
      <div className={styles.root}>
        <header className={styles.header}><Logo size={30} /></header>
        <div className={styles.body}>
          <h1 className={styles.title}>Link no valido</h1>
          <p className={styles.subtitle}>
            Este enlace ya no esta disponible o el asesor lo cancelo. Contacta a tu asesor para que te envie uno nuevo.
          </p>
        </div>
      </div>
    );
  }

  const { property, product, broker, deal } = q.data;
  const brokerName = broker ? `${broker.first_name} ${broker.last_name}` : 'tu asesor';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Logo size={30} />
        <span className={styles.folio}>{deal.folio}</span>
      </header>

      <div className={styles.body}>
        <span className={styles.eyebrow}>Investigacion de arrendamiento</span>
        <h1 className={styles.title}>
          Hola, <em>{brokerName}</em> te invito a M2.
        </h1>
        <p className={styles.subtitle}>
          Completa tu informacion en pocos minutos y obten tu resultado de investigacion en 24 horas.
        </p>

        {property ? (
          <Card>
            <span className={styles.cardLabel}>Propiedad</span>
            <p className={styles.cardMain}>{formatPropertyAddress(property)}</p>
            <p className={styles.cardMeta}>
              {property.city}, {property.state} · {property.postal_code}
            </p>
            <p className={styles.cardPrice}>
              {formatCents(property.rent_amount_cents, property.currency)} / mes
            </p>
          </Card>
        ) : null}

        {product ? (
          <Card>
            <span className={styles.cardLabel}>Lo que incluye</span>
            <p className={styles.cardMain}>{product.name}</p>
            <p className={styles.cardMeta}>{product.description}</p>
            <ul className={styles.includes}>
              {product.includes.map((i) => (
                <li key={i}><IconCheck width={14} height={14} /> {i}</li>
              ))}
            </ul>
            <p className={styles.cardPrice}>
              {formatCents(product.price_cents, product.currency)}
            </p>
          </Card>
        ) : null}

        <Card>
          <div className={styles.trustRow}>
            <span className={styles.trustIcon}><IconShield /></span>
            <span>Tu informacion solo se comparte con {brokerName}.</span>
          </div>
          <div className={styles.trustRow}>
            <span className={styles.trustIcon}><IconClock /></span>
            <span>Resultado promedio en 24 horas.</span>
          </div>
        </Card>

        <div className={styles.actions}>
          <Link to={`/auth/signup?link_token=${encodeURIComponent(linkToken)}`} style={{ display: 'block' }}>
            <Button fullWidth size="lg">Crear cuenta y continuar</Button>
          </Link>
          <Link to={`/auth/login?link_token=${encodeURIComponent(linkToken)}`} style={{ display: 'block' }}>
            <Button fullWidth size="lg" variant="ghost">Ya tengo cuenta</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
