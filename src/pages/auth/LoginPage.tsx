import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Logo } from '../../components/primitives/Logo';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { IconArrowLeft, IconArrowRight, IconLock, IconMail } from '../../components/icons';
import { authApi } from '../../api/auth';
import { useAuth } from '../../auth/AuthProvider';
import styles from './AuthPage.module.css';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const linkToken = params.get('link_token') || '';
  const [serverError, setServerError] = useState<string | null>(null);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const r = await authApi.tenantLogin(values);
      await setSession(r.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      const ax = err as AxiosError<{ message?: string }>;
      setServerError(ax.response?.data?.message ?? 'No pudimos iniciar sesión.');
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        {linkToken ? (
          <Link to={`/${encodeURIComponent(linkToken)}`} className={styles.backLink}>
            <IconArrowLeft width={14} height={14} /> Volver
          </Link>
        ) : (
          <span />
        )}
        <div className={styles.headerBrand}>
          <Logo size={26} />
          <span className={styles.headerBrandName}>Metro Cuadrado</span>
        </div>
      </header>
      <div className={styles.body}>
        <h1 className={styles.title}>
          Hola, <em>otra vez</em>
        </h1>
        <p className={styles.subtitle}>Continúa tu investigación donde la dejaste.</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Field
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            leftIcon={<IconMail />}
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <Field
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="•••••••"
            leftIcon={<IconLock />}
            error={formState.errors.password?.message}
            {...register('password')}
          />
          {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
          <Button type="submit" size="lg" fullWidth loading={formState.isSubmitting} rightIcon={<IconArrowRight />}>
            Iniciar sesión
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to={linkToken ? `/auth/signup?link_token=${encodeURIComponent(linkToken)}` : '/auth/signup'}>
            ¿Eres nuevo? Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
