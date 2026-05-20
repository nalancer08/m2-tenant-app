import { Field } from '../../../components/primitives/Field';
import { FileSlot } from '../components/FileSlot';
import type { Action, WizardState } from '../state';
import type { TenantDocumentRow } from '../../../api/tenant-me';
import styles from './Step.module.css';

interface StepProps {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

const PAYSLIP_SLOTS = 3; // 3 meses de comprobantes
const ADDITIONAL_SLOTS = 4; // Erick: "Opciones (4 archivos)"

/**
 * Step 8 — Documentos. Three sections:
 *   1. Identificación (INE frente + reverso) — required
 *   2. Comprobantes de ingreso (3 slots, primero requerido, los otros opcionales)
 *   3. Documentos adicionales (4 slots libres)
 *
 * Plus a free-form "Notas para la investigación" textarea at the bottom.
 *
 * Each FileSlot owns its own upload state (picker → preview → upload →
 * done). After a successful upload it calls onChange and we patch the
 * wizard documents array; canAdvance in state.ts reads from there.
 */
export function Step8Documents({ state, dispatch }: StepProps) {
  const docsByType = (t: string) => state.documents.filter((d) => d.type === t);
  const ineFront = docsByType('ine_front')[0] ?? null;
  const ineBack = docsByType('ine_back')[0] ?? null;
  const payslips = docsByType('payslip');
  const additionals = docsByType('additional');

  const replaceForType = (t: string, doc: TenantDocumentRow | null, slotIndex?: number) => {
    // Replace strategy: keep all docs of other types untouched, then for
    // the type in question apply the change at the right index slot.
    const others = state.documents.filter((d) => d.type !== t);
    const same = state.documents.filter((d) => d.type === t);
    if (doc) {
      // upload: append
      dispatch({ type: 'SET', patch: { documents: [...others, ...same, doc] } });
      return;
    }
    // delete: drop the doc at slotIndex (or the only one for ine_front/back)
    if (slotIndex === undefined) {
      dispatch({ type: 'SET', patch: { documents: others.concat(same.slice(0, 0)) } });
      return;
    }
    const next = same.filter((_, i) => i !== slotIndex);
    dispatch({ type: 'SET', patch: { documents: [...others, ...next] } });
  };

  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Sube tu identificación y comprobantes. Validamos cada documento; archivos
        legibles y completos aceleran tu investigación.
      </p>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Identificación</span>
        <p className={styles.sectionIntro}>
          Captura frente y reverso de tu INE. Asegúrate que la foto esté en foco y
          se lea el texto completo.
        </p>
        <FileSlot
          label="INE — frente"
          type="ine_front"
          required
          existing={ineFront}
          accept="image/*,application/pdf"
          onChange={(doc) => {
            if (doc) replaceForType('ine_front', doc);
            else replaceForType('ine_front', null, 0);
          }}
        />
        <FileSlot
          label="INE — reverso"
          type="ine_back"
          required
          existing={ineBack}
          accept="image/*,application/pdf"
          onChange={(doc) => {
            if (doc) replaceForType('ine_back', doc);
            else replaceForType('ine_back', null, 0);
          }}
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Comprobantes de ingreso</span>
        <p className={styles.sectionIntro}>
          Tres meses recientes. PDF o foto. Si el archivo tiene contraseña, márcalo
          y captúrala — la guardamos cifrada con AES-256 para que la investigación
          pueda abrirlo.
        </p>
        {Array.from({ length: PAYSLIP_SLOTS }).map((_, i) => (
          <FileSlot
            key={i}
            label={`Comprobante ${i + 1}`}
            type="payslip"
            required={i === 0}
            existing={payslips[i] ?? null}
            allowPassword
            onChange={(doc) => {
              if (doc) replaceForType('payslip', doc);
              else replaceForType('payslip', null, i);
            }}
          />
        ))}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Documentos adicionales</span>
        <p className={styles.sectionIntro}>
          Opcional. Cualquier otro documento que mejore tu perfil: cancelación de
          deudas, contrato anterior, etc. (hasta {ADDITIONAL_SLOTS} archivos).
        </p>
        {Array.from({ length: ADDITIONAL_SLOTS }).map((_, i) => (
          <FileSlot
            key={i}
            label={`Extra ${i + 1}`}
            type="additional"
            existing={additionals[i] ?? null}
            allowPassword
            onChange={(doc) => {
              if (doc) replaceForType('additional', doc);
              else replaceForType('additional', null, i);
            }}
          />
        ))}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Notas para la investigación (opcional)</span>
        <Field
          label=""
          placeholder="¿Algo que el equipo deba saber sobre tus documentos? (ej. archivo X corresponde al mes Y, etc.)"
          value={state.document_notes}
          onChange={(e) =>
            dispatch({ type: 'SET', patch: { document_notes: e.currentTarget.value } })
          }
        />
      </div>
    </div>
  );
}
