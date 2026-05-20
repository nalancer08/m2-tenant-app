import { Field } from '../../../components/primitives/Field';
import { CIVIL_STATUS_OPTIONS, EDUCATION_OPTIONS } from '../catalogs';
import type { Action, WizardState } from '../state';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 5 — Historial. Education, civil status, dependents, lifestyle
 * (pets + smoker), and two self-attestations under penalty of fraud.
 */
export function Step5History({ state, dispatch }: StepProps) {
  const set = (patch: Partial<WizardState>) => dispatch({ type: 'SET', patch });

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Información de contexto que ayuda al arrendador a tomar decisión.
      </p>

      <label className={styles.selectField}>
        <span className={styles.selectLabel}>Escolaridad</span>
        <select
          className={styles.select}
          value={state.education_level ?? ''}
          onChange={(e) =>
            set({ education_level: (e.currentTarget.value || null) as WizardState['education_level'] })
          }
        >
          <option value="" disabled>
            Selecciona…
          </option>
          {EDUCATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.selectField}>
        <span className={styles.selectLabel}>Estado civil</span>
        <select
          className={styles.select}
          value={state.civil_status ?? ''}
          onChange={(e) =>
            set({ civil_status: (e.currentTarget.value || null) as WizardState['civil_status'] })
          }
        >
          <option value="" disabled>
            Selecciona…
          </option>
          {CIVIL_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <Field
        label="Hijos menores de 25 años a tu cargo"
        type="number"
        inputMode="numeric"
        placeholder="0"
        value={state.minor_children_count?.toString() ?? ''}
        onChange={(e) => {
          const n = e.currentTarget.value === '' ? null : Number(e.currentTarget.value);
          set({ minor_children_count: Number.isFinite(n) && n !== null ? n : null });
        }}
        hint="Solo dependientes económicos directos. Si no tienes, déjalo en 0."
      />

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Estilo de vida</span>

        <ToggleRow
          title="Tengo mascotas"
          description="Muchos arrendadores lo preguntan antes de aceptar"
          checked={state.has_pets}
          onChange={(v) => set({ has_pets: v })}
        />

        {state.has_pets ? (
          <Field
            label="Cuéntanos de tu(s) mascota(s)"
            placeholder="1 perro raza Bulldog Francés, 5kg, vacunado"
            value={state.pets_detail}
            onChange={(e) => set({ pets_detail: e.currentTarget.value })}
          />
        ) : null}

        <ToggleRow
          title="Fumo"
          description="Opcional pero ayuda a evitar conflictos con el arrendador"
          checked={state.is_smoker}
          onChange={(v) => set({ is_smoker: v })}
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Declaraciones</span>
        <p className={styles.sectionIntro}>
          Estas preguntas se hacen bajo pena de falsedad de declaración. Si tu
          respuesta cambia el resultado, prefiérelo a esconderlo — tu honestidad
          influye más positivamente que un antecedente menor.
        </p>

        <ConsentRow
          title="No he sido desalojado de una propiedad en los últimos 5 años"
          description="Marca esta casilla si es verdad. Si has sido desalojado, déjala sin marcar y nosotros nos comunicaremos contigo."
          checked={state.prior_eviction_disclosed}
          onChange={(v) => set({ prior_eviction_disclosed: v })}
        />

        <ConsentRow
          title="No tengo procedimientos legales abiertos relacionados a arrendamiento o cumplimiento crediticio"
          description="Si tienes alguno, déjala sin marcar."
          checked={state.prior_legal_issues_disclosed}
          onChange={(v) => set({ prior_legal_issues_disclosed: v })}
        />
      </div>
    </div>
  );
}

interface ToggleRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <span className={styles.toggleTitle}>{title}</span>
        {description ? <span className={styles.toggleDesc}>{description}</span> : null}
      </div>
      <button
        type="button"
        className={`${styles.toggle} ${checked ? styles.toggle_on : ''}`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

interface ConsentRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function ConsentRow({ title, description, checked, onChange }: ConsentRowProps) {
  return (
    <label className={`${styles.consentRow} ${checked ? styles.consentRow_checked : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
      <span className={styles.consentBox} aria-hidden>
        {checked ? '✓' : null}
      </span>
      <span className={styles.consentText}>
        <span className={styles.consentTitle}>{title}</span>
        {description ? <span className={styles.consentDesc}>{description}</span> : null}
      </span>
    </label>
  );
}
