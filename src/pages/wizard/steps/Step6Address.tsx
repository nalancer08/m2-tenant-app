import { Field } from '../../../components/primitives/Field';
import { PhoneField } from '../../../components/primitives/PhoneField';
import { YearsMonthsField } from '../../../components/primitives/YearsMonthsField';
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
        <YearsMonthsField
          label="¿Hace cuánto vives aquí?"
          value={state.time_at_address_months}
          onChange={(months) => set({ time_at_address_months: months })}
          hint="Señal de estabilidad para la investigación."
        />
      </div>

      {state.living_situation === 'rentado' ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Tu arrendador actual (opcional)</span>
          <p className={styles.sectionIntro}>
            Si nos compartes su contacto, es la referencia más valiosa que
            tenemos — le hablamos para confirmar que pagas a tiempo. Si
            prefieres no compartirlo, déjalo en blanco.
          </p>
          <Field
            label="Nombre del arrendador"
            placeholder="Carlos López"
            value={state.current_landlord_name}
            onChange={(e) => set({ current_landlord_name: e.currentTarget.value })}
          />
          <PhoneField
            label="Teléfono"
            value={state.current_landlord_phone}
            onChange={(phone) => set({ current_landlord_phone: phone })}
          />
        </div>
      ) : null}
    </div>
  );
}
