import { Field } from '../../../components/primitives/Field';
import { Button } from '../../../components/primitives/Button';
import { IconPlus, IconX } from '../../../components/icons';
import { ChoiceCard } from '../components/ChoiceCard';
import type { Action, RoommateInput, WizardState } from '../state';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 2 — Roommates. Two-card toggle ("¿vas a dividir renta?"). If yes,
 * a dynamic list of roommates (name + phone) is shown — each one will
 * eventually receive their own invitation link for their own
 * investigation (future phase).
 */
export function Step2Roommates({ state, dispatch }: StepProps) {
  const setDivides = (divides_rent: boolean) =>
    dispatch({
      type: 'SET',
      patch: {
        divides_rent,
        roommates:
          divides_rent && state.roommates.length === 0
            ? [{ full_name: '', phone: '' }]
            : divides_rent
            ? state.roommates
            : [],
      },
    });

  const updateRoommate = (index: number, patch: Partial<RoommateInput>) => {
    const next = state.roommates.map((r, i) => (i === index ? { ...r, ...patch } : r));
    dispatch({ type: 'SET', patch: { roommates: next } });
  };

  const addRoommate = () =>
    dispatch({
      type: 'SET',
      patch: { roommates: [...state.roommates, { full_name: '', phone: '' }] },
    });

  const removeRoommate = (index: number) =>
    dispatch({
      type: 'SET',
      patch: { roommates: state.roommates.filter((_, i) => i !== index) },
    });

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        ¿Alguien más va a vivir contigo y vas a dividir la renta? Cada acompañante
        tendrá que hacer su propia investigación más adelante.
      </p>

      <div className={styles.choices}>
        <ChoiceCard
          label="No, voy a rentar solo(a)"
          description="Solo yo pago renta y firmo contrato"
          selected={state.divides_rent === false}
          onSelect={() => setDivides(false)}
        />
        <ChoiceCard
          label="Sí, voy a dividir renta"
          description="Hay roomies que también pagan parte"
          selected={state.divides_rent === true}
          onSelect={() => setDivides(true)}
        />
      </div>

      {state.divides_rent === true ? (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Roomies</span>
          <p className={styles.sectionIntro}>
            Captura su nombre y teléfono. Les enviaremos una invitación a su propio
            flujo cuando termines el tuyo.
          </p>

          <div className={styles.itemList}>
            {state.roommates.map((r, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>Roomie {i + 1}</span>
                  {state.roommates.length > 1 ? (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label={`Quitar roomie ${i + 1}`}
                      onClick={() => removeRoommate(i)}
                    >
                      <IconX width={14} height={14} />
                    </button>
                  ) : null}
                </div>
                <Field
                  label="Nombre completo"
                  placeholder="Diana Reyes"
                  value={r.full_name}
                  onChange={(e) => updateRoommate(i, { full_name: e.currentTarget.value })}
                />
                <Field
                  label="Teléfono (con lada)"
                  placeholder="+52 55 1234 5678"
                  inputMode="tel"
                  value={r.phone}
                  onChange={(e) => updateRoommate(i, { phone: e.currentTarget.value })}
                />
              </div>
            ))}
          </div>

          <Button variant="ghost" fullWidth leftIcon={<IconPlus />} onClick={addRoommate}>
            Agregar otro roomie
          </Button>
        </div>
      ) : null}
    </div>
  );
}
