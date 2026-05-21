import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { IconCheck } from '../../components/icons';
import { tenantMeApi } from '../../api/tenant-me';
import type {
  FullTenantResponse,
  TenantAddressRow,
  TenantDocumentRow,
  TenantEmploymentRow,
  TenantReferenceRow,
  TenantRoommateRow,
  TenantRow,
} from '../../api/tenant-me';
import styles from './MyInformationPage.module.css';

type TabKey = 'identidad' | 'domicilio' | 'empleo' | 'referencias' | 'documentos' | 'pago';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'identidad', label: 'Identidad' },
  { key: 'domicilio', label: 'Domicilio' },
  { key: 'empleo', label: 'Empleo' },
  { key: 'referencias', label: 'Referencias' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'pago', label: 'Pago' },
];

const REGIMEN_LABELS: Record<string, string> = {
  fisica: 'Persona física',
  moral: 'Persona moral',
};

const GENDER_LABELS: Record<string, string> = {
  femenino: 'Femenino',
  masculino: 'Masculino',
  no_binario: 'No binario',
  prefiero_no_decir: 'Prefiero no decir',
};

const CIVIL_LABELS: Record<string, string> = {
  soltero: 'Soltero/a',
  casado: 'Casado/a',
  union_libre: 'Unión libre',
  divorciado: 'Divorciado/a',
  viudo: 'Viudo/a',
};

const EDU_LABELS: Record<string, string> = {
  sin_estudios: 'Sin estudios',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  preparatoria: 'Preparatoria',
  tecnica: 'Técnica',
  licenciatura: 'Licenciatura',
  maestria: 'Maestría',
  doctorado: 'Doctorado',
};

const LIVING_LABELS: Record<string, string> = {
  rentado: 'Rentado',
  propio: 'Propio',
  familiar: 'En casa familiar',
  otro: 'Otro',
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  empleado: 'Empleado',
  dueno_negocio: 'Dueño de negocio',
  independiente: 'Independiente',
  jubilado: 'Jubilado',
  desempleado: 'Desempleado',
  estudiante: 'Estudiante',
};

const INCOME_LABELS: Record<string, string> = {
  nomina: 'Nómina',
  mixto: 'Mixto',
  honorarios: 'Honorarios',
  dividendos: 'Dividendos',
  efectivo: 'Efectivo',
  ayuda_familiar: 'Ayuda familiar',
  pension_retiro: 'Pensión / retiro',
  rentas: 'Rentas',
  otro: 'Otro',
};

const DOC_LABELS: Record<string, string> = {
  ine_front: 'INE (frente)',
  ine_back: 'INE (reverso)',
  selfie: 'Selfie',
  passport: 'Pasaporte',
  payslip: 'Comprobante de ingreso',
  bank_statement: 'Estado de cuenta',
  proof_of_address: 'Comprobante de domicilio',
  tax_return: 'Declaración fiscal',
  acta_constitutiva: 'Acta constitutiva',
  poder_notarial: 'Poder notarial',
  constancia_fiscal: 'Constancia fiscal',
  opinion_cumplimiento: 'Opinión de cumplimiento',
  additional: 'Documento adicional',
  other: 'Otro',
};

const DASH = '—';

