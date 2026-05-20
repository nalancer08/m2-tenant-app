import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button } from '../../components/primitives/Button';
import { Logo } from '../../components/primitives/Logo';
import { IconArrowLeft, IconArrowRight } from '../../components/icons';
import { tenantMeApi } from '../../api/tenant-me';
import { useAuth } from '../../auth/AuthProvider';
import { Step1Regimen } from './steps/Step1Regimen';
import { Step2Roommates } from './steps/Step2Roommates';
import { Step3Personal } from './steps/Step3Personal';
import { Step4References } from './steps/Step4References';
import { Step5History } from './steps/Step5History';
import { Step6Address } from './steps/Step6Address';
import { Step7Employment } from './steps/Step7Employment';
import {
  canAdvance,
  initialState,
  reducer,
  STEP_TITLES,
  TOTAL_STEPS,
  type WizardState,
} from './state';
import styles from './WizardShell.module.css';

/**
 * The 9-step tenant flow, currently steps 1-7 (data entry). Steps 8 + 9
 * (documents + payment) land in T9.4 / T9.5.
 *
 * Persistence pattern: when the user taps "Siguiente", we call the
 * appropriate /tenant/me/* endpoint for the step they're leaving, then
 * advance the in-memory state. Going back doesn't persist anything —
 * the local state is the source of truth until they hit Siguiente again.
 */
export function WizardShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from /tenant/me/full once on mount
  const fullQ = useQuery({
    queryKey: ['tenant-me-full'],
    queryFn: () => tenantMeApi.full(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (fullQ.data) {
      dispatch({ type: 'HYDRATE', data: fullQ.data });
    }
  }, [fullQ.data]);

  const onNext = async () => {
    setError(null);
    setSaving(true);
    try {
      await persistCurrentStep(state);
      // Invalidate the hydrated cache so a reload reflects the latest server state
      queryClient.invalidateQueries({ queryKey: ['tenant-me-full'] });
      if (state.step >= TOTAL_STEPS) {
        // Steps 8 (docs) + 9 (pago) land in later phases. For now, mark
        // step=7 as last reached and bounce to a "ready for next phase"
        // placeholder.
        navigate('/', { replace: true });
      } else {
        dispatch({ type: 'NEXT' });
        // Scroll to top so the user sees the new step's header
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const ax = err as AxiosError<{ message?: string | string[] }>;
      const msg = ax.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(' · ') : msg ?? 'No pudimos guardar tu avance. Revisa tu conexión.',
      );
    } finally {
      setSaving(false);
    }
  };

  const onBack = () => {
    if (state.step <= 1) {
      // First step → exit wizard back to landing
      navigate('/', { replace: true });
      return;
    }
    dispatch({ type: 'BACK' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (fullQ.isLoading) {
    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <Logo size={24} />
          <span className={styles.headerBrand}>Metro Cuadrado</span>
        </header>
        <div className={styles.loading}>Cargando tu información…</div>
      </div>
    );
  }

  if (fullQ.error) {
    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <Logo size={24} />
          <span className={styles.headerBrand}>Metro Cuadrado</span>
        </header>
        <div className={styles.loading}>
          No pudimos cargar tu información.
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              logout();
              navigate('/auth/login', { replace: true });
            }}
          >
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  const stepNode = renderStep(state, dispatch);
  const canGo = canAdvance(state);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button type="button" className={styles.backIconBtn} onClick={onBack} aria-label="Atrás">
          <IconArrowLeft width={18} height={18} />
        </button>
        <div className={styles.headerCenter}>
          <span className={styles.progressLabel}>
            Paso {state.step} de {TOTAL_STEPS}
          </span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${(state.step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
        <div className={styles.headerBrand}>
          <Logo size={22} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.stepHeader}>
          <span className={styles.stepEyebrow}>
            <span className={styles.stepEyebrowDot} aria-hidden />
            Paso {state.step}
          </span>
          <h1 className={styles.stepTitle}>{STEP_TITLES[state.step]}</h1>
        </div>

        {stepNode}

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.footer}>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            disabled={!canGo || saving}
            loading={saving}
            rightIcon={<IconArrowRight />}
            onClick={onNext}
          >
            {state.step === TOTAL_STEPS ? 'Terminar y continuar' : 'Siguiente'}
          </Button>
          <Button variant="ghost" fullWidth onClick={onBack} disabled={saving}>
            Atrás
          </Button>
        </div>
      </main>
    </div>
  );
}

function renderStep(state: WizardState, dispatch: React.Dispatch<ReturnType<typeof reducer> extends WizardState ? Parameters<typeof reducer>[1] : never>) {
  switch (state.step) {
    case 1:
      return <Step1Regimen state={state} dispatch={dispatch} />;
    case 2:
      return <Step2Roommates state={state} dispatch={dispatch} />;
    case 3:
      return <Step3Personal state={state} dispatch={dispatch} />;
    case 4:
      return <Step4References state={state} dispatch={dispatch} />;
    case 5:
      return <Step5History state={state} dispatch={dispatch} />;
    case 6:
      return <Step6Address state={state} dispatch={dispatch} />;
    case 7:
      return <Step7Employment state={state} dispatch={dispatch} />;
    default:
      return null;
  }
}

