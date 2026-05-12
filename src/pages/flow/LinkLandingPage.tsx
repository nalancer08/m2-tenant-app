import { Link, useParams } from 'react-router';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Logo } from '../../components/primitives/Logo';
import styles from './LinkLandingPage.module.css';

export function LinkLandingPage() {
  const { linkToken = '' } = useParams<{ linkToken: string }>();
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Logo size={30} />
      </header>
      <div className={styles.body}>
        <h1 className={styles.title}>Empieza tu investigacion</h1>
        <p className={styles.subtitle}>
          Un asesor te invito a iniciar una investigacion para una propiedad. Crea una cuenta para guardar tu progreso o inicia sesion si ya tienes una con M2.
        </p>

        <Card>
          <span className={styles.label}>Folio del link</span>
          <span className={styles.token}>{linkToken}</span>
          <p className={styles.note}>
            En la siguiente fase aqui mostraremos los datos de la propiedad, el asesor y el costo. Por ahora puedes continuar al alta de cuenta.
          </p>
        </Card>

        <div className={styles.actions}>
          <Link to={`/auth/signup?link_token=${encodeURIComponent(linkToken)}`} style={{ display: 'block' }}>
            <Button fullWidth size="lg">Crear cuenta y continuar</Button>
          </Link>
          <Link to={`/auth/login?link_token=${encodeURIComponent(linkToken)}`} style={{ display: 'block' }}>
            <Button fullWidth size="lg" variant="ghost">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
