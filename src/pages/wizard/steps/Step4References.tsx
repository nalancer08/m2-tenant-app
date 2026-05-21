import { Field } from '../../../components/primitives/Field';
import { PhoneField } from '../../../components/primitives/PhoneField';
import { Button } from '../../../components/primitives/Button';
import { IconPlus, IconX } from '../../../components/icons';
import type { Action, ReferenceInput, WizardState } from '../state';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 4 — Referencias personales y arrendaticias. The investigation team
 * calls these contacts to verify the tenant's reliability. Minimum 2 to
 * advance; we don't cap a maximum here (10 on the API).
 */
export function Step4References({ state, dispatch }: StepProps) {
  const ensureMinimum = () => {
    if (state.references.length === 0) {
      dispatch({
        type: 'SET',
        patch: {
          references: [
            { full_name: '', phone: '', relation: '' },
            { full_name: '', phone: '', relation: '' },
          ],
        },
      });
    } else if (state.references.length === 1) {
      dispatch({
        type: 'SET',
        patch: {
          references: [...state.references, { full_name: '', phone: '', relation: '' }],
        },
      });
    }
  };

  // Initialize with 2 empty rows on first render
  if (state.references.length === 0) {
    queueMicrotask(ensureMinimum);
  }

  const update = (index: number, patch: Partial<ReferenceInput>) => {
    const next = state.references.map((r, i) => (i === index ? { ...r, ...patch } : r));
    dispatch({ type: 'SET', patch: { references: next } });
  };

  const add = () =>
    dispatch({
      type: 'SET',
      patch: {
        references: [
          ...state.references,
          { full_name: '', phone: '', relation: '' },
        ],
      },
    });

  const remove = (index: number) =>
    dispatch({
      type: 'SET',
      patch: { references: state.references.filter((_, i) => i !== index) },
    });

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Captura mínimo dos contactos que puedan dar referencia sobre ti. Idealmente
        un familiar y un compañero de trabajo o ex-arrendador. Los validamos por
        teléfono.
      </p>

      <div className={styles.itemList}>
        {state.references.map((r, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>Referencia {i + 1}</span>
              {state.references.length > 2 ? (
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={`Quitar referencia ${i + 1}`}
                  onClick={() => remove(i)}
                >
                  <IconX width={14} height={14} />
                </button>
              ) : null}
            </div>
            <Field
              label="Nombre completo"
              placeholder="Maria Gómez"
              value={r.full_name}
              onChange={(e) => update(i, { full_name: e.currentTarget.value })}
            />
            <PhoneField
              label="Teléfono"
              value={r.phone}
              onChange={(phone) => update(i, { phone })}
            />
            <Field
              label="Relación (opcional)"
              placeholder="Hermana, ex-arrendador, etc."
              value={r.relation}
              onChange={(e) => update(i, { relation: e.currentTarget.value })}
            />
          </div>
        ))}
      </div>

      <Button variant="ghost" fullWidth leftIcon={<IconPlus />} onClick={add}>
        Agregar otra referencia
      </Button>
    </div>
  );
}
