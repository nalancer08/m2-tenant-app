import { ChoiceCard } from '../components/ChoiceCard';
import { WarningCard } from '../components/WarningCard';
import { REGIMEN_OPTIONS } from '../catalogs';
import type { Action, WizardState } from '../state';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

/**
 * Step 1 — Régimen fiscal. Two big radio cards (persona física / persona
 * moral). After picking, a tezontle-accented warning card lists the
 * documents the tenant should have on hand for Step 8 (uploads).
 */
export function Step1Regimen({ state, dispatch }: StepProps) {
  const set = (regimen_fiscal: typeof state.regimen_fiscal) =>
    dispatch({ type: 'SET', patch: { regimen_fiscal } });

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        ¿Vas a rentar a título personal o a nombre de una empresa? Esto cambia los
        documentos que te pediremos.
      </p>

      <div className={styles.choices}>
        {REGIMEN_OPTIONS.map((opt) => (
          <ChoiceCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={state.regimen_fiscal === opt.value}
            onSelect={() => set(opt.value)}
          />
        ))}
      </div>

      {state.regimen_fiscal === 'fisica' ? (
        <WarningCard
          title="Documentos que necesitarás"
          intro="Tenlos a la mano para no detener el flujo en el paso 8:"
          items={[
            'Identificación oficial vigente (INE o pasaporte)',
            'Comprobantes de ingresos de los últimos 3 meses',
            'Documentos adicionales que mejoren tu perfil (cancelación de deudas, etc.)',
          ]}
          footnote={
            <>
              <strong>Importante.</strong> Validamos cada documento con tecnología
              avanzada. La falsificación o alteración de documentos es un delito.
            </>
          }
        />
      ) : null}

      {state.regimen_fiscal === 'moral' ? (
        <WarningCard
          title="Documentos que necesitarás"
          intro="Tenlos a la mano para no detener el flujo en el paso 8:"
          items={[
            'Acta constitutiva de la empresa',
            'Poder notarial (si el Acta Constitutiva no otorga poderes al representante legal)',
            'Comprobantes de ingresos de los últimos 3 meses',
            'Constancia de Situación Fiscal',
            'Comprobante de domicilio de la empresa',
            'Opinión de Cumplimiento de Obligaciones Fiscales (≤ 3 meses)',
            'Identificación oficial del representante legal',
          ]}
          footnote={
            <>
              <strong>Importante.</strong> Validamos cada documento con tecnología
              avanzada. La falsificación o alteración de documentos es un delito.
            </>
          }
        />
      ) : null}
    </div>
  );
}
