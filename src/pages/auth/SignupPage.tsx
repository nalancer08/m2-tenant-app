import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Logo } from '../../components/primitives/Logo';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { IconArrowRight } from '../../components/icons';
import { authApi } from '../../api/auth';
import { useAuth } from '../../auth/AuthProvider';
import styles from './AuthPage.module.css';

const schema = z.object({
  first_name: z.string().min(1, 'Requerido'),
  apellido_paterno: z.string().min(1, 'Requerido'),
  apellido_materno: z.string().optional(),
  email: z.string().email('Correo invalido'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Minimo 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const linkToken = params.get('link_token') || undefined;
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const r = await authApi.tenantSignup({
        ...values,
        apellido_materno: values.apellido_materno || undefined,
        phone: values.phone || undefined,
        link_token: linkToken,
      });
      await setSession(r.access_token);
      navigate('/', { replace: true });
    } catch (err) {
      const ax = err as AxiosError<{ message?: string }>;
      setServerError(ax.response?.data?.message ?? 'No pudimos crear tu cuenta.');
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Logo size={32} />
      </header>
      <div className={styles.body}>
        <h1 className={styles.title}>Crea tu cuenta</h1>
        <p className={styles.subtitle}>
          Solo necesitamos algunos datos para empezar tu investigacion.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Field
            label="Nombre(s)"
            placeholder="Lucia"
            autoComplete="given-name"
            error={formState.errors.first_name?.message}
            {...register('first_name')}
          />
          <Field
            label="Apellido paterno"
            placeholder="Hernandez"
            autoComplete="family-name"
            error={formState.errors.apellido_paterno?.message}
            {...register('apellido_paterno')}
          />
          <Field
            label="Apellido materno"
            placeholder="Reyes"
            error={formState.errors.apellido_materno?.message}
            {...register('apellido_materno')}
          />
          <Field
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <Field
            label="Telefono"
            type="tel"
            autoComplete="tel"
            placeholder="+52 55 0000 0000"
            {...register('phone')}
          />
          <Field
            label="Contrasena"
            type="password"
            autoComplete="new-password"
            placeholder="Minimo 8 caracteres"
            error={formState.errors.password?.message}
            {...register('password')}
          />
          {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={formState.isSubmitting}
            rightIcon={<IconArrowRight />}
          >
            Crear cuenta
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/auth/login">¿Ya tienes cuenta? Iniciar sesion</Link>
        </div>
      </div>
    </div>
  );
}
