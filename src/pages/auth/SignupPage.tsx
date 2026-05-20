import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '../../components/primitives/Logo';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { IconArrowLeft, IconArrowRight, IconLock, IconMail } from '../../components/icons';
import { LegalDocCard } from '../../components/legal/LegalDocCard';
import { authApi, type TenantSignupConsent } from '../../api/auth';
import { legalApi, type LegalDocumentType } from '../../api/legal';
import { useAuth } from '../../auth/AuthProvider';
import styles from './AuthPage.module.css';

const schema = z
  .object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    accept_privacy: z.literal(true, { message: 'Debes aceptar el Aviso de Privacidad' }),
    accept_data: z.literal(true, { message: 'Debes aceptar el Tratamiento de Datos Sensibles' }),
    accept_terms: z.literal(true, { message: 'Debes aceptar los Términos y Condiciones' }),
  })
  .strict();

type FormValues = z.infer<typeof schema>;

const TEASERS: Record<LegalDocumentType, string> = {
  privacy_notice:
    'Cómo recabamos, usamos y protegemos tu información personal a lo largo de la investigación.',
  data_processing:
    'Consentimiento expreso para tratar tus datos sensibles (RFC, comprobantes, buró) — independiente del aviso general.',
  terms_conditions:
    'Reglas del servicio: cuenta, investigación, pago, alcance de la plataforma.',
};

const ORDERED_TYPES: LegalDocumentType[] = [
  'privacy_notice',
  'data_processing',
  'terms_conditions',
];

/**
 * Build the consent_metadata payload from the current browser state. Best-
 * effort: any field can fail silently in older browsers. The result is sent
 * to the server alongside the consent records as extra audit evidence + an
 * anti-fraud signal (same device fingerprint for "three different humans"
 * would raise an alarm later).
 */
function collectConsentMetadata(): Record<string, unknown> {
  try {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages ?? undefined,
      platform: navigator.platform,
      user_agent: navigator.userAgent,
      screen: {
        width: window.screen?.width,
        height: window.screen?.height,
        pixel_ratio: window.devicePixelRatio,
      },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      now_iso: new Date().toISOString(),
    };
  } catch {
    return {};
  }
}

export function SignupPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const linkToken = params.get('link_token') || '';
  const [serverError, setServerError] = useState<string | null>(null);

  const legalQ = useQuery({
    queryKey: ['legal', 'current'],
    queryFn: () => legalApi.current(),
    staleTime: 5 * 60_000,
  });

  const { register, handleSubmit, formState, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      // checkboxes start unchecked — z.literal(true) requires true at submit
      accept_privacy: undefined as unknown as true,
      accept_data: undefined as unknown as true,
      accept_terms: undefined as unknown as true,
    },
    mode: 'onChange',
  });

  const acceptPrivacy = watch('accept_privacy');
  const acceptData = watch('accept_data');
  const acceptTerms = watch('accept_terms');

  if (!linkToken) {
    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <Logo size={32} />
          <span className={styles.headerBrand}>Metro Cuadrado</span>
        </header>
        <div className={styles.body}>
          <h1 className={styles.title}>Necesitas una invitación</h1>
          <p className={styles.subtitle}>
            Los inquilinos se registran a través de la liga que les comparte
            su asesor. Pídele a tu asesor que te envíe el enlace de invitación.
          </p>
        </div>
      </div>
    );
  }

  const docs = legalQ.data;
  const isLoadingDocs = legalQ.isLoading;

  const onSubmit = async (values: FormValues) => {
    if (!docs) return;
    setServerError(null);

    const consents: TenantSignupConsent[] = ORDERED_TYPES.map((t) => ({
      document_type: t,
      version: docs[t].version,
      hash: docs[t].hash,
    }));

    try {
      const r = await authApi.tenantSignup({
        email: values.email.trim(),
        password: values.password,
        link_token: linkToken,
        consents,
        consent_metadata: collectConsentMetadata(),
      });
      await setSession(r.access_token);
      navigate('/', { replace: true });
    } catch (err) {
      const ax = err as AxiosError<{ message?: string | string[] }>;
      const msg = ax.response?.data?.message;
      setServerError(
        Array.isArray(msg) ? msg.join(' · ') : msg ?? 'No pudimos crear tu cuenta.',
      );
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link to={`/${encodeURIComponent(linkToken)}`} className={styles.backLink}>
          <IconArrowLeft width={14} height={14} /> Volver
        </Link>
        <div className={styles.headerBrand}>
          <Logo size={26} />
          <span className={styles.headerBrandName}>Metro Cuadrado</span>
        </div>
      </header>

      <div className={styles.body}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden /> Paso previo
        </span>
        <h1 className={styles.title}>
          Crea tu <em>cuenta</em>
        </h1>
        <p className={styles.subtitle}>
          Necesitamos un correo, una contraseña y tu aceptación de tres documentos
          antes de empezar. Solo se pide la primera vez.
        </p>

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
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            leftIcon={<IconLock />}
            error={formState.errors.password?.message}
            {...register('password')}
          />

          <div className={styles.consentSection}>
            <span className={styles.consentLabel}>Políticas y consentimientos</span>
            <p className={styles.consentIntro}>
              Tienes que aceptar los tres para crear tu cuenta. Puedes leer el
              texto completo de cada uno tocando "Leer texto completo".
            </p>

            {isLoadingDocs ? (
              <p className={styles.loadingDocs}>Cargando documentos…</p>
            ) : !docs ? (
              <p className={styles.serverError}>
                No pudimos cargar los documentos legales. Recarga la página.
              </p>
            ) : (
              <div className={styles.consentList}>
                <LegalDocCard
                  title={docs.privacy_notice.title}
                  teaser={TEASERS.privacy_notice}
                  content={docs.privacy_notice.content}
                  version={docs.privacy_notice.version}
                  checked={!!acceptPrivacy}
                  onCheckedChange={(v) =>
                    setValue('accept_privacy', v as true, { shouldValidate: true })
                  }
                />
                <LegalDocCard
                  title={docs.data_processing.title}
                  teaser={TEASERS.data_processing}
                  content={docs.data_processing.content}
                  version={docs.data_processing.version}
                  checked={!!acceptData}
                  onCheckedChange={(v) =>
                    setValue('accept_data', v as true, { shouldValidate: true })
                  }
                />
                <LegalDocCard
                  title={docs.terms_conditions.title}
                  teaser={TEASERS.terms_conditions}
                  content={docs.terms_conditions.content}
                  version={docs.terms_conditions.version}
                  checked={!!acceptTerms}
                  onCheckedChange={(v) =>
                    setValue('accept_terms', v as true, { shouldValidate: true })
                  }
                />
              </div>
            )}
          </div>

          {serverError ? <div className={styles.serverError}>{serverError}</div> : null}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={formState.isSubmitting}
            disabled={
              !docs ||
              !acceptPrivacy ||
              !acceptData ||
              !acceptTerms ||
              formState.isSubmitting
            }
            rightIcon={<IconArrowRight />}
          >
            Crear cuenta y continuar
          </Button>

          <p className={styles.consentFootnote}>
            Al continuar, registramos tu aceptación con fecha, navegador, IP y la
            versión exacta de cada documento que viste. Esta evidencia se conserva
            como respaldo legal del consentimiento otorgado.
          </p>
        </form>

        <div className={styles.footer}>
          <Link to={`/auth/login?link_token=${encodeURIComponent(linkToken)}`}>
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