function fmtMonths(m: number | null | undefined): string {
  if (m === null || m === undefined) return DASH;
  if (m < 12) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(m / 12);
  const rem = m % 12;
  if (rem === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years}a ${rem}m`;
}

function fmtCents(c: string | number | null | undefined): string {
  if (c === null || c === undefined || c === '') return DASH;
  const cents = typeof c === 'string' ? Number(c) : c;
  if (!Number.isFinite(cents)) return DASH;
  const pesos = Math.round(cents / 100);
  return `$${pesos.toLocaleString('es-MX')} MXN`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return DASH;
  // Just YYYY-MM-DD or ISO — render the date part in es-MX.
  const date = new Date(iso.length > 10 ? iso : `${iso}T00:00:00`);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function fmtAddress(a: TenantAddressRow): string {
  const line1 = [a.street, a.exterior_number].filter(Boolean).join(' ');
  const apto = a.interior_number ? ` Int. ${a.interior_number}` : '';
  const locale = [a.neighborhood, a.municipality].filter(Boolean).join(', ');
  const place = `${a.city}, ${a.state} · CP ${a.postal_code}`;
  return [`${line1}${apto}`, locale, place].filter(Boolean).join(' · ');
}

/**
 * Vista read-only del perfil del inquilino una vez que terminó el
 * wizard. Tabs arriba con resumen por sección. No tiene formulario —
 * solo muestra lo que mandó. Si el inquilino encuentra un error, debe
 * pedirle a su asesor que destrabe la edición (proceso futuro).
 */
export function MyInformationPage() {
  const [tab, setTab] = useState<TabKey>('identidad');

  const q = useQuery({
    queryKey: ['tenant-me-full'],
    queryFn: () => tenantMeApi.full(),
    staleTime: 30_000,
  });

  const data = q.data ?? null;
  const completed = !!data?.tenant.wizard_completed;

  // The active deal — used for the payment tab. Multiple deals are
  // theoretically possible but in practice tenants run one at a time.
  const activeDeal = useMemo(() => {
    return data?.deals.find((d) => d.status !== 'cancelled') ?? data?.deals[0] ?? null;
  }, [data]);

  if (q.isLoading) {
    return <div className={styles.loading}>Cargando…</div>;
  }
  if (q.error || !data) {
    return <div className={styles.loading}>No pudimos cargar tu información.</div>;
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <span className={styles.eyebrow}>Mi información</span>
          <h1 className={styles.title}>Tu perfil</h1>
        </div>
      </header>

      {completed ? (
        <div className={styles.statusBanner}>
          <span className={styles.statusDot} aria-hidden />
          <div>
            <span className={styles.statusTitle}>Información enviada · En revisión</span>
            <span className={styles.statusBody}>
              Si encuentras algo que corregir, escríbele a tu asesor para que
              pueda destrabarte el paso.
            </span>
          </div>
        </div>
      ) : null}

      {/* En mobile: tabs arriba (horizontal scroll). En desktop: tabs
          como sidebar vertical a la izquierda. El layout responde por
          CSS — el JSX es el mismo. */}
      <div className={styles.layout}>
        <div className={styles.tabs} role="tablist" aria-label="Secciones">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tab_active : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {tab === 'identidad' ? <IdentidadTab tenant={data.tenant} /> : null}
          {tab === 'domicilio' ? <DomicilioTab address={data.current_address} /> : null}
          {tab === 'empleo' ? <EmpleoTab employment={data.current_employment} /> : null}
          {tab === 'referencias' ? (
            <ReferenciasTab references={data.references} roommates={data.roommates} />
          ) : null}
          {tab === 'documentos' ? <DocumentosTab documents={data.documents} /> : null}
          {tab === 'pago' ? <PagoTab deal={activeDeal} data={data} /> : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Identidad ────────────────────────────────────────────── */

function IdentidadTab({ tenant }: { tenant: TenantRow }) {
  const fullName = [tenant.first_name, tenant.apellido_paterno, tenant.apellido_materno]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <Card>
      <dl className={styles.kv}>
        <KV label="Nombre completo" value={fullName || DASH} />
        <KV
          label="Régimen fiscal"
          value={tenant.regimen_fiscal ? REGIMEN_LABELS[tenant.regimen_fiscal] : DASH}
        />
        <KV label="Fecha de nacimiento" value={fmtDate(tenant.date_of_birth)} />
        <KV
          label="Lugar de nacimiento"
          value={
            [tenant.place_of_birth_state, tenant.place_of_birth_country]
              .filter(Boolean)
              .join(', ') || DASH
          }
        />
        <KV label="Nacionalidad" value={tenant.nationality || DASH} />
        <KV
          label="Género"
          value={tenant.gender ? GENDER_LABELS[tenant.gender] : DASH}
        />
        <KV label="CURP" value={tenant.curp || DASH} mono />
        <KV label="RFC" value={tenant.rfc || DASH} mono />
        {tenant.passport_number ? (
          <KV label="Pasaporte" value={tenant.passport_number} mono />
        ) : null}
        {tenant.ssn_or_foreign_id ? (
          <KV label="ID extranjero" value={tenant.ssn_or_foreign_id} mono />
        ) : null}
        <KV
          label="Estado civil"
          value={tenant.civil_status ? CIVIL_LABELS[tenant.civil_status] : DASH}
        />
        <KV
          label="Escolaridad"
          value={tenant.education_level ? EDU_LABELS[tenant.education_level] : DASH}
        />
        <KV
          label="Hijos dependientes"
          value={String(tenant.minor_children_count ?? 0)}
        />
      </dl>

      <div className={styles.flagsRow}>
        <span className={styles.flag}>
          {tenant.has_pets
            ? `Mascotas${tenant.pets_detail ? `: ${tenant.pets_detail}` : ''}`
            : 'Sin mascotas'}
        </span>
        <span className={styles.flag}>
          {tenant.is_smoker ? 'Fumador' : 'No fuma'}
        </span>
        {tenant.prior_eviction_disclosed ? (
          <span className={`${styles.flag} ${styles.flag_warn}`}>
            Desalojo declarado
          </span>
        ) : null}
        {tenant.prior_legal_issues_disclosed ? (
          <span className={`${styles.flag} ${styles.flag_warn}`}>
            Procedimientos legales declarados
          </span>
        ) : null}
      </div>
    </Card>
  );
}

/* ─── Tab: Domicilio ──────────────────────────────────────────── */

function DomicilioTab({ address }: { address: TenantAddressRow | null }) {
  return (
    <Card>
      {!address ? (
        <p className={styles.empty}>Sin domicilio capturado.</p>
      ) : (
        <dl className={styles.kv}>
          <KV label="Dirección" value={fmtAddress(address)} />
          <KV
            label="Tenencia"
            value={address.living_situation ? LIVING_LABELS[address.living_situation] : DASH}
          />
          <KV label="Antigüedad" value={fmtMonths(address.time_at_address_months)} />
          {address.living_situation === 'rentado' &&
          (address.current_landlord_name || address.current_landlord_phone) ? (
            <>
              <KV label="Arrendador" value={address.current_landlord_name || DASH} />
              <KV
                label="Teléfono"
                value={address.current_landlord_phone || DASH}
                mono
              />
            </>
          ) : null}
        </dl>
      )}
    </Card>
  );
}

/* ─── Tab: Empleo ─────────────────────────────────────────────── */

function EmpleoTab({ employment }: { employment: TenantEmploymentRow | null }) {
  return (
    <Card>
      {!employment ? (
        <p className={styles.empty}>Sin información laboral capturada.</p>
      ) : (
        <>
          <dl className={styles.kv}>
            <KV
              label="Situación laboral"
              value={
                employment.employment_status
                  ? EMPLOYMENT_LABELS[employment.employment_status]
                  : DASH
              }
            />
            <KV label="Empresa" value={employment.company_name || DASH} />
            <KV
              label="Puesto"
              value={employment.position || employment.occupation || DASH}
            />
            <KV label="Industria" value={employment.industry || DASH} />
            <KV label="Antigüedad" value={fmtMonths(employment.tenure_months)} />
            <KV
              label="Ingreso neto mensual"
              value={fmtCents(employment.monthly_net_income_cents)}
              mono
            />
            <KV
              label="Fuente de ingresos"
              value={
                employment.income_source
                  ? INCOME_LABELS[employment.income_source] +
                    (employment.income_source === 'otro' && employment.income_source_other
                      ? `: ${employment.income_source_other}`
                      : '')
                  : DASH
              }
            />
            {employment.company_website ? (
              <KV label="Web de la empresa" value={employment.company_website} />
            ) : null}
            {employment.work_address ? (
              <KV label="Dirección del trabajo" value={employment.work_address} />
            ) : null}
            {employment.hr_contact_name || employment.hr_phone ? (
              <>
                <KV label="Contacto RH" value={employment.hr_contact_name || DASH} />
                <KV label="Teléfono RH" value={employment.hr_phone || DASH} mono />
              </>
            ) : null}
          </dl>

          <div
            className={`${styles.buroPanel} ${employment.buro_consent ? styles.buroPanel_given : ''}`}
          >
            <span className={styles.buroPanelLabel}>Consulta Buró de Crédito</span>
            <span className={styles.buroPanelBody}>
              {employment.buro_consent
                ? `Autorizada ${fmtDate(employment.buro_consent_at)}`
                : 'No autorizada'}
            </span>
          </div>
        </>
      )}
    </Card>
  );
}

/* ─── Tab: Referencias + roomies ──────────────────────────────── */

function ReferenciasTab({
  references,
  roommates,
}: {
  references: TenantReferenceRow[];
  roommates: TenantRoommateRow[];
}) {
  return (
    <>
      <Card>
        <div className={styles.cardHead}>
          <span className={styles.cardLabel}>Referencias</span>
          <span className={styles.cardCount}>{references.length}</span>
        </div>
        {references.length === 0 ? (
          <p className={styles.empty}>Sin referencias capturadas.</p>
        ) : (
          <ul className={styles.list}>
            {references.map((r) => (
              <li key={r.id} className={styles.listRow}>
                <span className={styles.listMain}>
                  <span className={styles.listTitle}>{r.full_name}</span>
                  <span className={styles.listSub}>
                    {r.relation || 'Sin relación especificada'} ·{' '}
                    <span className={styles.mono}>{r.phone}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className={styles.cardHead}>
          <span className={styles.cardLabel}>Roomies</span>
          <span className={styles.cardCount}>{roommates.length}</span>
        </div>
        {roommates.length === 0 ? (
          <p className={styles.empty}>Sin roomies declarados.</p>
        ) : (
          <ul className={styles.list}>
            {roommates.map((r) => (
              <li key={r.id} className={styles.listRow}>
                <span className={styles.listMain}>
                  <span className={styles.listTitle}>{r.full_name}</span>
                  <span className={styles.listSub}>
                    <span className={styles.mono}>{r.phone}</span>
                    {r.invited ? ' · Invitado' : ''}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

/* ─── Tab: Documentos ─────────────────────────────────────────── */

function DocumentosTab({ documents }: { documents: TenantDocumentRow[] }) {
  if (documents.length === 0) {
    return (
      <Card>
        <p className={styles.empty}>Sin documentos cargados.</p>
      </Card>
    );
  }
  return (
    <Card>
      <ul className={styles.list}>
        {documents.map((d) => (
          <li key={d.id} className={styles.listRow}>
            <span className={styles.listMain}>
              <span className={styles.listTitle}>{d.file_name}</span>
              <span className={styles.listSub}>
                {DOC_LABELS[d.type] ?? d.type}
                {d.has_password ? ' · con contraseña' : ''}
              </span>
            </span>
            {d.verified ? (
              <span className={styles.verifiedChip}>
                <IconCheck width={11} height={11} /> Verificado
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─── Tab: Pago ──────────────────────────────────────────────── */

function PagoTab({
  deal,
  data,
}: {
  deal: FullTenantResponse['deals'][number] | null;
  data: FullTenantResponse;
}) {
  // We don't currently fetch the Payment row on /tenant/me/full — use
  // wizard_completed as the signal that payment landed (the webhook
  // flips it). When we add a payments aggregate on the API we'll show
  // amount + method here.
  const paid = data.tenant.wizard_completed;
  return (
    <Card>
      <dl className={styles.kv}>
        <KV label="Folio" value={deal?.folio ?? DASH} mono />
        <KV
          label="Estado del pago"
          value={paid ? 'Pagado' : 'Pendiente'}
        />
      </dl>
      {paid ? (
        <p className={styles.empty} style={{ marginTop: 8 }}>
          El pago se procesó correctamente y la investigación arrancó.
        </p>
      ) : (
        <Button fullWidth onClick={() => (window.location.href = '/wizard')}>
          Ir a pagar
        </Button>
      )}
    </Card>
  );
}

/* ─── Tiny helper component ──────────────────────────────────── */

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt>{label}</dt>
      <dd className={mono ? styles.mono : undefined}>{value}</dd>
    </>
  );
}
