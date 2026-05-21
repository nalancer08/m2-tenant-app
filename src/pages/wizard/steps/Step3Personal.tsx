import { DateField } from '../../../components/primitives/DateField';
import { Field } from '../../../components/primitives/Field';
import { ChoiceCard } from '../components/ChoiceCard';
import { COUNTRIES_COMMON, GENDER_OPTIONS, MEXICO_STATES } from '../catalogs';
import type { Action, WizardState } from '../state';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 3 — Datos personales. Two branches:
 *   1. Mexicano → name, DOB, place_of_birth_state, gender, RFC
 *   2. Extranjero with CURP → CURP (which encodes most of the same data)
 *   3. Extranjero without CURP → passport, nationality, place_of_birth_country
 *
 * Nationality is set from the choice (Mexicana vs free text for others).
 */
export function Step3Personal({ state, dispatch }: StepProps) {
  const set = (patch: Partial<WizardState>) => dispatch({ type: 'SET', patch });

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Necesitamos confirmar tu identidad. Los datos deben coincidir con tu
        identificación oficial.
      </p>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Nacionalidad</span>
        <div className={styles.choices}>
          <ChoiceCard
            label="Soy mexicano(a)"
            description="Tengo CURP y RFC"
            selected={state.nationality_kind === 'mexicana'}
            onSelect={() =>
              set({
                nationality_kind: 'mexicana',
                has_curp: 'si',
                nationality: 'Mexicana',
                place_of_birth_country: 'Mexico',
              })
            }
          />
          <ChoiceCard
            label="Soy extranjero(a)"
            description="No nací en México"
            selected={state.nationality_kind === 'otra'}
            onSelect={() =>
              set({
                nationality_kind: 'otra',
                place_of_birth_state: '',
              })
            }
          />
        </div>
      </div>

      {state.nationality_kind === 'otra' ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>¿Tienes CURP?</span>
          <div className={styles.choices}>
            <ChoiceCard
              label="Sí tengo CURP"
              description="Tu CURP encapsula todos tus datos identitarios"
              selected={state.has_curp === 'si'}
              onSelect={() => set({ has_curp: 'si' })}
            />
            <ChoiceCard
              label="No tengo CURP"
              description="Capturaremos tu pasaporte y número de seguridad social"
              selected={state.has_curp === 'no'}
              onSelect={() => set({ has_curp: 'no' })}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Tus datos</span>

        <Field
          label="Nombre(s)"
          autoComplete="given-name"
          placeholder="Lucia"
          value={state.first_name}
          onChange={(e) => set({ first_name: e.currentTarget.value })}
        />
        <Field
          label="Apellido paterno"
          autoComplete="family-name"
          placeholder="Hernández"
          value={state.apellido_paterno}
          onChange={(e) => set({ apellido_paterno: e.currentTarget.value })}
        />
        <Field
          label="Apellido materno (opcional)"
          placeholder="Reyes"
          value={state.apellido_materno}
          onChange={(e) => set({ apellido_materno: e.currentTarget.value })}
        />
        <DateField
          label="Fecha de nacimiento"
          value={state.date_of_birth}
          onChange={(value) => set({ date_of_birth: value })}
        />

        <label className={styles.selectField}>
          <span className={styles.selectLabel}>Género</span>
          <select
            className={styles.select}
            value={state.gender ?? ''}
            onChange={(e) =>
              set({ gender: (e.currentTarget.value || null) as WizardState['gender'] })
            }
          >
            <option value="" disabled>
              Selecciona…
            </option>
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className={styles.selectHint}>
            Lo usamos para calcular tu CURP y RFC — debe coincidir con tu
            identificación oficial.
          </span>
        </label>
      </div>

      {state.nationality_kind === 'mexicana' || state.has_curp === 'si' ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>
            {state.has_curp === 'si' && state.nationality_kind === 'otra'
              ? 'Datos identitarios (extranjero con CURP)'
              : 'Datos identitarios'}
          </span>

          {state.nationality_kind === 'mexicana' ? (
            <label className={styles.selectField}>
              <span className={styles.selectLabel}>Lugar de nacimiento (estado)</span>
              <select
                className={styles.select}
                value={state.place_of_birth_state}
                onChange={(e) => set({ place_of_birth_state: e.currentTarget.value })}
              >
                <option value="" disabled>
                  Selecciona un estado
                </option>
                {MEXICO_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Extranjero">Nací fuera de México</option>
              </select>
            </label>
          ) : null}

          {state.has_curp === 'si' ? (
            <Field
              label="CURP"
              placeholder="HERL900101MDFRYC09"
              value={state.curp}
              maxLength={18}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) =>
                set({
                  curp: e.currentTarget.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 18),
                })
              }
              hint="18 caracteres. Lo encuentras en tu acta o en gob.mx/curp"
            />
          ) : null}

          {state.nationality_kind === 'mexicana' ? (
            <Field
              label="RFC"
              placeholder="HERL900101AB1"
              value={state.rfc}
              maxLength={13}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) =>
                set({
                  rfc: e.currentTarget.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 13),
                })
              }
              hint="12 caracteres (persona moral) o 13 (persona física con homoclave)"
            />
          ) : null}
        </div>
      ) : null}

      {state.nationality_kind === 'otra' && state.has_curp === 'no' ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Datos identitarios (extranjero)</span>
          <label className={styles.selectField}>
            <span className={styles.selectLabel}>Nacionalidad</span>
            <select
              className={styles.select}
              value={state.nationality}
              onChange={(e) => set({ nationality: e.currentTarget.value })}
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {COUNTRIES_COMMON.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="País de nacimiento"
            placeholder="Argentina"
            value={state.place_of_birth_country}
            onChange={(e) => set({ place_of_birth_country: e.currentTarget.value })}
          />
          <Field
            label="Número de pasaporte"
            placeholder="G12345678"
            value={state.passport_number}
            onChange={(e) => set({ passport_number: e.currentTarget.value })}
          />
          <Field
            label="Número de Seguridad Social (opcional)"
            placeholder="ID de tu país de origen"
            value={state.ssn_or_foreign_id}
            onChange={(e) => set({ ssn_or_foreign_id: e.currentTarget.value })}
          />
        </div>
      ) : null}
    </div>
  );
}
