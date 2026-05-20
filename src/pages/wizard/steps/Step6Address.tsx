import { Field } from '../../../components/primitives/Field';
import { ChoiceCard } from '../components/ChoiceCard';
import { LIVING_SITUATION_OPTIONS, MEXICO_STATES } from '../catalogs';
import type { Action, WizardState } from '../state';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 6 — Domicilio actual. Living situation + full address + time at
 * address. When living_situation=rentado, the current landlord's contact
 * becomes required — they're the best reference we can ask for.
 */
export function Step6Address({ state, dispatch }: StepProps) {
  const set = (patch: Partial<WizardState>) => dispatch({ type: 'SET', patch });
  const setAddr = (patch: Partial<WizardState['address']>) =>
    set({ address: { ...state.address, ...patch } });

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Donde vives hoy. La antigüedad y el contacto de tu arrendador actual son
        señales importantes para la investigación.
      </p>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Tu situación actual</span>
        <div className={styles.choices}>
          {LIVING_SITUATION_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={state.living_situation === opt.value}
              onSelect={() => set({ living_situation: opt.value })}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Dirección</span>

        <Field
          label="Calle y número"
          placeholder="Av. Tamaulipas 120"
          value={state.address.street}
          onChange={(e) => setAddr({ street: e.currentTarget.value })}
        />
        <Field
          label="Número interior (opcional)"
          placeholder="4B"
          value={state.address.interior_number}
          onChange={(e) => setAddr({ interior_number: e.currentTarget.value })}
        />
        <Field
          label="Colonia"
          placeholder="Condesa"
          value={state.address.neighborhood}
          onChange={(e) => setAddr({ neighborhood: e.currentTarget.value })}
        />
        <Field
          label="Delegación o municipio"
          placeholder="Cuauhtémoc"
          value={state.address.municipality}
          onChange={(e) => setAddr({ municipality: e.currentTarget.value })}
        />
        <Field
          label="Código postal"
          placeholder="06140"
          inputMode="numeric"
          value={state.address.postal_code}
          onChange={(e) => setAddr({ postal_code: e.currentTarget.value })}
        />
        <Field
          label="Ciudad"
          placeholder="Ciudad de México"
          value={state.address.city}
          onChange={(e) => setAddr({ city: e.currentTarget.value })}
        />
        <label className={styles.selectField}>
          <span className={styles.selectLabel}>Estado</span>
          <select
            className={styles.select}
            value={state.address.state}
            onChange={(e) => setAddr({ state: e.currentTarget.value })}
          >
            <option value="" disabled>
              Selecciona un estado
            </option>
            {MEXICO_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Antigüedad</span>
        <Field
          label="¿Hace cuántos meses vives aquí?"
          type="number"
          inputMode="numeric"
          placeholder="24"
          value={state.time_at_address_months?.toString() ?? ''}
          onChange={(e) => {
            const v = e.currentTarget.value === '' ? null : Number(e.currentTarget.value);
            set({ time_at_address_months: Number.isFinite(v) && v !== null ? v : null });
          }}
          hint="Señal de estabilidad. Si tienes ~2 años aquí, escribe 24."
        />
      </div>

      {state.living_situation === 'rentado' ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Tu arrendador actual</span>
          <p className={styles.sectionIntro}>
            Es la referencia más valiosa que tenemos. Le hablamos para confirmar
            que pagas a tiempo. <strong>No es opcional.</strong>
          </p>
          <Field
            label="Nombre completo del arrendador"
            placeholder="Carlos López"
            value={state.current_landlord_name}
            onChange={(e) => set({ current_landlord_name: e.currentTarget.value })}
          />
          <Field
            label="Teléfono (con lada)"
            placeholder="+52 55 1234 5678"
            inputMode="tel"
            value={state.current_landlord_phone}
            onChange={(e) => set({ current_landlord_phone: e.currentTarget.value })}
          />
        </div>
      ) : null}
    </div>
  );
}