/**
 * Persist the data the current step owns before advancing. Per step:
 *   1 → profile (regimen_fiscal + wizard_step)
 *   2 → roommates + profile.wizard_step
 *   3 → profile (names, identity, DOB, gender, RFC/CURP/passport)
 *   4 → references + profile.wizard_step
 *   5 → profile (history fields)
 *   6 → address + profile.wizard_step
 *   7 → employment + profile.wizard_step (+ mark wizard_completed if last)
 */
async function persistCurrentStep(state: WizardState): Promise<void> {
  const nextStep = Math.min(TOTAL_STEPS, state.step + 1);
  const isLast = state.step >= TOTAL_STEPS;

  switch (state.step) {
    case 1:
      await tenantMeApi.patchProfile({
        regimen_fiscal: state.regimen_fiscal!,
        wizard_step: nextStep,
      });
      return;

    case 2: {
      if (!state.deal_id) {
        throw new Error('Wizard sin deal_id — recarga la página');
      }
      await tenantMeApi.replaceRoommates({
        deal_id: state.deal_id,
        roommates: state.divides_rent ? state.roommates : [],
      });
      await tenantMeApi.patchProfile({ wizard_step: nextStep });
      return;
    }

    case 3:
      await tenantMeApi.patchProfile({
        first_name: state.first_name.trim(),
        apellido_paterno: state.apellido_paterno.trim(),
        apellido_materno: state.apellido_materno.trim() || undefined,
        date_of_birth: state.date_of_birth,
        gender: state.gender!,
        nationality:
          state.nationality_kind === 'mexicana' ? 'Mexicana' : state.nationality.trim(),
        place_of_birth_state:
          state.nationality_kind === 'mexicana' ? state.place_of_birth_state : undefined,
        place_of_birth_country:
          state.nationality_kind === 'mexicana' ? 'Mexico' : state.place_of_birth_country.trim(),
        curp: state.curp.trim() || undefined,
        rfc: state.rfc.trim() || undefined,
        passport_number: state.passport_number.trim() || undefined,
        ssn_or_foreign_id: state.ssn_or_foreign_id.trim() || undefined,
        wizard_step: nextStep,
      });
      return;

    case 4:
      await tenantMeApi.replaceReferences({
        references: state.references.map((r) => ({
          full_name: r.full_name.trim(),
          phone: r.phone.trim(),
          relation: r.relation.trim() || undefined,
        })),
      });
      await tenantMeApi.patchProfile({ wizard_step: nextStep });
      return;

    case 5:
      await tenantMeApi.patchProfile({
        education_level: state.education_level!,
        civil_status: state.civil_status!,
        minor_children_count: state.minor_children_count ?? 0,
        has_pets: state.has_pets,
        pets_detail: state.has_pets ? state.pets_detail.trim() : undefined,
        is_smoker: state.is_smoker,
        prior_eviction_disclosed: state.prior_eviction_disclosed,
        prior_legal_issues_disclosed: state.prior_legal_issues_disclosed,
        wizard_step: nextStep,
      });
      return;

    case 6:
      await tenantMeApi.patchAddress({
        street: state.address.street.trim(),
        exterior_number: state.address.exterior_number.trim() || undefined,
        interior_number: state.address.interior_number.trim() || undefined,
        neighborhood: state.address.neighborhood.trim() || undefined,
        municipality: state.address.municipality.trim() || undefined,
        city: state.address.city.trim(),
        state: state.address.state,
        postal_code: state.address.postal_code.trim(),
        living_situation: state.living_situation!,
        time_at_address_months: state.time_at_address_months ?? undefined,
        current_landlord_name:
          state.living_situation === 'rentado' ? state.current_landlord_name.trim() : undefined,
        current_landlord_phone:
          state.living_situation === 'rentado' ? state.current_landlord_phone.trim() : undefined,
      });
      await tenantMeApi.patchProfile({ wizard_step: nextStep });
      return;

    case 7:
      await tenantMeApi.patchEmployment({
        employment_status: state.employment_status!,
        industry: state.industry.trim() || undefined,
        occupation: state.occupation.trim() || undefined,
        company_name: state.company_name.trim() || undefined,
        position: state.position.trim() || undefined,
        company_website: state.company_website.trim() || undefined,
        work_address: state.work_address.trim() || undefined,
        tenure_months: state.tenure_months ?? undefined,
        income_source: state.income_source!,
        income_source_other:
          state.income_source === 'otro' ? state.income_source_other.trim() : undefined,
        monthly_net_income_cents: state.monthly_net_income_cents ?? undefined,
        hr_contact_name: state.hr_contact_name.trim() || undefined,
        hr_phone: state.hr_phone.trim() || undefined,
        buro_consent: state.buro_consent,
      });
      // T9.3 ends at step 7; documents (8) + pago (9) come later.
      await tenantMeApi.patchProfile({
        wizard_step: isLast ? TOTAL_STEPS : nextStep,
      });
      return;
  }
}
