import { Field } from '../../../components/primitives/Field';
import { MoneyField } from '../../../components/primitives/MoneyField';
import { PhoneField } from '../../../components/primitives/PhoneField';
import { YearsMonthsField } from '../../../components/primitives/YearsMonthsField';
import { ChoiceCard } from '../components/ChoiceCard';
import {
  EMPLOYMENT_STATUS_OPTIONS,
  INCOME_SOURCE_OPTIONS,
  INDUSTRY_OPTIONS,
} from '../catalogs';
import type { Action, WizardState } from '../state';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 7 — Trabajo + ingresos + autorización del Buró de Crédito. Last
 * step before documents (T9.4) + payment (T9.5).
 *
 * The buró consent is a stand-alone explicit checkbox — accepting it
 * stamps timestamp + IP + UA server-side (see TenantMeService).
 */
export function Step7Employment({ state, dispatch }: StepProps) {
  const set = (patch: Partial<WizardState>) => dispatch({ type: 'SET', patch });

  const showWorkFields =
    state.employment_status === 'empleado' ||
    state.employment_status === 'dueno_negocio' ||
    state.employment_status === 'independiente';

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Tu situación laboral y tus ingresos. La capacidad de pago es lo que más
        peso tiene en la evaluación.
      </p>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Situación laboral</span>
        <div className={styles.choices}>
          {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              selected={state.employment_status === opt.value}
              onSelect={() => set({ employment_status: opt.value })}
            />
          ))}
        </div>
      </div>

      {showWorkFields ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Tu trabajo</span>
          <label className={styles.selectField}>
            <span className={styles.selectLabel}>Industria</span>
            <select
              className={styles.select}
              value={state.industry}
              onChange={(e) => set({ industry: e.currentTarget.value })}
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {INDUSTRY_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Empresa"
            placeholder="Acme S.A. de C.V."
            value={state.company_name}
            onChange={(e) => set({ company_name: e.currentTarget.value })}
          />
          <Field
            label="Puesto / ocupación"
            placeholder="Software Engineer"
            value={state.position}
            onChange={(e) =>
              set({
                position: e.currentTarget.value,
                // Mantenemos ambos campos sincronizados — el backend tiene
                // dos columnas históricas (position / occupation). Para el
                // usuario es un solo concepto.
                occupation: e.currentTarget.value,
              })
            }
          />
          <Field
            label="Página web (opcional)"
            placeholder="https://acme.com"
            value={state.company_website}
            onChange={(e) => set({ company_website: e.currentTarget.value })}
          />
          <Field
            label="Dirección del trabajo (opcional)"
            placeholder="Av. Insurgentes Sur 1234, CDMX"
            value={state.work_address}
            onChange={(e) => set({ work_address: e.currentTarget.value })}
          />
          <YearsMonthsField
            label="Antigüedad en este empleo"
            value={state.tenure_months}
            onChange={(months) => set({ tenure_months: months })}
            hint="Señal de estabilidad para la investigación."
          />
        </div>
      ) : null}

      {showWorkFields ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>
            Contacto laboral (opcional)
          </span>
          <p className={styles.sectionIntro}>
            Si nos compartes a tu jefe directo o RH, le hablamos para
            verificar tu empleo. Si prefieres no compartirlo, déjalo en
            blanco — lo confirmamos con tus comprobantes.
          </p>
          <Field
            label="Nombre"
            placeholder="Marcela Trejo"
            value={state.hr_contact_name}
            onChange={(e) => set({ hr_contact_name: e.currentTarget.value })}
          />
          <PhoneField
            label="Teléfono"
            value={state.hr_phone}
            onChange={(phone) => set({ hr_phone: phone })}
          />
        </div>
      ) : null}

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Ingresos</span>
        <label className={styles.selectField}>
          <span className={styles.selectLabel}>Fuente principal</span>
          <select
            className={styles.select}
            value={state.income_source ?? ''}
            onChange={(e) =>
              set({ income_source: (e.currentTarget.value || null) as WizardState['income_source'] })
            }
          >
            <option value="" disabled>
              Selecciona…
            </option>
            {INCOME_SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {state.income_source === 'otro' ? (
          <Field
            label="Especifica"
            placeholder="Renta de bodegas industriales, etc."
            value={state.income_source_other}
            onChange={(e) => set({ income_source_other: e.currentTarget.value })}
          />
        ) : null}

        <MoneyField
          label="Ingreso neto mensual"
          value={state.monthly_net_income_cents}
          onChange={(cents) => set({ monthly_net_income_cents: cents })}
          hint="Después de impuestos. Los centavos se asumen 0."
          placeholder="45,000"
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Buró de Crédito</span>
        <label
          className={`${styles.consentRow} ${state.buro_consent ? styles.consentRow_checked : ''}`}
        >
          <input
            type="checkbox"
            checked={state.buro_consent}
            onChange={(e) => set({ buro_consent: e.currentTarget.checked })}
          />
          <span className={styles.consentBox} aria-hidden>
            {state.buro_consent ? '✓' : null}
          </span>
          <span className={styles.consentText}>
            <span className={styles.consentTitle}>
              Autorizo a Metro Cuadrado a consultar mi historial crediticio
            </span>
            <span className={styles.consentDesc}>
              Autorizo expresamente a Metro Cuadrado México, S.A.P.I. de C.V. para que
              lleve a cabo investigaciones sobre mi comportamiento crediticio en las
              Sociedades de Información Crediticia (SIC) que estime convenientes.
              Conozco la naturaleza y el alcance de la información que se solicitará
              y declaro que esta autorización tiene vigencia de un año.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
