import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Logo } from '../../components/primitives/Logo';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { IconArrowRight, IconLock, IconMail } from '../../components/icons';
import { authApi } from '../../api/auth';
import { useAuth } from '../../auth/AuthProvider';
import styles from './AuthPage.module.css';

const schema = z.object({
  email: z.string().email('Correo invalido'),
  password: z.string().min(1, 'Contrasena requerida'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      setServerError(ax.response?.data?.message ?? 'No pudimos iniciar sesion.');
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Logo size={32} />
      </header>
      <div className={styles.body}>
        <h1 className={styles.title}>Hola, otra vez</h1>
        <p className={styles.subtitle}>Continua tu investigacion donde la dejaste.</p>

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
            label="Contrasena"
            type="password"
            autoComplete="current-password"
            placeholder="•••••••"
            leftIcon={<IconLock />}
            error={formState.errors.password?.message}
            {...register('password')}
          />
          {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
          <Button type="submit" size="lg" fullWidth loading={formState.isSubmitting} rightIcon={<IconArrowRight />}>
            Iniciar sesion
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/auth/signup">¿Eres nuevo? Crear cuenta</Link>
        </div>
      </div>
    </div>
  );
}
